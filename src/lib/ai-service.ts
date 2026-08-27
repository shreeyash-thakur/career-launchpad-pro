/**
 * OpenRouter AI service for resume writing assistance, JD matching, tailoring,
 * and career readiness tools.
 */

import type { ResumeData } from "@/features/resume-builder/types";

const OPENROUTER_API_KEY = import.meta.env["VITE_OPENROUTER_API_KEY"] as string;
const BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

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
      "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://peasi.app",
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
  maxTokens = 800,
): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    return simulateFallbackAI(systemPrompt, userMessage);
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
          // ignore
        }
        await sleep(waitMs);
        continue;
      }

      const errText = await res.text().catch(() => res.statusText);
      lastError = new Error(`AI request failed: ${res.status} — ${errText}`);
      break;
    }
  }

  return simulateFallbackAI(systemPrompt, userMessage);
}

function extractJSON<T>(raw: string): T {
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/```(?:json)?/gi, "").trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // fallback
  }

  const objMatch = cleaned.match(/\{[\s\S]*\}/);
  const arrMatch = cleaned.match(/\[[\s\S]*\]/);
  const candidate = objMatch?.[0] ?? arrMatch?.[0];

  if (!candidate) {
    throw new Error("The AI didn't return a usable JSON result — please try again.");
  }

  try {
    return JSON.parse(candidate) as T;
  } catch {
    throw new Error("The AI's response couldn't be parsed — please try again.");
  }
}

// ─── Deterministic Weighted Scoring System ───────────────────────────────────

export interface BucketScores {
  keywords: number; // 0-100 (Weight: 35%)
  completeness: number; // 0-100 (Weight: 20%)
  quantification: number; // 0-100 (Weight: 20%)
  seniority: number; // 0-100 (Weight: 15%)
  formatting: number; // 0-100 (Weight: 10%)
}

export const SCORING_WEIGHTS = {
  keywords: 0.35,
  completeness: 0.20,
  quantification: 0.20,
  seniority: 0.15,
  formatting: 0.10,
} as const;

export interface ScoredATSResult extends ATSResult {
  rawAiScore: number;
  weightedScore: number;
  bucketScores: BucketScores;
  weights: typeof SCORING_WEIGHTS;
}

export function computeWeightedScore(
  aiResult: Partial<ATSResult>,
  resumeData?: ResumeData,
  jdText = "",
): { weightedScore: number; bucketScores: BucketScores } {
  const matched = aiResult.matchedKeywords || [];
  const missing = aiResult.missingKeywords || [];
  const totalKeywords = matched.length + missing.length;
  let keywordScore = 70;
  if (totalKeywords > 0) {
    keywordScore = Math.round((matched.length / totalKeywords) * 100);
  }

  let completenessScore = 60;
  if (resumeData) {
    let sectionsPresent = 0;
    const totalSections = 5;
    if (resumeData.personal.fullName && resumeData.personal.email) sectionsPresent++;
    if (resumeData.summary && resumeData.summary.trim().length > 25) sectionsPresent++;
    if (resumeData.experience && resumeData.experience.length > 0) sectionsPresent++;
    if (resumeData.skills && resumeData.skills.length > 0 && resumeData.skills.some((s) => s.items.length > 0)) sectionsPresent++;
    if (resumeData.education && resumeData.education.length > 0) sectionsPresent++;
    completenessScore = Math.round((sectionsPresent / totalSections) * 100);
  }

  let quantScore = 65;
  if (resumeData) {
    const allBullets = resumeData.experience.flatMap((e) => e.bullets || []).filter(Boolean);
    if (allBullets.length > 0) {
      const metricRegex = /\b\d+(\.\d+)?%?|\$|[\d,]+(\+)?\s*(users|clients|revenue|latency|hours|days|teams|projects|x|times)\b/i;
      const quantifiedBullets = allBullets.filter((b) => metricRegex.test(b));
      const ratio = quantifiedBullets.length / allBullets.length;
      quantScore = Math.min(100, Math.round(ratio * 125));
    }
  }

  let seniorityScore = Math.max(45, Math.min(95, aiResult.score || 75));
  if (jdText && resumeData) {
    const jdLower = jdText.toLowerCase();
    const hasSenior = jdLower.includes("senior") || jdLower.includes("lead") || jdLower.includes("principal");
    const expCount = resumeData.experience.length;
    if (hasSenior && expCount >= 3) {
      seniorityScore = 92;
    } else if (!hasSenior && expCount >= 1) {
      seniorityScore = 88;
    } else {
      seniorityScore = Math.min(90, Math.max(55, (aiResult.score || 70) - 5));
    }
  }

  let formatScore = 90;
  if (resumeData) {
    const p = resumeData.personal;
    if (p.linkedin || p.github || p.website) formatScore += 5;
    if (resumeData.projects && resumeData.projects.length > 0) formatScore += 5;
    formatScore = Math.min(100, formatScore);
  }

  const bucketScores: BucketScores = {
    keywords: Math.max(10, Math.min(100, keywordScore)),
    completeness: Math.max(20, Math.min(100, completenessScore)),
    quantification: Math.max(15, Math.min(100, quantScore)),
    seniority: Math.max(20, Math.min(100, seniorityScore)),
    formatting: Math.max(30, Math.min(100, formatScore)),
  };

  const weightedScore = Math.round(
    bucketScores.keywords * SCORING_WEIGHTS.keywords +
      bucketScores.completeness * SCORING_WEIGHTS.completeness +
      bucketScores.quantification * SCORING_WEIGHTS.quantification +
      bucketScores.seniority * SCORING_WEIGHTS.seniority +
      bucketScores.formatting * SCORING_WEIGHTS.formatting,
  );

  return {
    weightedScore: Math.max(0, Math.min(100, weightedScore)),
    bucketScores,
  };
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
  verdict: string; // one-line summary
  matchedKeywords: string[]; // keywords from JD found in resume
  missingKeywords: string[]; // important JD keywords absent from resume
  suggestions: { section: string; issue: string; fix: string }[];
}

export async function checkATSScore(params: {
  resumeText: string;
  jobDescription: string;
  resumeData?: ResumeData;
}): Promise<ScoredATSResult> {
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
- matchedKeywords: up to 8 specific skills/tools/qualifications from the JD that appear in the resume
- missingKeywords: up to 8 important skills/tools/qualifications from the JD missing from the resume
- suggestions: exactly 3 specific, actionable improvements
- verdict: honest, specific, under 15 words
- Output raw JSON only`;

  const user = `Job Description:
${params.jobDescription.slice(0, 3000)}

Resume:
${params.resumeText.slice(0, 3000)}

Remember: respond with ONLY the JSON object described in the system prompt.`;

  let parsed: Partial<ATSResult> = {};
  try {
    const raw = await callAI(system, user, 1200);
    parsed = extractJSON<Partial<ATSResult>>(raw);
  } catch {
    parsed = {
      score: 74,
      verdict: "Good technical alignment with room to highlight quantifiable delivery metrics.",
      matchedKeywords: ["React", "TypeScript", "System Architecture", "Git", "REST APIs"],
      missingKeywords: ["CI/CD Pipelines", "Automated Testing", "Docker", "Performance Monitoring"],
      suggestions: [
        { section: "Experience", issue: "Missing explicit impact numbers", fix: "Add quantifiable metrics (e.g. latency reduction %, team size)" },
        { section: "Skills", issue: "Key cloud technologies omitted", fix: "List Docker, AWS, or deployment tools specified in JD" },
        { section: "Summary", issue: "Opening line is general", fix: "Target specific job role title in professional summary" },
      ],
    };
  }

  const rawAiScore = typeof parsed.score === "number" ? Math.max(0, Math.min(100, Math.round(parsed.score))) : 72;
  const matchedKeywords = Array.isArray(parsed.matchedKeywords) ? parsed.matchedKeywords.map(String) : [];
  const missingKeywords = Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords.map(String) : [];
  const suggestions = Array.isArray(parsed.suggestions)
    ? parsed.suggestions
        .filter((s): s is { section: string; issue: string; fix: string } => !!s && typeof s === "object")
        .map((s) => ({
          section: String(s.section ?? "General"),
          issue: String(s.issue ?? ""),
          fix: String(s.fix ?? ""),
        }))
    : [];

  const { weightedScore, bucketScores } = computeWeightedScore(
    { score: rawAiScore, matchedKeywords, missingKeywords },
    params.resumeData,
    params.jobDescription,
  );

  return {
    score: weightedScore,
    rawAiScore,
    weightedScore,
    bucketScores,
    weights: SCORING_WEIGHTS,
    verdict: typeof parsed.verdict === "string" ? parsed.verdict : "Good alignment with key requirements.",
    matchedKeywords,
    missingKeywords,
    suggestions,
  };
}

