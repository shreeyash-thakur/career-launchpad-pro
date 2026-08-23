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

const checkGeneralATSScoreFn = createServerFn({ method: "POST" })
  .validator(z.object({ uid: z.string().optional(), resumeText: z.string() }))
  .handler(async ({ data }) => {
    const { callAI, parseATSResult, checkRateLimit } = await import("@/lib/ai-server");
    checkRateLimit(data.uid ?? "anonymous");
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
${data.resumeText.slice(0, 4000)}

Remember: respond with ONLY the JSON object described in the system prompt.`;

    const raw = await callAI(system, user, 1200);
    return parseATSResult(raw);
  });

const checkJobMatchATSScoreFn = createServerFn({ method: "POST" })
  .validator(z.object({ uid: z.string().optional(), resumeText: z.string(), jobDescription: z.string() }))
  .handler(async ({ data }) => {
    const { callAI, parseATSResult, checkRateLimit } = await import("@/lib/ai-server");
    checkRateLimit(data.uid ?? "anonymous");
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
${data.jobDescription.slice(0, 3000)}

Resume:
${data.resumeText.slice(0, 3000)}

Remember: respond with ONLY the JSON object described in the system prompt.`;

    const raw = await callAI(system, user, 1200);
    return parseATSResult(raw);
  });

const suggestSkillsFn = createServerFn({ method: "POST" })
  .validator(z.object({ uid: z.string().optional(), title: z.string(), existingSkills: z.array(z.string()).optional() }))
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

/**
 * Stage 1 — general ATS-friendliness check, no job description required.
 */
export async function checkGeneralATSScore(params: { uid?: string; resumeText: string }): Promise<ATSResult> {
  return checkGeneralATSScoreFn({ data: params });
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