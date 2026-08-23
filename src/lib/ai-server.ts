/**
 * Server-only OpenRouter integration.
 *
 * SECURITY: this file must never be imported directly by client components.
 * It reads `process.env.OPENROUTER_API_KEY` — a variable *without* the
 * `VITE_` prefix, which means Vite never bundles it into client JS. The
 * only way to reach these functions from the browser is through the
 * `createServerFn`-wrapped exports in `src/lib/ai-service.ts`, which proxy
 * the call over TanStack Start's RPC mechanism instead of exposing the key.
 *
 * Every AI JSON response is validated against a zod schema before it's
 * trusted — a free model returning malformed JSON (missing fields, wrong
 * types, prose wrapped around the object) is normalised to safe defaults
 * instead of crashing the caller or leaking garbage into the UI.
 */

import { z } from "zod";

const OPENROUTER_API_KEY = process.env["OPENROUTER_API_KEY"] ?? "";
const BASE_URL = "https://openrouter.ai/api/v1/chat/completions";
const SITE_URL = process.env["SITE_URL"] ?? "https://peasiprofile.app";

// Ordered by quality/preference. Qwen3 Next 80B A3B Instruct is the primary
// model (large 262K context, strong instruction following, free tier as of
// writing). The rest are fallbacks tried in order if a model is rate
// limited or unavailable — free OpenRouter models share a public pool with
// other apps, so 429s are common under load.
const MODEL_CHAIN = [
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "z-ai/glm-5.2:free",
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "google/gemma-4-31b-it:free",
] as const;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callOnce(model: string, systemPrompt: string, userMessage: string, maxTokens: number) {
  return fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": SITE_URL,
      "X-Title": "PeasiProfile Resume Builder",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    }),
  });
}

// ─── Rate limiting ────────────────────────────────────────────────────────
// Best-effort, in-memory sliding-window limiter to protect the free
// OpenRouter quota from runaway usage (e.g. a script hammering the
// endpoint). This intentionally avoids adding a new dependency (Redis,
// etc.) for a v1. Caveat: on serverless platforms with multiple warm
// instances, each instance keeps its own counts, so this is a soft
// per-instance limit, not a hard global guarantee — good enough to blunt
// accidental abuse, not a substitute for billing-tier enforcement later.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const requestLog = new Map<string, number[]>();

export function checkRateLimit(key: string): void {
  const now = Date.now();
  const timestamps = (requestLog.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    throw new Error("You're sending requests too quickly. Please wait a moment and try again.");
  }
  timestamps.push(now);
  requestLog.set(key, timestamps);
}

export async function callAI(systemPrompt: string, userMessage: string, maxTokens = 700): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error(
      "OPENROUTER_API_KEY is not set on the server. Add it to your .env file (no VITE_ prefix).",
    );
  }

  let lastError: Error | null = null;

  for (const model of MODEL_CHAIN) {
    for (let attempt = 0; attempt < 2; attempt++) {
      let res: Response;
      try {
        res = await callOnce(model, systemPrompt, userMessage, maxTokens);
      } catch (err) {
        lastError = err instanceof Error ? err : new Error("Network error contacting AI provider.");
        break;
      }

      if (res.ok) {
        const data = await res.json();
        const choice = data.choices?.[0];
        const text = choice?.message?.content?.trim();
        if (!text) {
          lastError = new Error("Empty response from AI.");
          break;
        }
        if (choice?.finish_reason === "length") {
          lastError = new Error("AI response was cut off before it finished.");
          break;
        }
        return text;
      }

      if (res.status === 429 && attempt === 0) {
        let waitMs = 3000;
        try {
          const body = await res.json();
          const hinted = body?.error?.metadata?.retry_after_seconds;
          if (typeof hinted === "number") waitMs = Math.min(hinted * 1000, 6000);
        } catch {
          // ignore parse failure, use default wait
        }
        await sleep(waitMs);
        continue;
      }

      const errText = await res.text().catch(() => res.statusText);
      lastError = new Error(`AI request failed: ${res.status} — ${errText}`);
      break;
    }
  }

  throw lastError ?? new Error("All AI providers are currently unavailable. Please try again shortly.");
}

/**
 * Free models frequently ignore "return only JSON" and wrap the object in
 * prose, markdown fences, or a leading sentence. This pulls out the first
 * {...} or [...] block instead of assuming the whole string is clean JSON.
 */
export function extractJSON<T>(raw: string): T {
  let cleaned = raw.trim().replace(/```(?:json)?/gi, "").trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // fall through to extraction
  }

  const objMatch = cleaned.match(/\{[\s\S]*\}/);
  const arrMatch = cleaned.match(/\[[\s\S]*\]/);
  const candidate = objMatch?.[0] ?? arrMatch?.[0];

  if (!candidate) {
    throw new Error("The AI didn't return a usable result — please try again.");
  }

  try {
    return JSON.parse(candidate) as T;
  } catch {
    throw new Error("The AI's response couldn't be read — please try again.");
  }
}

// ─── Response schemas ────────────────────────────────────────────────────────
// Every AI JSON response is validated against one of these before it's
// trusted. A response that fails validation falls back to safe defaults
// rather than propagating malformed data (missing fields, wrong types,
// unexpected shape) up to the UI.

export const atsResultSchema = z.object({
  score: z.number().min(0).max(100).catch(0),
  verdict: z.string().catch("Couldn't fully analyse the resume — please try again."),
  matchedKeywords: z.array(z.string()).catch([]),
  missingKeywords: z.array(z.string()).catch([]),
  suggestions: z
    .array(
      z.object({
        section: z.string().catch("General"),
        issue: z.string().catch(""),
        fix: z.string().catch(""),
      }),
    )
    .catch([]),
});
export type ATSResult = z.infer<typeof atsResultSchema>;

export function parseATSResult(raw: string): ATSResult {
  const extracted = extractJSON<unknown>(raw);
  const result = atsResultSchema.safeParse(extracted);
  if (result.success) {
    return { ...result.data, score: Math.round(result.data.score) };
  }
  // Schema validation failed entirely (e.g. not an object at all) — return
  // a safe, clearly-labelled empty result instead of throwing, so a single
  // malformed AI response doesn't take down the whole analysis screen.
  return atsResultSchema.parse({});
}

export function parseStringArray(raw: string, max: number): string[] {
  try {
    const parsed = extractJSON<unknown>(raw);
    const result = z.array(z.string()).safeParse(parsed);
    if (result.success) return result.data.slice(0, max);
  } catch {
    // fall through to regex fallback below
  }
  // Some free models return a comma/newline list instead of a JSON array
  // even when explicitly asked for one — recover quoted or bare words.
  return (
    raw
      .match(/"([^"]+)"/g)
      ?.map((s) => s.replace(/"/g, ""))
      .slice(0, max) ?? []
  );
}