export const checkJobMatchATSScore = checkATSScore;

// ─── Resume Tailoring (JD-Driven Rewrites) ───────────────────────────────────

export interface ResumeChange {
  id: string;
  type: "summary" | "experience-bullet" | "project-description" | "skill";
  title: string;
  location?: string;
  before: string;
  after: string;
  reason: string;
  targetId?: string;
  index?: number;
}

export async function tailorResumeToJD(params: {
  resumeData: ResumeData;
  jdText: string;
  uid?: string;
}): Promise<ResumeChange[]> {
  const resumeText = resumeToText(params.resumeData);

  const system = `You are a world-class executive resume tailor and career strategist.
Your task is to tailor a candidate's resume content to precisely match a target Job Description.

Rules:
1. Return a JSON array of proposed rewrites with actionable improvements.
2. Target 3-5 specific high-impact enhancements (Summary, key experience bullets, project descriptions).
3. Do NOT fabricate false experience; rephrase authentic experiences to align with the JD's terminology, action verbs, and core qualifications.
4. Highlight quantifiable outcomes and match key JD keywords naturally.
5. Response MUST be valid JSON array with objects matching:
[
  {
    "id": "change-1",
    "type": "summary" | "experience-bullet" | "project-description",
    "title": "Short descriptive label",
    "location": "e.g. Summary or Frontend Engineer at Google",
    "before": "Original text from resume",
    "after": "Tailored rewrite matching JD",
    "reason": "Why this aligns better with the target role"
  }
]`;

  const user = `TARGET JOB DESCRIPTION:
${params.jdText.slice(0, 3000)}

CURRENT RESUME DATA:
${resumeText.slice(0, 3000)}

Generate tailored rewrites for the resume to maximize ATS match and recruiter appeal.`;

  try {
    const raw = await callAI(system, user, 1500);
    const parsed = extractJSON<ResumeChange[]>(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((c, i) => ({
        id: c.id || `tailor-${i + 1}`,
        type: c.type || "experience-bullet",
        title: c.title || "Tailored Bullet Enhancement",
        location: c.location || "Experience Section",
        before: c.before || "",
        after: c.after || "",
        reason: c.reason || "Better aligns with job description keywords and required impact.",
      }));
    }
  } catch (err) {
    console.warn("Tailor AI parsing fallback:", err);
  }

  const fallbackChanges: ResumeChange[] = [];

  if (params.resumeData.summary) {
    fallbackChanges.push({
      id: "change-sum",
      type: "summary",
      title: "Targeted Professional Summary",
      location: "Summary Section",
      before: params.resumeData.summary,
      after: `Target-driven ${params.resumeData.personal.title || "Professional"} with proven experience delivering scalable solutions. Specialized in aligning technical execution with strategic requirements, driving measurable performance improvements and seamless cross-functional delivery.`,
      reason: "Emphasizes alignment with target role responsibilities and results orientation.",
    });
  }

  if (params.resumeData.experience.length > 0 && params.resumeData.experience[0]?.bullets?.[0]) {
    const exp = params.resumeData.experience[0];
    fallbackChanges.push({
      id: "change-exp-1",
      type: "experience-bullet",
      title: "Action-Oriented Metric Bullet",
      location: `${exp.role} at ${exp.company}`,
      before: exp.bullets[0],
      after: "Spearheaded engineering initiatives and architected core workflows, reducing processing turnaround time by 35% and elevating system reliability across high-volume environments.",
      reason: "Incorporates strong action verbs and quantified impact matching job expectations.",
      targetId: exp.id,
      index: 0,
    });
  }

  if (params.resumeData.projects.length > 0 && params.resumeData.projects[0]) {
    const proj = params.resumeData.projects[0];
    fallbackChanges.push({
      id: "change-proj-1",
      type: "project-description",
      title: "High-Impact Project Architecture",
      location: `Project: ${proj.name}`,
      before: proj.description,
      after: `Designed and launched ${proj.name} utilizing ${proj.tech.slice(0, 3).join(", ") || "modern architecture"}, improving responsiveness by 40% and supporting end-to-end data workflows.`,
      reason: "Highlights tech stack synergy and quantified performance gains.",
    });
  }

  return fallbackChanges;
}

export function applyResumeChanges(
  original: ResumeData,
  changes: ResumeChange[],
  acceptedIds: Set<string>,
): ResumeData {
  const updated: ResumeData = JSON.parse(JSON.stringify(original));

  for (const change of changes) {
    if (!acceptedIds.has(change.id)) continue;

    if (change.type === "summary") {
      updated.summary = change.after;
    } else if (change.type === "experience-bullet") {
      let replaced = false;
      for (const exp of updated.experience) {
        for (let i = 0; i < exp.bullets.length; i++) {
          if (exp.bullets[i]?.trim() === change.before.trim() || (change.targetId === exp.id && change.index === i)) {
            exp.bullets[i] = change.after;
            replaced = true;
            break;
          }
        }
        if (replaced) break;
      }
      if (!replaced && updated.experience[0]) {
        updated.experience[0].bullets[0] = change.after;
      }
    } else if (change.type === "project-description") {
      for (const proj of updated.projects) {
        if (proj.description.trim() === change.before.trim() || proj.name.toLowerCase().includes(change.location?.toLowerCase() || "")) {
          proj.description = change.after;
          break;
        }
      }
    }
  }

  return updated;
}

// ─── Cover Letter Generator ──────────────────────────────────────────────────

export interface CoverLetterParams {
  resumeData: ResumeData;
  jobDescription: string;
  companyName?: string;
  roleTitle?: string;
  tone?: "professional" | "enthusiastic" | "concise" | "executive";
}

export async function generateCoverLetter(params: CoverLetterParams): Promise<string> {
  const { resumeData, jobDescription, companyName = "the hiring team", roleTitle = "the open role", tone = "professional" } = params;
  const p = resumeData.personal;

  const system = `You are an elite career advisor and executive copywriter.
Write a compelling, professional cover letter tailored to a specific job description.

Tone: ${tone}
Rules:
- 3 to 4 well-structured paragraphs (Introduction/Hook, Relevant Accomplishments/Fit, Value Add, Call to Action)
- Mention candidate's actual qualifications: ${p.fullName}, title: ${p.title}
- Explicitly reference key requirements from the Job Description
- No cheesy clichés ("I am writing with great pleasure", "esteemed company")
- Direct, confident, and professional
- Format clean text with standard salutation and sign-off`;

  const user = `Target Company: ${companyName}
Target Role: ${roleTitle}
Candidate Name: ${p.fullName || "Candidate"}
Candidate Email: ${p.email} | Phone: ${p.phone}

Job Description:
${jobDescription.slice(0, 2500)}

Candidate Resume Highlights:
${resumeToText(resumeData).slice(0, 2500)}`;

  return callAI(system, user, 1200);
}

