/**
 * Client-safe AI service for resume writing assistance.
 *
 * Every export here has the exact same name and signature as before —
 * existing call sites (forms, ATS checker) do not need to change. What's
 * different is the implementation: each function is now a TanStack Start
 * server function (`createServerFn`). The actual OpenRouter call, model
 * fallback chain, and API key live only in `src/lib/ai-server.ts`, which
 * never ships to the browser. Calling one of these exports from client
 * code makes an RPC request to the server; the key itself is never part
 * of the client bundle.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ResumeData } from "@/features/resume-builder/types";
import {
  scoreResumeDeterministic,
  type AtsCheck,
  type CategoryScore,
} from "@/features/resume-builder/utils/ats-score";

// ─── Server functions ────────────────────────────────────────────────────────
// Defined here (not in ai-server.ts) so TanStack Start's compiler can see
// the createServerFn calls and split client/server code correctly. The
// heavy lifting (fetch, model chain, JSON parsing/validation) is imported
// from the server-only module and only ever executes inside .handler().

const generateSummaryFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      uid: z.string().optional(),
      fullName: z.string(),
      title: z.string(),
      yearsOfExperience: z.string().optional(),
      topSkills: z.array(z.string()).optional(),
      recentRole: z.string().optional(),
      recentCompany: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { callAI, checkRateLimit } = await import("@/lib/ai-server");
    checkRateLimit(data.uid ?? "anonymous");
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
Name: ${data.fullName || "the candidate"}
Title: ${data.title || "Professional"}
${data.yearsOfExperience ? `Years of experience: ${data.yearsOfExperience}` : ""}
${data.recentRole?.trim() ? `Most recent role: ${data.recentRole} at ${data.recentCompany || "a company"}` : ""}
${data.topSkills?.length ? `Top skills: ${data.topSkills.join(", ")}` : ""}`;

    return callAI(system, user);
  });

const generateExperienceBulletsFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      uid: z.string().optional(),
      role: z.string(),
      company: z.string(),
      existingBullets: z.array(z.string()).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { callAI, checkRateLimit } = await import("@/lib/ai-server");
    checkRateLimit(data.uid ?? "anonymous");
    const system = `You are an expert resume writer specialising in impactful bullet points.
Rules:
- Write exactly 3 strong bullet points
- Start each with a powerful action verb (Led, Built, Reduced, Increased, Launched, etc.)
- Include quantifiable metrics only if the person's existing content already implies them — never invent numbers
- Each bullet is one concise sentence, max 20 words
- No soft skills, no generic filler
- Return ONLY the 3 bullets, one per line, no numbering, no dashes, no markdown`;

    const existing = data.existingBullets?.filter(Boolean).join("\n");
    const user = `Generate 3 strong resume bullet points for:
Role: ${data.role || "this position"}
Company: ${data.company || "the company"}
${existing ? `Existing bullets (improve upon these or write complementary ones):\n${existing}` : ""}`;

    const raw = await callAI(system, user);
    return raw
      .split("\n")
      .map((l: string) => l.replace(/^[-•*\d.)\s]+/, "").trim())
      .filter(Boolean)
      .slice(0, 3);
  });

const generateProjectDescriptionFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      uid: z.string().optional(),
      name: z.string(),
      tech: z.array(z.string()).optional(),
      existingDescription: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { callAI, checkRateLimit } = await import("@/lib/ai-server");
    checkRateLimit(data.uid ?? "anonymous");
    const system = `You are an expert resume writer.
Write a 1–2 sentence project description for a resume.
Rules:
- Describe what the project does and the impact/problem it solves, based only on what's given
- Mention scale or users only if already implied by the input — never invent metrics
- If tech is provided, weave in 1–2 technologies naturally
- No first-person pronouns
- Plain text, no markdown`;

    const user = `Write a project description for:
Project name: ${data.name || "this project"}
${data.tech?.length ? `Tech stack: ${data.tech.join(", ")}` : ""}
${data.existingDescription ? `Existing description (improve it): ${data.existingDescription}` : ""}`;

    return callAI(system, user);
  });

const checkJobMatchATSScoreFn = createServerFn({ method: "POST" })
  .validator(
    z.object({ uid: z.string().optional(), resumeText: z.string(), jobDescription: z.string() }),
  )
  .handler(async ({ data }) => {
    const { callAI, parseATSResult, checkRateLimit } = await import("@/lib/ai-server");
    checkRateLimit(data.uid ?? "anonymous");
    const system = `You are an expert ATS (Applicant Tracking System) analyser and resume coach performing a SEMANTIC comparison between a resume and a job description — not a literal text match.

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
- score: weight semantic skill/requirement match (50%), quantified achievements (20%), relevant experience (20%), formatting/completeness (10%)
- Treat skills as matched if they are semantically or practically equivalent, even if worded differently — e.g. "JS" = "JavaScript", "K8s" = "Kubernetes", "led a team" satisfies a "leadership" requirement, "built REST endpoints" satisfies an "API development" requirement. Do not mark something missing just because the exact JD wording isn't present verbatim.
- Conversely, do not mark a skill matched on a superficial word match alone if the resume's actual context means something different (e.g. "Java" resume experience does not satisfy a "JavaScript" requirement).
- matchedKeywords: up to 8 specific skills/tools/qualifications from the JD that the resume genuinely satisfies (in the resume's own wording, not the JD's)
- missingKeywords: up to 8 important skills/tools/qualifications from the JD that the resume does not satisfy, even after accounting for synonyms and equivalent phrasing
- suggestions: exactly 3 specific, actionable improvements — be concrete but concise (under 20 words each for issue and fix). Never suggest claiming a skill the resume doesn't support.
- verdict: honest, specific, under 15 words
- Keep the entire JSON response compact — no extra whitespace or repeated information
- Output raw JSON only — no text before or after it`;

    const user = `Job Description:
${data.jobDescription.slice(0, 3000)}

Resume:
${data.resumeText.slice(0, 3000)}

Remember: respond with ONLY the JSON object described in the system prompt.`;

    const raw = await callAI(system, user, 1200);
    const result = parseATSResult(raw);
    // Deterministic cleanup pass: collapse any synonym duplicates the model
    // still listed separately (e.g. "JS" in matched and "JavaScript" in
    // missing) using the static synonym table — cheap, exact, and doesn't
    // cost another AI call.
    const { dedupeSkillsBySynonym } =
      await import("@/features/resume-builder/utils/skill-synonyms");
    return {
      ...result,
      matchedKeywords: dedupeSkillsBySynonym(result.matchedKeywords),
      missingKeywords: dedupeSkillsBySynonym(result.missingKeywords, result.matchedKeywords),
    };
  });

const suggestSkillsFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      uid: z.string().optional(),
      title: z.string(),
      existingSkills: z.array(z.string()).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { callAI, parseStringArray, checkRateLimit } = await import("@/lib/ai-server");
    checkRateLimit(data.uid ?? "anonymous");
    const system = `You are a career expert.
Suggest relevant technical and professional skills for a resume.
Rules:
- Return exactly 8–10 skills as a JSON array of strings, e.g. ["React", "Node.js", ...]
- Focus on in-demand, specific skills for the given role
- Avoid skills already in the existing list
- No soft skills (no "communication", "teamwork")
- Return ONLY valid JSON, no explanation, no markdown`;

    const user = `Suggest skills for: ${data.title || "Software Engineer"}
${data.existingSkills?.length ? `Already has: ${data.existingSkills.join(", ")}` : ""}`;

    const raw = await callAI(system, user);
    return parseStringArray(raw, 10);
  });

const parseResumeTextFn = createServerFn({ method: "POST" })
  .validator(z.object({ uid: z.string().optional(), resumeText: z.string() }))
  .handler(async ({ data }) => {
    const { callAI, parseParsedResume, checkRateLimit } = await import("@/lib/ai-server");
    checkRateLimit(data.uid ?? "anonymous");
    const system = `You extract structured resume data from raw resume text (extracted from an uploaded PDF/DOCX, so spacing and line breaks may be imperfect).

Respond with ONLY a single JSON object, no explanation, no markdown fences. Your entire response must start with { and end with }.

{
  "personal": { "fullName": "", "title": "", "email": "", "phone": "", "location": "", "website": "", "linkedin": "", "github": "" },
  "summary": "",
  "experience": [{ "role": "", "company": "", "location": "", "startDate": "", "endDate": "", "current": false, "bullets": [] }],
  "education": [{ "school": "", "degree": "", "field": "", "startDate": "", "endDate": "", "gpa": "", "details": "" }],
  "skills": [{ "category": "", "items": [] }],
  "projects": [{ "name": "", "description": "", "tech": [], "link": "" }],
  "certifications": [{ "name": "", "issuer": "", "date": "" }],
  "uncertainFields": []
}

CRITICAL RULES — this is the most important part of your job:
- NEVER invent, guess, or fill in anything not clearly present in the text. If a field isn't in the text, leave it as an empty string or empty array.
- NEVER invent company names, job titles, dates, metrics, technologies, or achievements.
- Dates: use whatever format the source uses (e.g. "2022-03", "Mar 2022", "2022"); do not normalize or guess a missing day/month.
- "current": true only if the text explicitly says "Present", "Current", or equivalent for that role.
- If you're genuinely unsure whether something extracted correctly (e.g. text was garbled, a date is ambiguous, a bullet might belong to a different role), still include your best-effort extraction but add a short plain-English description of the uncertainty to "uncertainFields" (e.g. "End date for the Acme Corp role is ambiguous", "Could not confidently split skills into categories").
- Skills: group into categories only if the source text itself groups them (e.g. "Languages: ...", "Tools: ..."); otherwise put everything in one group with an empty category name.
- Output raw JSON only — no text before or after it.`;

    const user = `Resume text:\n${data.resumeText.slice(0, 6000)}\n\nRemember: respond with ONLY the JSON object described in the system prompt. Never fabricate information.`;

    const raw = await callAI(system, user, 2500);
    return parseParsedResume(raw);
  });

const optimizeResumeFn = createServerFn({ method: "POST" })
  .validator(z.object({ uid: z.string().optional(), payload: z.string() }))
  .handler(async ({ data }) => {
    const { callAI, parseResumeOptimizationResult, checkRateLimit } =
      await import("@/lib/ai-server");
    checkRateLimit(data.uid ?? "anonymous");
    const system = `You are an expert resume editor. You will be given a resume as JSON, including stable ids for each experience entry and project. Suggest improved rewrites for weak content — do NOT touch entries that are already strong.

Respond with ONLY a single JSON object, no explanation, no markdown fences. Your entire response must start with { and end with }.

{
  "summary": "<improved summary>" or null if the existing summary is already strong or empty,
  "experienceBullets": [{ "experienceId": "<id from input>", "bulletIndex": <0-based index>, "after": "<improved bullet>" }],
  "projectDescriptions": [{ "projectId": "<id from input>", "after": "<improved description>" }]
}

CRITICAL RULES:
- NEVER invent facts, numbers, metrics, technologies, or achievements that aren't already stated or clearly implied by the existing text. If a bullet has no numbers, improve its clarity/impact/wording WITHOUT adding a fabricated number.
- Only include an entry if you have a genuine, specific improvement — better action verb, tighter wording, clearer impact, more professional tone, improved ATS phrasing. If something is already well-written, leave it out entirely — do not "improve" it just to have output.
- Use the exact experienceId / projectId values from the input, unchanged.
- Keep each rewrite roughly the same length as the original (don't balloon a one-line bullet into a paragraph).
- Preserve the person's actual meaning — you are polishing, not reinventing their career.
- Output raw JSON only.`;

    const user = `Resume JSON:\n${data.payload.slice(0, 6000)}\n\nRemember: respond with ONLY the JSON object described in the system prompt. Never fabricate facts.`;

    const raw = await callAI(system, user, 2500);
    return parseResumeOptimizationResult(raw);
  });

// ─── Public client API ───────────────────────────────────────────────────────
// Same names/signatures as the original client-side module. Internally
// these just call the server functions above.

export interface ATSResult {
  score: number;
  verdict: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: { section: string; issue: string; fix: string }[];
}

export async function generateSummary(params: {
  uid?: string;
  fullName: string;
  title: string;
  yearsOfExperience?: string;
  topSkills?: string[];
  recentRole?: string;
  recentCompany?: string;
}): Promise<string> {
  return generateSummaryFn({ data: params });
}

export async function generateExperienceBullets(params: {
  uid?: string;
  role: string;
  company: string;
  existingBullets?: string[];
}): Promise<string[]> {
  return generateExperienceBulletsFn({ data: params });
}

export async function generateProjectDescription(params: {
  uid?: string;
  name: string;
  tech?: string[];
  existingDescription?: string;
}): Promise<string> {
  return generateProjectDescriptionFn({ data: params });
}

// ─── Resume Health (fully deterministic — no AI call) ───────────────────────
// Earlier this blended in a bounded AI slice for "keyword relevance" and
// "content quality". In practice a general, no-JD score can't judge keyword
// relevance meaningfully anyway (relevant to *what* role, compared against
// *what*?) — that comparison only makes sense once there's an actual job
// description to match against, which is exactly what Stage 2 below does.
// So the AI budget was moved there, where it's the right tool for the job:
// semantic matching, skill-synonym reasoning, and content suggestions. This
// scanner is now 100% deterministic — same resume, same score, always, with
// no "AI unavailable" possibility at all.

export interface ResumeHealthResult {
  /** 0-100, fully deterministic — reruns on an unchanged resume always
   *  produce the exact same score. */
  score: number;
  categories: CategoryScore[];
  checks: AtsCheck[];
  strengths: string[];
  criticalProblems: string[];
  improvements: string[];
}

