/**
 * OpenRouter AI service for resume writing assistance.
 *
 * Free OpenRouter models sit in a shared pool other apps hit too, so 429s
 * are common under load. To stay resilient we try a short list of good
 * free models in order, retrying each one briefly on a 429 before falling
 * through to the next model in the list.
 */

import type { ResumeData } from "@/features/resume-builder/types";

const OPENROUTER_API_KEY = import.meta.env["VITE_OPENROUTER_API_KEY"] as string;
const BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

// Ordered by quality; each is tried in turn if the previous one is
// rate-limited or unavailable. Keep this list to well-established, higher
// quality-score free models so a fallback never means a noticeably worse
// result.
const MODEL_CHAIN = [
  "z-ai/glm-5.2:free",
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "google/gemma-4-31b-it:free",
] as const;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callOnce(
  model: string,
  systemPrompt: string,
  userMessage: string,
  maxTokens: number,
) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": window.location.origin,
      "X-Title": "CareerGPT Resume Builder",
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
  return res;
}

async function callAI(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 700,
): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("VITE_OPENROUTER_API_KEY is not set. Add it to your .env file.");
  }

  let lastError: Error | null = null;

  for (const model of MODEL_CHAIN) {
    // Up to 2 attempts per model: one immediate, one after a short backoff
    // if we get rate-limited (matches the `retry_after_seconds` OpenRouter
    // typically returns, which is usually just a few seconds).
    for (let attempt = 0; attempt < 2; attempt++) {
      let res: Response;
      try {
        res = await callOnce(model, systemPrompt, userMessage, maxTokens);
      } catch (err) {
        // Network-level failure — try the next model rather than retrying
        // the same one, in case that provider is fully down.
        lastError = err instanceof Error ? err : new Error("Network error contacting AI provider.");
        break;
      }

      if (res.ok) {
        const data = await res.json();
        const choice = data.choices?.[0];
        const text = choice?.message?.content?.trim();
        if (!text) {
          lastError = new Error("Empty response from AI.");
          break; // try next model
        }
        // If the model ran out of tokens mid-answer, the JSON (or bullet
        // list) is likely cut off and unusable — treat it like a failure
        // and fall through to the next model rather than returning
        // truncated text that will fail to parse downstream.
        if (choice?.finish_reason === "length") {
          lastError = new Error("AI response was cut off before it finished.");
          break;
        }
        return text;
      }

      if (res.status === 429 && attempt === 0) {
        // Rate-limited — read the suggested wait time if present, then retry
        // this same model once before giving up on it.
        let waitMs = 3000;
        try {
          const body = await res.json();
          const hinted = body?.error?.metadata?.retry_after_seconds;
          if (typeof hinted === "number") waitMs = Math.min(hinted * 1000, 6000);
        } catch {
          // ignore parse failure, use default wait
        }
        await sleep(waitMs);
        continue; // retry same model
      }

      // Any other error (or a second 429): stop retrying this model and
      // fall through to the next one in the chain.
      const errText = await res.text().catch(() => res.statusText);
      lastError = new Error(`AI request failed: ${res.status} — ${errText}`);
      break;
    }
  }

  throw lastError ?? new Error("All AI providers are currently unavailable. Please try again shortly.");
}

/**
 * Free models frequently ignore "return only JSON" and wrap the object in
 * prose, markdown fences, or a leading sentence like "The resume...". This
 * pulls out the first {...} or [...] block instead of assuming the whole
 * string is clean JSON, and gives a clear error if none is found.
 */