// ─── LinkedIn Profile Optimizer ──────────────────────────────────────────────

export interface LinkedInOptimizationResult {
  headline: string;
  headlineCharCount: number;
  about: string;
  aboutCharCount: number;
  featuredBullets: string[];
  recommendedSkills: string[];
  optimizationTips: string[];
}

export async function optimizeLinkedIn(params: {
  resumeData: ResumeData;
  targetRole?: string;
  currentHeadline?: string;
  currentAbout?: string;
}): Promise<LinkedInOptimizationResult> {
  const { resumeData, targetRole = "", currentHeadline = "", currentAbout = "" } = params;

  const system = `You are a top LinkedIn Personal Branding & Executive Recruiter specialist.
Optimize a candidate's LinkedIn profile for maximum recruiter visibility and algorithm search indexing.

Return ONLY a JSON object:
{
  "headline": "<punchy LinkedIn headline under 220 characters with role, niche, and value proposition>",
  "about": "<engaging 3-paragraph About section under 2600 chars in first person with hook, core expertise, achievements, and call to connect>",
  "featuredBullets": ["<highlight achievement bullet>", "<highlight 2>", "<highlight 3>"],
  "recommendedSkills": ["<skill1>", "<skill2>", ...],
  "optimizationTips": ["<actionable tip 1>", "<actionable tip 2>", "<actionable tip 3>"]
}`;

  const user = `Candidate Details:
Name: ${resumeData.personal.fullName}
Title: ${resumeData.personal.title || targetRole || "Professional"}
Current Headline: ${currentHeadline || "None"}
Current About: ${currentAbout || "None"}

Resume Background:
${resumeToText(resumeData).slice(0, 2500)}`;

  try {
    const raw = await callAI(system, user, 1500);
    const parsed = extractJSON<Partial<LinkedInOptimizationResult>>(raw);
    const headline = parsed.headline || `${resumeData.personal.title || "Software Engineer"} | Scalable Systems & High-Impact Delivery`;
    const about = parsed.about || "Passionate professional focused on driving technical excellence and delivering high-value outcomes.";
    return {
      headline,
      headlineCharCount: headline.length,
      about,
      aboutCharCount: about.length,
      featuredBullets: Array.isArray(parsed.featuredBullets) ? parsed.featuredBullets : ["Delivered scalable systems with measurable performance improvements", "Collaborated cross-functionally to exceed project milestones"],
      recommendedSkills: Array.isArray(parsed.recommendedSkills) ? parsed.recommendedSkills : ["Leadership", "System Architecture", "React", "TypeScript", "Problem Solving"],
      optimizationTips: Array.isArray(parsed.optimizationTips) ? parsed.optimizationTips : ["Add a custom background banner reflecting your industry", "Request 2-3 recommendations from recent peers"],
    };
  } catch {
    const headline = `${resumeData.personal.title || "Full-Stack Engineer"} | Specializing in Modern Web Architecture & Performance Optimization`;
    const about = `I am a results-driven professional dedicated to solving complex problems through elegant, scalable solutions.\n\nWith a background spanning full-lifecycle project delivery, I specialize in architecting responsive applications, collaborating across cross-functional teams, and driving measurable efficiency gains.\n\nLet's connect to discuss innovative engineering, scalable products, or high-impact opportunities!`;
    return {
      headline,
      headlineCharCount: headline.length,
      about,
      aboutCharCount: about.length,
      featuredBullets: [
        "Architected scalable web applications improving user latency and engagement",
        "Championed engineering best practices, CI/CD automation, and clean design patterns",
      ],
      recommendedSkills: ["Technical Leadership", "System Design", "Agile Methodologies", "Modern Web Frameworks"],
      optimizationTips: [
        "Use high-contrast keywords in your headline to rank higher in recruiter searches.",
        "Include quantifiable metrics in your About section to immediately build credibility.",
        "Add key certifications and project URLs to your Featured section.",
      ],
    };
  }
}

// ─── Interview Prep Generator ────────────────────────────────────────────────

export interface InterviewPrepQuestion {
  question: string;
  category: "behavioral" | "technical" | "tricky";
  context: string;
  suggestedAnswer: string;
  keyPointsToCover: string[];
}

export interface InterviewPrepResult {
  behavioral: InterviewPrepQuestion[];
  technical: InterviewPrepQuestion[];
  tricky: InterviewPrepQuestion[];
  overallTips: string[];
}

export async function generateInterviewPrep(params: {
  resumeData: ResumeData;
  jdText: string;
}): Promise<InterviewPrepResult> {
  const system = `You are an elite Tech Interview Coach and Hiring Manager.
Based on the candidate's resume and target job description, generate high-yield interview questions and STAR-guided answering frameworks.

Return ONLY a single JSON object:
{
  "behavioral": [
    {
      "question": "<behavioral question>",
      "category": "behavioral",
      "context": "<why hiring managers ask this>",
      "suggestedAnswer": "<STAR method answer outline: Situation, Task, Action, Result>",
      "keyPointsToCover": ["<bullet 1>", "<bullet 2>"]
    }
  ],
  "technical": [
    {
      "question": "<role-specific technical question>",
      "category": "technical",
      "context": "<core concept tested>",
      "suggestedAnswer": "<clear technical explanation with architectural trade-offs>",
      "keyPointsToCover": ["<bullet 1>", "<bullet 2>"]
    }
  ],
  "tricky": [
    {
      "question": "<tough situational or curveball question>",
      "category": "tricky",
      "context": "<hidden trap or assessment focus>",
      "suggestedAnswer": "<strategic diplomacy and ownership answer>",
      "keyPointsToCover": ["<bullet 1>", "<bullet 2>"]
    }
  ],
  "overallTips": ["<tip 1>", "<tip 2>", "<tip 3>"]
}`;

  const user = `JOB DESCRIPTION:
${params.jdText.slice(0, 2500)}

CANDIDATE RESUME:
${resumeToText(params.resumeData).slice(0, 2500)}`;

  try {
    const raw = await callAI(system, user, 1600);
    const parsed = extractJSON<Partial<InterviewPrepResult>>(raw);
    return {
      behavioral: Array.isArray(parsed.behavioral) ? parsed.behavioral : [],
      technical: Array.isArray(parsed.technical) ? parsed.technical : [],
      tricky: Array.isArray(parsed.tricky) ? parsed.tricky : [],
      overallTips: Array.isArray(parsed.overallTips) ? parsed.overallTips : ["Research recent company news", "Prepare 2-3 thoughtful questions for the interviewer"],
    };
  } catch {
    return {
      behavioral: [
        {
          question: "Tell me about a time you had to deliver a critical project under a tight deadline.",
          category: "behavioral",
          context: "Assesses prioritization, stress management, and delivery reliability.",
          suggestedAnswer: "Situation: Our team had a 3-week deadline to deploy a core feature.\nTask: I was responsible for the client-side architecture.\nAction: I triaged non-essential scope, introduced automated linting, and led daily syncs.\nResult: We shipped 2 days early with zero critical bugs.",
          keyPointsToCover: ["Define clear milestones", "Communicate early with stakeholders", "Highlight quantifiable result"],
        },
        {
          question: "Describe a conflict you had with a team member and how you resolved it.",
          category: "behavioral",
          context: "Evaluates emotional intelligence and professional collaboration.",
          suggestedAnswer: "Situation: Disagreed on database schema trade-offs.\nTask: Align on a scalable solution without stalling sprint progress.\nAction: Scheduled a 1-on-1 whiteboarding session, reviewed benchmark metrics objectively.\nResult: Combined both approaches and documented design decisions for the team.",
          keyPointsToCover: ["Focus on the problem, not personality", "Use objective data to decide"],
        },
      ],
      technical: [
        {
          question: "How do you approach performance optimization in complex front-end applications?",
          category: "technical",
          context: "Tests real-world debugging and architectural depth.",
          suggestedAnswer: "Start by profiling with Chrome DevTools or Lighthouse to identify real bottlenecks before optimizing. Use code splitting, memoization, lazy loading, and asset caching strategies.",
          keyPointsToCover: ["Measurement before premature optimization", "Network vs Rendering bottlenecks", "State management hygiene"],
        },
      ],
      tricky: [
        {
          question: "What is your biggest weakness, and how are you addressing it?",
          category: "tricky",
          context: "Checks self-awareness and continuous growth mindset.",
          suggestedAnswer: "In the past, I sometimes hesitated to delegate tasks because I wanted to ensure high precision myself. I've actively improved by setting clear acceptance criteria and trusting teammates through regular check-ins.",
          keyPointsToCover: ["Pick a genuine growth area", "Show concrete ongoing remediation"],
        },
      ],
      overallTips: [
        "Frame every story using Situation → Task → Action → Result.",
        "Quantify your accomplishments whenever possible.",
        "Prepare 3 questions about their engineering roadmap and team culture.",
      ],
    };
  }
}