/**
 * The resume health score used by the ATS Scanner's general (no-JD) check.
 * Runs the deterministic scorer and derives strengths/problems/improvements
 * straight from the check results — no network call, so it's instant and
 * always reproducible.
 */
export async function analyzeResumeHealth(params: {
  resumeData: ResumeData;
}): Promise<ResumeHealthResult> {
  const deterministic = scoreResumeDeterministic(params.resumeData);

  const criticalProblems = deterministic.checks
    .filter((c) => c.severity === "fail")
    .map((c) => c.detail ?? c.label)
    .slice(0, 4);

  const improvements = deterministic.checks
    .filter((c) => c.severity === "warn")
    .map((c) => c.detail ?? c.label)
    .slice(0, 4);

  const strengths = deterministic.categories
    .filter((c) => c.max > 0 && c.score / c.max >= 0.85)
    .sort((a, b) => b.score / b.max - a.score / a.max)
    .slice(0, 3)
    .map((c) => `Strong ${c.label.toLowerCase()}.`);

  return {
    score: deterministic.score,
    categories: deterministic.categories,
    checks: deterministic.checks,
    strengths,
    criticalProblems,
    improvements,
  };
}

/**
 * Stage 2 — job-specific match score against a real job description.
 */
export async function checkJobMatchATSScore(params: {
  uid?: string;
  resumeText: string;
  jobDescription: string;
}): Promise<ATSResult> {
  return checkJobMatchATSScoreFn({ data: params });
}