function extractJSON<T>(raw: string): T {
  let cleaned = raw.trim();
  // Strip markdown code fences if present
  cleaned = cleaned.replace(/```(?:json)?/gi, "").trim();

  // If the whole string already parses, use it directly
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // fall through to extraction
  }

  // Find the first balanced { ... } or [ ... ] block in the text
  const objMatch = cleaned.match(/\{[\s\S]*\}/);
  const arrMatch = cleaned.match(/\[[\s\S]*\]/);
  const candidate = objMatch?.[0] ?? arrMatch?.[0];

  if (!candidate) {
    throw new Error(
      "The AI didn't return a usable result — please try again.",
    );
  }

  try {
    return JSON.parse(candidate) as T;
  } catch {
    throw new Error(
      "The AI's response couldn't be read — please try again.",
    );
  }
}

// ─── Professional Summary ────────────────────────────────────────────────────

export async function generateSummary(params: {
  fullName: string;
  title: string;
  yearsOfExperience?: string;
  topSkills?: string[];
  recentRole?: string;
  recentCompany?: string;
}): Promise<string> {
  const system = `You are an expert resume writer. Write a concise, compelling professional summary for a resume.
Rules:
- 2–4 sentences only
- Lead with the person's role and years of experience
- Include 1–2 specific strengths or achievements
- End with what they bring to a new role
- No generic filler ("hardworking", "passionate", "team player")
- No first-person pronouns (no "I", "my")
- Plain text only, no bullet points or markdown`;

  const user = `Write a professional summary for:
Name: ${params.fullName || "the candidate"}
Title: ${params.title || "Professional"}
${params.yearsOfExperience ? `Years of experience: ${params.yearsOfExperience}` : ""}
${params.recentRole?.trim() ? `Most recent role: ${params.recentRole} at ${params.recentCompany || "a company"}` : ""}
${params.topSkills?.length ? `Top skills: ${params.topSkills.join(", ")}` : ""}`;

  return callAI(system, user);
}

// ─── Experience Bullet Points ────────────────────────────────────────────────

export async function generateExperienceBullets(params: {
  role: string;
  company: string;
  existingBullets?: string[];
}): Promise<string[]> {
  const system = `You are an expert resume writer specialising in impactful bullet points.
Rules:
- Write exactly 3 strong bullet points
- Start each with a powerful action verb (Led, Built, Reduced, Increased, Launched, etc.)
- Include quantifiable metrics where plausible (%, $, time saved, scale)
- Each bullet is one concise sentence, max 20 words
- No soft skills, no generic filler
- Return ONLY the 3 bullets, one per line, no numbering, no dashes, no markdown`;

  const existing = params.existingBullets?.filter(Boolean).join("\n");
  const user = `Generate 3 strong resume bullet points for:
Role: ${params.role || "this position"}
Company: ${params.company || "the company"}
${existing ? `Existing bullets (improve upon these or write complementary ones):\n${existing}` : ""}`;

  const raw = await callAI(system, user);
  return raw
    .split("\n")
    .map((l) => l.replace(/^[-•*\d.)\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 3);
}

// ─── Project Description ─────────────────────────────────────────────────────

export async function generateProjectDescription(params: {
  name: string;
  tech?: string[];
  existingDescription?: string;
}): Promise<string> {
  const system = `You are an expert resume writer.
Write a 1–2 sentence project description for a resume.
Rules:
- Describe what the project does and the impact/problem it solves
- Mention scale or users if plausible
- If tech is provided, weave in 1–2 technologies naturally
- No first-person pronouns
- Plain text, no markdown`;

  const user = `Write a project description for:
Project name: ${params.name || "this project"}
${params.tech?.length ? `Tech stack: ${params.tech.join(", ")}` : ""}
${params.existingDescription ? `Existing description (improve it): ${params.existingDescription}` : ""}`;

  return callAI(system, user);
}

// ─── ATS Score Checker ───────────────────────────────────────────────────────

export interface ATSResult {
  score: number; // 0–100
  verdict: string; // one-line summary e.g. "Strong match — a few keywords missing"
  matchedKeywords: string[]; // keywords found/present (role-relevant terms in general mode)
  missingKeywords: string[]; // important keywords absent (gaps in general mode, JD gaps in match mode)
  suggestions: { section: string; issue: string; fix: string }[]; // actionable fixes
}

function normalizeATSResult(parsed: Partial<ATSResult>): ATSResult {
  return {
    score: typeof parsed.score === "number" ? Math.max(0, Math.min(100, Math.round(parsed.score))) : 0,
    verdict: typeof parsed.verdict === "string" ? parsed.verdict : "Couldn't fully analyse the resume — please try again.",
    matchedKeywords: Array.isArray(parsed.matchedKeywords) ? parsed.matchedKeywords.map(String) : [],
    missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords.map(String) : [],
    suggestions: Array.isArray(parsed.suggestions)
      ? parsed.suggestions
          .filter((s): s is { section: string; issue: string; fix: string } => !!s && typeof s === "object")
          .map((s) => ({
            section: String(s.section ?? "General"),
            issue: String(s.issue ?? ""),
            fix: String(s.fix ?? ""),
          }))
      : [],
  };
}

/**
 * Stage 1 — general ATS-friendliness check, no job description required.
 * Scores how well an ATS (and a recruiter skimming it) can parse and
 * evaluate the resume on its own: structure, quantified impact, standard
 * section usage, and role-appropriate keyword density for whatever role
 * the resume itself indicates (from the person's title/experience).
 */
export async function checkGeneralATSScore(params: {
  resumeText: string;
}): Promise<ATSResult> {
  const system = `You are an expert ATS (Applicant Tracking System) analyser and resume coach.

Respond with ONLY a single JSON object. Do not include any explanation, preamble, commentary, or markdown code fences before or after it. Your entire response must start with { and end with }.

The JSON must follow this exact shape:
{
  "score": <integer 0-100>,
  "verdict": "<one sentence summary of overall ATS-friendliness>",
  "matchedKeywords": ["<strong role-relevant keyword/skill already present>", ...],
  "missingKeywords": ["<important keyword/skill a resume in this role would typically need but is missing>", ...],
  "suggestions": [
    { "section": "<section name>", "issue": "<what is wrong>", "fix": "<specific fix>" },
    ...
  ]
}

Rules:
- Infer the target role from the resume's own title/experience — there is no job description to compare against.
- score: weight structure & parseability (30%), quantified achievements (30%), role-relevant keyword strength (25%), completeness of standard sections (15%)
- matchedKeywords: up to 8 strong, specific skills/keywords already well-represented in the resume for its inferred role
- missingKeywords: up to 8 important skills/keywords typically expected for this role that are absent or weak
- suggestions: exactly 3 specific, actionable improvements — be concrete but concise (under 20 words each for issue and fix)
- verdict: honest, specific, under 15 words
- Keep the entire JSON response compact — no extra whitespace or repeated information
- Output raw JSON only — no text before or after it`;

  const user = `Resume:
${params.resumeText.slice(0, 4000)}

Remember: respond with ONLY the JSON object described in the system prompt.`;

  const raw = await callAI(system, user, 1200);
  return normalizeATSResult(extractJSON<Partial<ATSResult>>(raw));
}

/**
 * Stage 2 — job-specific match score once the person supplies a real job
 * description. Compares the resume directly against that JD's requirements.
 */
export async function checkJobMatchATSScore(params: {
  resumeText: string;
  jobDescription: string;
}): Promise<ATSResult> {
  const system = `You are an expert ATS (Applicant Tracking System) analyser and resume coach.

Respond with ONLY a single JSON object. Do not include any explanation, preamble, commentary, or markdown code fences before or after it. Your entire response must start with { and end with }.

The JSON must follow this exact shape:
{
  "score": <integer 0-100>,
  "verdict": "<one sentence summary of the match>",
  "matchedKeywords": ["<keyword>", ...],
  "missingKeywords": ["<keyword>", ...],
  "suggestions": [
    { "section": "<section name>", "issue": "<what is wrong>", "fix": "<specific fix>" },
    ...
  ]
}

Rules:
- score: weight keyword matches (50%), quantified achievements (20%), relevant experience (20%), formatting/completeness (10%)
- matchedKeywords: up to 8 specific skills/tools/qualifications from the JD that appear in the resume
- missingKeywords: up to 8 important skills/tools/qualifications from the JD missing from the resume
- suggestions: exactly 3 specific, actionable improvements — be concrete but concise (under 20 words each for issue and fix)
- verdict: honest, specific, under 15 words
- Keep the entire JSON response compact — no extra whitespace or repeated information
- Output raw JSON only — no text before or after it`;

  const user = `Job Description:
${params.jobDescription.slice(0, 3000)}

Resume:
${params.resumeText.slice(0, 3000)}

Remember: respond with ONLY the JSON object described in the system prompt.`;

  const raw = await callAI(system, user, 1200);
  return normalizeATSResult(extractJSON<Partial<ATSResult>>(raw));
}

/** @deprecated Use checkJobMatchATSScore. Kept as an alias to avoid breaking existing imports. */
export const checkATSScore = checkJobMatchATSScore;

// ─── Resume to plain text ────────────────────────────────────────────────────

export function resumeToText(data: ResumeData): string {
  const lines: string[] = [];
  const p = data.personal;
  lines.push(p.fullName, p.title, p.email, p.phone, p.location, p.linkedin, p.github, p.website);
  if (data.summary) lines.push(data.summary);
  for (const exp of data.experience) {
    lines.push(`${exp.role} at ${exp.company}`, ...exp.bullets);
  }
  for (const edu of data.education) {
    lines.push(`${edu.degree} ${edu.field} at ${edu.school}`, edu.details);
  }
  for (const sg of data.skills) {
    lines.push(sg.category, sg.items.join(", "));
  }
  for (const proj of data.projects) {
    lines.push(proj.name, proj.description, proj.tech.join(", "));
  }
  for (const cert of data.certifications) {
    lines.push(`${cert.name} — ${cert.issuer}`);
  }
  return lines.filter(Boolean).join("\n");
}

export async function suggestSkills(params: {
  title: string;
  existingSkills?: string[];
}): Promise<string[]> {
  const system = `You are a career expert.
Suggest relevant technical and professional skills for a resume.
Rules:
- Return exactly 8–10 skills as a JSON array of strings, e.g. ["React", "Node.js", ...]
- Focus on in-demand, specific skills for the given role
- Avoid skills already in the existing list
- No soft skills (no "communication", "teamwork")
- Return ONLY valid JSON, no explanation, no markdown`;

  const user = `Suggest skills for: ${params.title || "Software Engineer"}
${params.existingSkills?.length ? `Already has: ${params.existingSkills.join(", ")}` : ""}`;

  const raw = await callAI(system, user);
  try {
    const parsed = extractJSON<unknown>(raw);
    if (Array.isArray(parsed)) return parsed.map(String).slice(0, 10);
  } catch {
    // fallback: extract quoted words directly from the raw text
    return raw.match(/"([^"]+)"/g)?.map((s) => s.replace(/"/g, "")).slice(0, 10) ?? [];
  }
  return [];
}