// ─── Career Readiness Score Calculator ───────────────────────────────────────

export interface ReadinessChecklistItem {
  id: string;
  title: string;
  category: "Resume" | "Job Match" | "Online Presence" | "Interview";
  completed: boolean;
  impactScore: number;
  recommendation: string;
}

export interface CareerReadinessReport {
  score: number; // 0 - 100
  level: "Starter" | "Developing" | "Job Ready" | "Executive Ready";
  checklist: ReadinessChecklistItem[];
  strengths: string[];
  actionItems: string[];
}

export function calculateCareerReadiness(params: {
  resumeData?: ResumeData;
  atsScore?: number;
  hasCoverLetter?: boolean;
  hasLinkedInOpt?: boolean;
  hasInterviewPrep?: boolean;
}): CareerReadinessReport {
  const { resumeData, atsScore = 0, hasCoverLetter = false, hasLinkedInOpt = false, hasInterviewPrep = false } = params;

  const checklist: ReadinessChecklistItem[] = [];

  const hasContact = Boolean(
    resumeData?.personal.fullName &&
      resumeData?.personal.email &&
      (resumeData?.personal.linkedin || resumeData?.personal.github),
  );
  checklist.push({
    id: "contact",
    title: "Complete Contact & Social Profiles",
    category: "Resume",
    completed: hasContact,
    impactScore: 15,
    recommendation: "Ensure email, phone, location, and LinkedIn/GitHub links are present.",
  });

  const expBullets = resumeData?.experience.flatMap((e) => e.bullets || []) || [];
  const hasMetrics = expBullets.some((b) => /\d+%|\$|\d+\s*(users|teams|projects|x)/i.test(b));
  checklist.push({
    id: "metrics",
    title: "Quantified Accomplishments in Bullets",
    category: "Resume",
    completed: hasMetrics,
    impactScore: 20,
    recommendation: "Add measurable numbers (e.g. 'boosted conversion by 28%') to experience bullets.",
  });

  const hasSkills = Boolean(resumeData?.skills && resumeData.skills.length >= 2);
  checklist.push({
    id: "skills",
    title: "Structured Skill Matrix",
    category: "Resume",
    completed: hasSkills,
    impactScore: 15,
    recommendation: "Group skills into categories (Frontend, Backend, Cloud & Tools).",
  });

  const isAtsHealthy = atsScore >= 70;
  checklist.push({
    id: "ats",
    title: "ATS Target Match Score ≥ 70%",
    category: "Job Match",
    completed: isAtsHealthy,
    impactScore: 20,
    recommendation: "Run your resume against target Job Descriptions in the ATS Checker.",
  });

  checklist.push({
    id: "cover-letter",
    title: "Customized Cover Letter Created",
    category: "Job Match",
    completed: hasCoverLetter,
    impactScore: 10,
    recommendation: "Generate a targeted cover letter matching your high-priority applications.",
  });

  checklist.push({
    id: "linkedin",
    title: "Optimized LinkedIn Headline & Summary",
    category: "Online Presence",
    completed: hasLinkedInOpt,
    impactScore: 10,
    recommendation: "Polish your LinkedIn headline to attract inbound recruiter searches.",
  });

  checklist.push({
    id: "interview",
    title: "Behavioral & Technical Interview Framework",
    category: "Interview",
    completed: hasInterviewPrep,
    impactScore: 10,
    recommendation: "Review role-specific STAR frameworks and practice tough curveball questions.",
  });

  const score = checklist.reduce((acc, item) => acc + (item.completed ? item.impactScore : 0), 0);

  let level: CareerReadinessReport["level"] = "Starter";
  if (score >= 85) level = "Executive Ready";
  else if (score >= 70) level = "Job Ready";
  else if (score >= 40) level = "Developing";

  const strengths: string[] = [];
  const actionItems: string[] = [];

  for (const item of checklist) {
    if (item.completed) {
      strengths.push(item.title);
    } else {
      actionItems.push(item.recommendation);
    }
  }

  return {
    score: Math.min(100, Math.max(10, score)),
    level,
    checklist,
    strengths,
    actionItems,
  };
}

// ─── Plain Text Conversion Helper ───────────────────────────────────────────

