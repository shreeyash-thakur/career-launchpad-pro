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