/** @deprecated Use checkJobMatchATSScore. Kept as an alias to avoid breaking existing imports. */
export const checkATSScore = checkJobMatchATSScore;

export async function suggestSkills(params: {
  uid?: string;
  title: string;
  existingSkills?: string[];
}): Promise<string[]> {
  return suggestSkillsFn({ data: params });
}

// ─── Upload & parse existing resume ─────────────────────────────────────────

export interface UploadedResumeResult {
  resumeData: ResumeData;
  /** Plain-English notes on anything the AI wasn't confident about —
   *  surfaced in the UI so the person double-checks before saving,
   *  rather than the gap silently passing as a complete resume. */
  uncertainFields: string[];
}

/**
 * Turns already-extracted resume text (see extractTextFromResumeFile in
 * features/resume-builder/utils/resume-file-parser.ts, which does the
 * PDF/DOCX reading client-side) into a real, editable ResumeData object.
 * Never fabricates — any field the model wasn't confident about is left
 * empty and named in uncertainFields for the person to fill in themselves.
 */
export async function parseUploadedResume(params: {
  uid?: string;
  resumeText: string;
}): Promise<UploadedResumeResult> {
  const { makeId, blankResume } = await import("@/features/resume-builder/sample-data");
  const parsed = await parseResumeTextFn({ data: params });
  const base = blankResume();

  const resumeData: ResumeData = {
    ...base,
    personal: { ...base.personal, ...parsed.personal, photo: "" },
    summary: parsed.summary,
    experience: parsed.experience.map((e) => ({ id: makeId("exp"), ...e })),
    education: parsed.education.map((e) => ({ id: makeId("edu"), ...e })),
    skills: parsed.skills
      .filter((s) => s.items.length > 0)
      .map((s) => ({ id: makeId("skl"), ...s })),
    projects: parsed.projects.map((p) => ({ id: makeId("proj"), ...p })),
    certifications: parsed.certifications.map((c) => ({ id: makeId("cert"), ...c })),
  };

  return { resumeData, uncertainFields: parsed.uncertainFields };
}