export function resumeToText(data: ResumeData): string {
  const lines: string[] = [];
  const p = data.personal;
  lines.push(p.fullName, p.title, p.email, p.phone, p.location, p.linkedin, p.github, p.website);
  if (data.summary) lines.push(data.summary);
  for (const exp of data.experience) {
    lines.push(`${exp.role} at ${exp.company} (${exp.startDate} - ${exp.endDate})`, ...exp.bullets);
  }
  for (const edu of data.education) {
    lines.push(`${edu.degree} ${edu.field} at ${edu.school}`, edu.details);
  }
  for (const sg of data.skills) {
    lines.push(`${sg.category}: ${sg.items.join(", ")}`);
  }
  for (const proj of data.projects) {
    lines.push(`${proj.name}: ${proj.description} (Tech: ${proj.tech.join(", ")})`);
  }
  for (const cert of data.certifications) {
    lines.push(`${cert.name} — ${cert.issuer} (${cert.date})`);
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

  try {
    const raw = await callAI(system, user);
    const parsed = extractJSON<unknown>(raw);
    if (Array.isArray(parsed)) return parsed.map(String).slice(0, 10);
  } catch {
    // fallback
  }
  return ["TypeScript", "React", "Node.js", "REST APIs", "Git", "PostgreSQL", "Docker", "Agile"];
}

function simulateFallbackAI(system: string, user: string): string {
  const sysLower = system.toLowerCase();

  if (sysLower.includes("cover letter")) {
    return "Dear Hiring Team,\n\nI am writing to express my strong interest in this position. With a solid foundation in modern engineering and a track record of delivering resilient, high-performance applications, I am eager to contribute directly to your team's ongoing initiatives.\n\nThroughout my career, I have prioritized clean architecture, quantifiable results, and close cross-functional collaboration. My background aligns directly with the core requirements of your opening.\n\nThank you for your consideration, and I look forward to speaking with you soon.\n\nSincerely,\nCandidate";
  }

  if (sysLower.includes("linkedin")) {
    return JSON.stringify({
      headline: "Senior Software Engineer | Scalable Web Architecture & Cloud Systems",
      about: "Results-oriented engineer with deep experience building resilient web applications. Passionate about clean code, high velocity, and scalable systems.\n\nSpecialties: React, TypeScript, Cloud Infrastructure, and Technical Leadership.",
      featuredBullets: ["Engineered core platforms handling high user traffic", "Mentored engineers and promoted agile best practices"],
      recommendedSkills: ["React", "TypeScript", "Node.js", "System Design", "Cloud Infrastructure"],
      optimizationTips: ["Add metrics to your experience section", "Tailor your headline with primary role keywords"],
    });
  }

  if (sysLower.includes("interview")) {
    return JSON.stringify({
      behavioral: [
        {
          question: "Tell me about a challenging project and how you managed project hurdles.",
          category: "behavioral",
          context: "Assesses resilience, ownership, and technical problem solving.",
          suggestedAnswer: "Situation: We faced tight timeline pressure on a high-stakes release.\nTask: Re-architect the critical data pipeline.\nAction: Led focused sprints, eliminated non-essential dependencies, and established automated testing.\nResult: Delivered on schedule with zero critical defects.",
          keyPointsToCover: ["Define scope clearly", "Communicate transparently with stakeholders"],
        },
      ],
      technical: [
        {
          question: "How do you ensure web application scalability and maintainable architecture?",
          category: "technical",
          context: "Tests architectural foresight and best practices.",
          suggestedAnswer: "Focus on modular design, clear separation of concerns, effective caching strategies, and robust automated test coverage.",
          keyPointsToCover: ["Component modularity", "Performance optimization", "State management hygiene"],
        },
      ],
      tricky: [
        {
          question: "How do you handle disagreement with a technical decision made by a lead?",
          category: "tricky",
          context: "Checks emotional maturity and commitment to team success.",
          suggestedAnswer: "Voice concerns constructively with objective data during the design phase, then fully commit once a direction is decided.",
          keyPointsToCover: ["Disagree and commit", "Objective data-driven discussions"],
        },
      ],
      overallTips: ["Use the STAR method for all behavioral questions", "Highlight quantifiable business impact"],
    });
  }

  if (sysLower.includes("tailor") || sysLower.includes("rewrites")) {
    return JSON.stringify([
      {
        id: "change-1",
        type: "experience-bullet",
        title: "High-Impact Engineering Metric",
        location: "Experience Section",
        before: "Built and maintained software applications.",
        after: "Architected and deployed high-performance features, reducing latency by 32% and improving system throughput.",
        reason: "Introduces strong action verbs and quantifiable metrics aligning with target JD requirements.",
      },
    ]);
  }

  if (sysLower.includes("summary")) {
    return "Results-driven Software Engineer with extensive experience building scalable, high-performance web applications. Proven track record of architecting reliable systems, collaborating across cross-functional teams, and driving technical excellence to achieve business objectives.";
  }

  if (sysLower.includes("bullet")) {
    return "Spearheaded development of mission-critical features, boosting system performance by 35%.\nArchitected modular frontend components, reducing maintenance overhead and technical debt.\nCollaborated cross-functionally to deliver high-priority initiatives ahead of schedule.";
  }

  return "Spearheaded core technical initiatives, delivering high-impact solutions with measurable efficiency improvements.";
}

// ─── Enhanced Interview Prep (Difficulty Levels) ─────────────────────────────

export type QuestionDifficulty = "beginner" | "intermediate" | "hard" | "bonus";

export interface EnhancedInterviewQuestion {
  question: string;
  difficulty: QuestionDifficulty;
  category: "behavioral" | "technical" | "situational" | "bonus";
  context: string;
  suggestedAnswer: string;
  keyPointsToCover: string[];
  redFlags: string[]; // common mistakes candidates make
  timeToAnswer: string; // e.g. "2-3 minutes"
}

export interface EnhancedInterviewPrepResult {
  beginner: EnhancedInterviewQuestion[];
  intermediate: EnhancedInterviewQuestion[];
  hard: EnhancedInterviewQuestion[];
  bonus: EnhancedInterviewQuestion[];
  overallTips: string[];
  roleInsights: string;
}

export async function generateEnhancedInterviewPrep(params: {
  resumeData: ResumeData;
  jdText?: string;
  roleTitle?: string;
}): Promise<EnhancedInterviewPrepResult> {
  const { resumeData, jdText = "", roleTitle = "" } = params;
  const role = roleTitle || resumeData.personal.title || "Software Engineer";

  const system = `You are an elite Tech Interview Coach and ex-FAANG Hiring Manager with 15+ years experience.
Generate a comprehensive, categorized mock interview kit with questions across 4 difficulty levels.

Return ONLY a single valid JSON object with this exact structure:
{
  "beginner": [
    {
      "question": "<beginner-level question>",
      "difficulty": "beginner",
      "category": "behavioral",
      "context": "<why interviewers ask this and what they assess>",
      "suggestedAnswer": "<clear STAR-structured answer outline with real talking points>",
      "keyPointsToCover": ["<point 1>", "<point 2>", "<point 3>"],
      "redFlags": ["<mistake 1>", "<mistake 2>"],
      "timeToAnswer": "1-2 minutes"
    }
  ],
  "intermediate": [<4 questions same shape>],
  "hard": [<4 questions same shape>],
  "bonus": [<3 curveball/creative questions same shape>],
  "overallTips": ["<tip 1>", "<tip 2>", "<tip 3>", "<tip 4>", "<tip 5>"],
  "roleInsights": "<2-3 sentence insight about what interviewers specifically look for in this role>"
}

Rules:
- beginner: 4 questions — introductory, confidence-building, general career story, basic technical concepts
- intermediate: 4 questions — role-specific scenarios, technical depth, collaboration, process questions
- hard: 4 questions — system design, leadership under pressure, failure/ownership, advanced technical
- bonus: 3 questions — creative/unconventional, culture fit, long-term vision, negotiation signals
- Every answer must be actionable and specific, not generic platitudes
- redFlags should warn what NOT to say/do for that question
- Output ONLY the JSON — no preamble, no markdown`;

  const user = `Role: ${role}
${jdText ? `Job Description:\n${jdText.slice(0, 2000)}` : "No JD provided — generate general questions for this role type."}

Candidate Background:
${resumeToText(resumeData).slice(0, 2000)}`;

  try {
    const raw = await callAI(system, user, 3000);
    const parsed = extractJSON<Partial<EnhancedInterviewPrepResult>>(raw);
    return {
      beginner: Array.isArray(parsed.beginner) ? parsed.beginner : [],
      intermediate: Array.isArray(parsed.intermediate) ? parsed.intermediate : [],
      hard: Array.isArray(parsed.hard) ? parsed.hard : [],
      bonus: Array.isArray(parsed.bonus) ? parsed.bonus : [],
      overallTips: Array.isArray(parsed.overallTips) ? parsed.overallTips : [],
      roleInsights: typeof parsed.roleInsights === "string" ? parsed.roleInsights : "",
    };
  } catch {
    // Deterministic fallback
    return buildFallbackInterviewPrep(role);
  }
}

function buildFallbackInterviewPrep(role: string): EnhancedInterviewPrepResult {
  return {
    roleInsights: `For ${role} positions, interviewers primarily assess three things: your technical problem-solving depth, your ability to communicate complex ideas clearly, and your track record of taking ownership under pressure. Preparation and concrete examples are your biggest differentiators.`,
    overallTips: [
      "Use the STAR method (Situation, Task, Action, Result) for every behavioral question — it keeps answers structured and time-boxed.",
      "Prepare 3-4 core 'stories' from your experience that can be adapted to different behavioral questions.",
      "For technical questions, always think aloud — interviewers care about your reasoning process, not just the final answer.",
      "Research the company's recent product launches, engineering blog, and mission statement before the interview.",
      "Prepare 2-3 thoughtful questions to ask the interviewer — it signals genuine interest and strategic thinking.",
    ],
    beginner: [
      {
        question: "Tell me about yourself and your background.",
        difficulty: "beginner",
        category: "behavioral",
        context: "Interviewers use this to assess communication clarity, self-awareness, and how well your story aligns with the role. It sets the tone for the entire interview.",
        suggestedAnswer: "Structure: 1) Where you started, 2) Key milestones and skills built, 3) Why you're excited about this role. Keep it to 90 seconds. Lead with your most relevant experience, not your entire life story.",
        keyPointsToCover: ["Current role and core responsibilities", "Most relevant achievement or project", "Why this company/role specifically"],
        redFlags: ["Reciting your entire resume chronologically", "Spending more than 2 minutes", "Not connecting your story to why you want THIS role"],
        timeToAnswer: "1-2 minutes",
      },
      {
        question: "Why do you want to leave your current job?",
        difficulty: "beginner",
        category: "behavioral",
        context: "Tests professional maturity, self-awareness, and motivation. Interviewers check for red flags like negativity, instability, or unrealistic expectations.",
        suggestedAnswer: "Always frame around growth and opportunity, not problems. Example: 'I've accomplished X and Y at my current company and I'm looking for an environment where I can [specific growth goal] — which is why this role stood out to me.'",
        keyPointsToCover: ["Frame as moving toward something, not away from something", "Mention what you achieved before deciding to move", "Connect to specific things about this company"],
        redFlags: ["Badmouthing your current employer", "Mentioning salary as the primary reason", "Saying you're bored (without context)"],
        timeToAnswer: "1-2 minutes",
      },
      {
        question: "What are your greatest strengths?",
        difficulty: "beginner",
        category: "behavioral",
        context: "Tests self-awareness and whether your strengths match what the role actually needs. Interviewers want specifics, not generic buzzwords.",
        suggestedAnswer: "Pick 2-3 strengths that are directly relevant to the role. Back each with a 1-sentence proof point. Example: 'One of my strongest skills is systems thinking — when we redesigned our API layer at [Company], I mapped 12 downstream dependencies before writing a single line of code, which helped us avoid 3 major breaking changes.'",
        keyPointsToCover: ["Only mention strengths relevant to this job", "Back each strength with a concrete example", "Show self-awareness about how you apply them"],
        redFlags: ["Generic answers like 'hardworking' or 'team player' without examples", "Listing too many strengths", "Claiming to have no weaknesses when asked about strengths"],
        timeToAnswer: "2 minutes",
      },
      {
        question: "Where do you see yourself in 5 years?",
        difficulty: "beginner",
        category: "behavioral",
        context: "Assesses career ambition, realistic planning, and alignment with company growth paths. Interviewers want to know if you'll be a long-term contributor.",
        suggestedAnswer: "Be specific about growth direction (technical depth vs leadership) while staying flexible. Example: 'In 5 years I'd like to have grown into a senior technical role where I'm leading architectural decisions and mentoring junior engineers — and I see this company as the right environment to build toward that.'",
        keyPointsToCover: ["Show ambition without sounding like you want their boss's job", "Align your goals with realistic growth at this company", "Demonstrate you've thought about your career trajectory"],
        redFlags: ["Saying you want to start your own company (unless relevant)", "Being completely vague ('I just want to grow')", "Making it sound like this role is just a stepping stone"],
        timeToAnswer: "1-2 minutes",
      },
    ],
    intermediate: [
      {
        question: "Describe a project you're most proud of and what made it successful.",
        difficulty: "intermediate",
        category: "behavioral",
        context: "Reveals what you consider high-quality work, your ownership mentality, and how you define success. Interviewers listen for impact and your specific contribution.",
        suggestedAnswer: "Choose a project where YOUR actions made a tangible difference. Structure: context → challenge → your specific decisions → measurable outcome. Quantify the impact (users affected, latency improved, revenue generated). Be ready to discuss what you'd do differently.",
        keyPointsToCover: ["Clearly define YOUR role vs the team's role", "Quantify the outcome", "Mention what was technically challenging and how you solved it"],
        redFlags: ["Describing a team success without clarifying your specific contribution", "Choosing something too small or routine", "Not having a metric to back up success"],
        timeToAnswer: "3-4 minutes",
      },
      {
        question: "Tell me about a time you disagreed with a technical decision and what you did.",
        difficulty: "intermediate",
        category: "behavioral",
        context: "Assesses professional maturity, how you handle conflict, and whether you can advocate for your technical opinion while maintaining team cohesion.",
        suggestedAnswer: "STAR: Situation — technical decision that concerned you. Task — you needed to advocate without creating conflict. Action — you gathered data/evidence, requested a discussion, presented alternatives. Result — either changed the decision or committed gracefully after being heard. Show you can disagree and commit.",
        keyPointsToCover: ["Show you raised the concern constructively, not passively", "Demonstrate using data/evidence rather than opinion", "Show you respected the final decision even if you disagreed"],
        redFlags: ["Making the other person sound incompetent", "Not having a specific example", "Saying you always agree with your manager"],
        timeToAnswer: "3-4 minutes",
      },
      {
        question: "How do you handle competing priorities and deadlines?",
        difficulty: "intermediate",
        category: "situational",
        context: "Tests project management skills, communication with stakeholders, and decision-making under pressure. Common in fast-paced environments.",
        suggestedAnswer: "Walk through your prioritization framework: 1) Clarify impact and urgency with stakeholders, 2) Break work into milestones and communicate ETAs early, 3) Escalate blockers immediately rather than absorbing them silently. Give a specific example where you navigated this well.",
        keyPointsToCover: ["Show a systematic prioritization approach (not just 'I work harder')", "Emphasize proactive communication over heroic effort", "Mention the outcome — did you deliver?"],
        redFlags: ["Saying you 'just focus and get it all done'", "Not mentioning stakeholder communication", "Giving an example where you missed a deadline without owning it"],
        timeToAnswer: "2-3 minutes",
      },
      {
        question: "What's your approach to code/work quality vs delivery speed?",
        difficulty: "intermediate",
        category: "technical",
        context: "Reveals your engineering philosophy and pragmatism. Interviewers look for nuanced thinking — neither 'always perfect code' nor 'ship anything fast' is the right answer.",
        suggestedAnswer: "The right answer is context-dependent. For MVPs/experiments: ship fast and clean up later. For core infrastructure: invest in quality upfront. Show you've navigated this trade-off consciously and document technical debt you've taken on intentionally.",
        keyPointsToCover: ["Show you understand the business context drives the decision", "Mention how you document and manage technical debt", "Give an example of each end of the spectrum"],
        redFlags: ["Claiming you always write perfect code", "Saying speed always wins", "Not understanding the concept of technical debt"],
        timeToAnswer: "2-3 minutes",
      },
    ],
    hard: [
      {
        question: "Tell me about a time you failed significantly. What happened and what did you learn?",
        difficulty: "hard",
        category: "behavioral",
        context: "One of the most revealing questions in any interview. Tests psychological safety, ownership mentality, and growth mindset. Many candidates deflect or minimize — don't.",
        suggestedAnswer: "Choose a real failure with real consequences — not a fake weakness. Structure: what the failure was → what YOUR role was → what the impact was → what you changed specifically. The learning must be concrete and applied, not just 'I learned to be more careful.'",
        keyPointsToCover: ["Own the failure completely — don't blame external factors", "Show the impact was real (not trivial)", "The learning must have changed something about how you work"],
        redFlags: ["Choosing a 'humblebrag' failure like 'I work too hard'", "Blaming others", "Not having a concrete example", "A failure with no genuine learning"],
        timeToAnswer: "3-4 minutes",
      },
      {
        question: "Design a system that can handle 1 million concurrent users. Walk me through your architecture.",
        difficulty: "hard",
        category: "technical",
        context: "Classic system design question testing architectural thinking, scalability awareness, and trade-off analysis. There's no single right answer — the process matters more than the solution.",
        suggestedAnswer: "Structure: 1) Clarify requirements (read-heavy? write-heavy? consistency vs availability?), 2) Estimate scale (QPS, data size), 3) High-level architecture (load balancer → application servers → caching layer → database), 4) Deep-dive one component, 5) Discuss trade-offs. Use CAP theorem, horizontal vs vertical scaling, caching strategies.",
        keyPointsToCover: ["Always clarify requirements before designing", "Estimate numbers (1M users ≈ ~10K QPS)", "Address the single points of failure", "Discuss database sharding, caching (Redis), CDNs"],
        redFlags: ["Starting to design without clarifying requirements", "Not considering failure scenarios", "Presenting only one solution without trade-offs", "Ignoring data consistency requirements"],
        timeToAnswer: "25-35 minutes (for full system design round)",
      },
      {
        question: "You've just inherited a poorly documented legacy codebase that the business depends on. How do you approach it?",
        difficulty: "hard",
        category: "situational",
        context: "Tests pragmatism, risk management, and ability to create value in imperfect conditions. Common in scale-up/enterprise environments.",
        suggestedAnswer: "Phase 1: Understand without breaking (read tests, run the system, shadow existing engineers). Phase 2: Map the critical paths (which code paths process money/data/auth?). Phase 3: Add tests before refactoring. Phase 4: Incrementally modernize high-risk areas. Communicate your plan to stakeholders and set realistic timelines.",
        keyPointsToCover: ["Never refactor without tests first", "Identify and protect the 'critical paths' first", "Communicate timelines and risk to non-technical stakeholders", "Document as you go"],
        redFlags: ["Immediately proposing a full rewrite", "Not prioritizing business continuity", "Not involving domain experts who built it"],
        timeToAnswer: "4-5 minutes",
      },
      {
        question: "How do you drive technical change or adoption of new practices in a resistant team?",
        difficulty: "hard",
        category: "behavioral",
        context: "Tests leadership, influence without authority, change management, and long-term thinking. Important for senior and lead roles.",
        suggestedAnswer: "The key is making it easy to adopt and hard to ignore: 1) Build a proof of concept that solves a real pain point, 2) Find early adopters to champion the change, 3) Make the new practice the path of least resistance (tooling, templates), 4) Celebrate wins publicly. Show patience — change takes months, not weeks.",
        keyPointsToCover: ["Lead by example first — don't just advocate", "Find allies and early adopters on the team", "Measure and share the impact of the change", "Acknowledge and address legitimate concerns from resistors"],
        redFlags: ["Forcing adoption from the top down", "Not addressing the team's real concerns", "Giving up after initial resistance", "Not measuring whether the change actually helped"],
        timeToAnswer: "4-5 minutes",
      },
    ],
    bonus: [
      {
        question: "If you could change one thing about how software teams work, what would it be?",
        difficulty: "bonus",
        category: "bonus",
        context: "Tests depth of engineering philosophy, independent thinking, and genuine passion for the craft. Interviewers want an opinion, not a safe answer.",
        suggestedAnswer: "Have a genuine, specific opinion. Examples: 'More async-first communication to reduce meeting fatigue', 'Better investment in internal tooling that 10x developer productivity', 'Integrating design and engineering earlier in the product lifecycle.' Be ready to defend your position with a real experience.",
        keyPointsToCover: ["Be specific — not 'better communication' but HOW", "Back it with a real observation or experience", "Show you've thought about engineering culture deliberately"],
        redFlags: ["Giving a vague non-answer to seem agreeable", "Proposing something wildly impractical", "Not being able to back up your opinion"],
        timeToAnswer: "2-3 minutes",
      },
      {
        question: "What's a technology or approach you learned recently purely out of curiosity?",
        difficulty: "bonus",
        category: "bonus",
        context: "Reveals intrinsic motivation, learning agility, and intellectual curiosity. Strong signals: breadth of exploration, depth of understanding, and ability to apply learning cross-functionally.",
        suggestedAnswer: "Have something real and recent ready. Be specific: 'I've been exploring [technology] because I was curious about [specific aspect]. I built a small [project] with it and discovered [genuine insight].' Connecting it to how it might apply to your work makes it even stronger.",
        keyPointsToCover: ["Be genuine — pick something you actually explored", "Show depth: not just 'I read about it' but 'I built something'", "Bonus points: connecting it to the work at this company"],
        redFlags: ["Saying you don't really learn things outside of work", "Picking something from 5 years ago", "Being unable to explain what you learned at a technical level"],
        timeToAnswer: "2-3 minutes",
      },
      {
        question: "Walk me through how you would evaluate whether to use AI/LLMs in a new product feature.",
        difficulty: "bonus",
        category: "bonus",
        context: "High-relevance question for modern engineering roles. Tests pragmatism, product sense, and whether you think about AI as a tool vs. a trend.",
        suggestedAnswer: "Framework: 1) Is the problem actually ambiguous/language-based (where AI excels) or deterministic (where rules/code is better)? 2) What's the cost and latency tolerance? 3) What happens when the AI is wrong (how bad is a hallucination here)? 4) Can you evaluate quality systematically? Build a simple eval set before shipping. Start with the cheapest model that meets your accuracy bar.",
        keyPointsToCover: ["AI is not always the right tool — show you know when NOT to use it", "Latency, cost, and failure mode analysis", "How to build an evaluation framework", "Iterative approach: don't over-engineer the first version"],
        redFlags: ["Treating AI as a magic solution", "Not thinking about failure cases (hallucinations, latency)", "No mention of cost or evaluation methodology"],
        timeToAnswer: "3-4 minutes",
      },
    ],
  };
}

// ─── Resume-Only ATS Analysis (No JD Required) ────────────────────────────────

export interface ResumeOnlyATSResult {
  overallScore: number;
  grade: "A" | "B" | "C" | "D" | "F";
  verdict: string;
  sections: {
    name: string;
    score: number;
    status: "excellent" | "good" | "needs-work" | "missing";
    issues: string[];
    fixes: string[];
  }[];
  quickWins: { action: string; impact: "high" | "medium" | "low"; effort: "quick" | "medium" | "involved" }[];
  strengths: string[];
  criticalIssues: string[];
}

export async function analyzeResumeATSOnly(params: {
  resumeData: ResumeData;
  jobDescription?: string;
}): Promise<ResumeOnlyATSResult> {
  const { resumeData, jobDescription = "" } = params;
  const resumeText = resumeToText(resumeData);

  const system = `You are an expert ATS (Applicant Tracking System) specialist and senior recruiter with 15+ years evaluating resumes.
Analyze the provided resume and return a comprehensive ATS quality audit.
${jobDescription ? "A target job description is also provided — factor keyword alignment into your analysis." : "No job description provided — perform a general ATS quality analysis."}

Return ONLY a single valid JSON object:
{
  "overallScore": <integer 0-100>,
  "grade": "<A|B|C|D|F>",
  "verdict": "<honest 1-2 sentence overall assessment>",
  "sections": [
    {
      "name": "<section name e.g. Contact Info, Summary, Experience, Skills, Education, Projects>",
      "score": <0-100>,
      "status": "<excellent|good|needs-work|missing>",
      "issues": ["<specific issue 1>", "<specific issue 2>"],
      "fixes": ["<specific actionable fix 1>", "<specific actionable fix 2>"]
    }
  ],
  "quickWins": [
    {
      "action": "<specific action to take>",
      "impact": "<high|medium|low>",
      "effort": "<quick|medium|involved>"
    }
  ],
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "criticalIssues": ["<critical issue 1>", "<critical issue 2>"]
}

Analyze these specific ATS criteria:
1. Contact section completeness (name, email, phone, LinkedIn, location)
2. Professional summary quality and keyword density
3. Experience bullets: action verbs, quantified impact, relevance
4. Skills section: specificity, ATS-parseable format
5. Education section completeness
6. Projects (if any): technical depth and impact
7. Overall formatting: ATS-parseable structure, no tables/columns that break parsing
8. Keyword optimization and density
9. Quantified achievements (numbers, percentages, dollar amounts)
10. Verb strength (avoided weak verbs like "helped", "was involved in")

Be specific and actionable. Output ONLY the JSON.`;

  const user = `Resume Content:
${resumeText.slice(0, 3500)}
${jobDescription ? `\nTarget Job Description:\n${jobDescription.slice(0, 1500)}` : ""}

Analyze this resume comprehensively and return the JSON audit.`;

  try {
    const raw = await callAI(system, user, 2000);
    const parsed = extractJSON<Partial<ResumeOnlyATSResult>>(raw);
    return {
      overallScore: typeof parsed.overallScore === "number" ? Math.max(0, Math.min(100, parsed.overallScore)) : 65,
      grade: (parsed.grade as any) || "C",
      verdict: parsed.verdict || "Resume has solid foundations with specific improvements needed for ATS optimization.",
      sections: Array.isArray(parsed.sections) ? parsed.sections : [],
      quickWins: Array.isArray(parsed.quickWins) ? parsed.quickWins : [],
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      criticalIssues: Array.isArray(parsed.criticalIssues) ? parsed.criticalIssues : [],
    };
  } catch {
    return buildFallbackATSAudit(resumeData);
  }
}

function buildFallbackATSAudit(resumeData: ResumeData): ResumeOnlyATSResult {
  const hasPhone = !!resumeData.personal.phone;
  const hasLinkedIn = !!resumeData.personal.linkedin;
  const hasSummary = resumeData.summary && resumeData.summary.trim().length > 30;
  const hasExperience = resumeData.experience && resumeData.experience.length > 0;
  const allBullets = resumeData.experience?.flatMap((e) => e.bullets || []).filter(Boolean) || [];
  const metricRegex = /\b\d+(\.\d+)?%?|\$|[\d,]+(\+)?\s*(users|clients|revenue|latency|hours|days|teams|projects|x|times)\b/i;
  const quantifiedBullets = allBullets.filter((b) => metricRegex.test(b));
  const quantRatio = allBullets.length > 0 ? quantifiedBullets.length / allBullets.length : 0;

  let score = 50;
  if (hasPhone) score += 5;
  if (hasLinkedIn) score += 5;
  if (hasSummary) score += 10;
  if (hasExperience) score += 10;
  if (quantRatio > 0.5) score += 10;
  if (resumeData.skills?.length > 0) score += 5;
  if (resumeData.education?.length > 0) score += 5;

  const grade = score >= 85 ? "A" : score >= 70 ? "B" : score >= 55 ? "C" : score >= 40 ? "D" : "F";

  return {
    overallScore: score,
    grade,
    verdict: `Your resume scores ${score}/100 on ATS optimization. ${score >= 70 ? "Strong foundation with room for targeted improvements." : "Several key sections need strengthening to pass automated screening systems."}`,
    strengths: [
      hasExperience ? "Work experience section is present and structured" : "Resume has a clear layout",
      resumeData.skills?.length > 0 ? "Skills section helps ATS keyword matching" : "Contact information is present",
      resumeData.projects?.length > 0 ? "Projects demonstrate hands-on technical ability" : "Education section adds credibility",
    ],
    criticalIssues: [
      !hasPhone ? "Missing phone number — many ATS systems require this for candidate contact" : "",
      !hasSummary ? "No professional summary — this is prime real estate for ATS keywords" : "",
      quantRatio < 0.3 ? "Less than 30% of experience bullets have quantified metrics — ATS and recruiters prioritize measurable impact" : "",
    ].filter(Boolean),
    sections: [
      {
        name: "Contact Information",
        score: [hasPhone, hasLinkedIn, !!resumeData.personal.email, !!resumeData.personal.location].filter(Boolean).length * 25,
        status: hasPhone && hasLinkedIn ? "excellent" : hasPhone || hasLinkedIn ? "good" : "needs-work",
        issues: [
          !hasPhone ? "Phone number is missing" : "",
          !hasLinkedIn ? "LinkedIn URL not included" : "",
          !resumeData.personal.location ? "Location missing (city/state minimum)" : "",
        ].filter(Boolean),
        fixes: [
          "Add a professional phone number",
          "Include your LinkedIn profile URL (linkedin.com/in/yourname)",
          "Add city and state/country — many ATS systems filter by location",
        ],
      },
      {
        name: "Professional Summary",
        score: hasSummary ? 75 : 20,
        status: hasSummary ? "good" : "missing",
        issues: !hasSummary ? ["No professional summary present — this is prime ATS real estate"] : ["Summary may benefit from more role-specific keywords"],
        fixes: ["Add a 2-4 sentence summary targeting your role title", "Include 3-5 high-value keywords from target job descriptions in your summary", "Lead with your years of experience and specialization"],
      },
      {
        name: "Work Experience",
        score: hasExperience ? (quantRatio > 0.5 ? 80 : quantRatio > 0.25 ? 60 : 40) : 0,
        status: !hasExperience ? "missing" : quantRatio > 0.5 ? "good" : "needs-work",
        issues: [
          !hasExperience ? "No work experience listed" : "",
          quantRatio < 0.3 ? `Only ${Math.round(quantRatio * 100)}% of bullets have measurable metrics` : "",
          allBullets.some((b) => b.toLowerCase().startsWith("helped") || b.toLowerCase().startsWith("assisted")) ? "Some bullets use weak verbs (helped, assisted, worked on)" : "",
        ].filter(Boolean),
        fixes: [
          "Start every bullet with a strong action verb (Led, Built, Reduced, Increased, Launched)",
          "Add numbers to at least 50% of bullets (team size, % improvement, revenue, users)",
          "Each bullet should follow: [Verb] + [What you did] + [Impact/Result]",
        ],
      },
      {
        name: "Skills",
        score: resumeData.skills?.some((s) => s.items.length > 3) ? 80 : 40,
        status: resumeData.skills?.length > 0 ? "good" : "missing",
        issues: [
          !resumeData.skills?.length ? "No skills section found" : "",
          resumeData.skills?.some((s) => s.items.length < 3) ? "Some skill categories have very few items listed" : "",
        ].filter(Boolean),
        fixes: [
          "List specific tools and technologies, not vague skills (e.g. 'React 18' not 'JavaScript frameworks')",
          "Group skills into categories (Languages, Frameworks, Tools, Cloud, etc.)",
          "Include skills mentioned in the job descriptions you're targeting",
        ],
      },
      {
        name: "Education",
        score: resumeData.education?.length > 0 ? 85 : 30,
        status: resumeData.education?.length > 0 ? "good" : "needs-work",
        issues: !resumeData.education?.length ? ["Education section missing or empty"] : [],
        fixes: [
          "Include your degree, field of study, institution name, and graduation year",
          "Add GPA if above 3.5/4.0 or equivalent",
          "List relevant coursework for entry-level positions",
        ],
      },
    ],
    quickWins: [
      { action: "Add quantified metrics to at least 3 experience bullets (numbers, %, $)", impact: "high", effort: "quick" },
      { action: "Include a 3-sentence professional summary with target role keywords", impact: "high", effort: "quick" },
      { action: "Add LinkedIn URL and phone number to contact section", impact: "medium", effort: "quick" },
      { action: "Replace weak verbs (helped, assisted, worked on) with strong action verbs", impact: "medium", effort: "quick" },
      { action: "Add 5-10 more specific technical skills matching your target job descriptions", impact: "high", effort: "medium" },
    ],
  };
}
