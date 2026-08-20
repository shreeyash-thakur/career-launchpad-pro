/**
 * OpenRouter AI service for resume writing assistance.
 * Uses meta-llama/llama-3.3-70b-instruct:free — best free model for
 * professional writing and structured suggestions.
 */

import type { ResumeData } from "@/features/resume-builder/types";

const OPENROUTER_API_KEY = import.meta.env["VITE_OPENROUTER_API_KEY"] as string;
const MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";
const BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

async function callAI(systemPrompt: string, userMessage: string): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("VITE_OPENROUTER_API_KEY is not set. Add it to your .env file.");
  }
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": window.location.origin,
      "X-Title": "CareerGPT Resume Builder",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 600,
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI request failed: ${res.status} — ${err}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Empty response from AI.");
  return text;
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
  matchedKeywords: string[]; // keywords from JD found in resume
  missingKeywords: string[]; // important JD keywords absent from resume
  suggestions: { section: string; issue: string; fix: string }[]; // actionable fixes
}

export async function checkATSScore(params: {
  resumeText: string;
  jobDescription: string;
}): Promise<ATSResult> {
  const system = `You are an expert ATS (Applicant Tracking System) analyser and resume coach.
Analyse how well a resume matches a job description and return ONLY a JSON object — no markdown, no explanation, no backticks.

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
- matchedKeywords: up to 12 specific skills/tools/qualifications from the JD that appear in the resume
- missingKeywords: up to 10 important skills/tools/qualifications from the JD missing from the resume
- suggestions: 3–5 specific, actionable improvements — be concrete, name the exact section and fix
- verdict: honest, specific, under 15 words
- Return ONLY valid JSON`;

  const user = `Job Description:
${params.jobDescription.slice(0, 3000)}

Resume:
${params.resumeText.slice(0, 3000)}`;

  const raw = await callAI(system, user);
  const cleaned = raw.replace(/```(?:json)?/g, "").trim();
  return JSON.parse(cleaned) as ATSResult;
}

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
    const cleaned = raw.replace(/```(?:json)?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed.map(String).slice(0, 10);
  } catch {
    // fallback: extract quoted words
    return raw.match(/"([^"]+)"/g)?.map((s) => s.replace(/"/g, "")).slice(0, 10) ?? [];
  }
  return [];
}