// ─── Resume to plain text ────────────────────────────────────────────────────
// Pure client-safe utility — no AI call, stays as a normal function.

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

// ─── Resume Optimizer (accept/reject diffs) ─────────────────────────────────

export interface ResumeChange {
  /** Stable key for this suggestion within the batch (for React keys / accept-reject tracking). */
  id: string;
  type: "summary" | "experience-bullet" | "project-description";
  /** Human label for the diff card, e.g. "Acme Corp — bullet 2". */
  label: string;
  before: string;
  after: string;
}

/**
 * Runs the AI optimizer and returns a list of proposed changes. Every
 * "before" value is read directly from the ResumeData passed in — never
 * from what the model echoed back — so an accepted change can never
 * apply against stale or hallucinated original text. No-op suggestions
 * (after === before, or empty) are filtered out here too.
 */
export async function optimizeResume(params: {
  uid?: string;
  resumeData: ResumeData;
}): Promise<ResumeChange[]> {
  const { resumeData } = params;

  const payload = JSON.stringify({
    summary: resumeData.summary,
    experience: resumeData.experience.map((e) => ({
      id: e.id,
      role: e.role,
      company: e.company,
      bullets: e.bullets,
    })),
    projects: resumeData.projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      tech: p.tech,
    })),
  });

  const result = await optimizeResumeFn({
    data: { ...(params.uid ? { uid: params.uid } : {}), payload },
  });

  const changes: ResumeChange[] = [];

  if (
    result.summary &&
    result.summary.trim() &&
    result.summary.trim() !== resumeData.summary.trim()
  ) {
    changes.push({
      id: "summary",
      type: "summary",
      label: "Professional Summary",
      before: resumeData.summary,
      after: result.summary.trim(),
    });
  }

  for (const suggestion of result.experienceBullets) {
    const exp = resumeData.experience.find((e) => e.id === suggestion.experienceId);
    if (!exp) continue;
    const before = exp.bullets[suggestion.bulletIndex];
    if (before === undefined) continue;
    const after = suggestion.after.trim();
    if (!after || after === before.trim()) continue;
    changes.push({
      id: `exp-${exp.id}-${suggestion.bulletIndex}`,
      type: "experience-bullet",
      label: `${exp.company || exp.role || "Experience"} — bullet ${suggestion.bulletIndex + 1}`,
      before,
      after,
    });
  }

  for (const suggestion of result.projectDescriptions) {
    const proj = resumeData.projects.find((p) => p.id === suggestion.projectId);
    if (!proj) continue;
    const after = suggestion.after.trim();
    if (!after || after === proj.description.trim()) continue;
    changes.push({
      id: `proj-${proj.id}`,
      type: "project-description",
      label: `${proj.name || "Project"} description`,
      before: proj.description,
      after,
    });
  }

  return changes;
}

/**
 * Applies a set of accepted ResumeChanges to a ResumeData, returning a new
 * object (does not mutate the input). Changes not present in
 * `acceptedIds` are skipped, leaving that field untouched.
 */
export function applyResumeChanges(
  resumeData: ResumeData,
  changes: ResumeChange[],
  acceptedIds: Set<string>,
): ResumeData {
  let next = resumeData;

  const summaryChange = changes.find((c) => c.type === "summary" && acceptedIds.has(c.id));
  if (summaryChange) {
    next = { ...next, summary: summaryChange.after };
  }

  const bulletChanges = changes.filter(
    (c) => c.type === "experience-bullet" && acceptedIds.has(c.id),
  );
  if (bulletChanges.length > 0) {
    next = {
      ...next,
      experience: next.experience.map((exp) => {
        const relevant = bulletChanges.filter((c) => c.id.startsWith(`exp-${exp.id}-`));
        if (relevant.length === 0) return exp;
        const bullets = [...exp.bullets];
        for (const change of relevant) {
          const idx = Number(change.id.slice(`exp-${exp.id}-`.length));
          if (!Number.isNaN(idx) && idx >= 0 && idx < bullets.length) {
            bullets[idx] = change.after;
          }
        }
        return { ...exp, bullets };
      }),
    };
  }

  const projectChanges = changes.filter(
    (c) => c.type === "project-description" && acceptedIds.has(c.id),
  );
  if (projectChanges.length > 0) {
    const byProjectId = new Map(projectChanges.map((c) => [c.id.replace(/^proj-/, ""), c.after]));
    next = {
      ...next,
      projects: next.projects.map((p) =>
        byProjectId.has(p.id) ? { ...p, description: byProjectId.get(p.id)! } : p,
      ),
    };
  }

  return next;
}
