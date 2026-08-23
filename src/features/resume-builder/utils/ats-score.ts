import type { ResumeData } from "../types";

/**
 * Deterministic ATS scoring layer.
 *
 * Everything in this file is a pure function over `ResumeData` — no AI call,
 * no randomness, no external state. The same resume always produces the
 * same score and the same check list. This is intentional: the spec this
 * was built against is explicit that the LLM must never be allowed to
 * invent the headline score, so all objectively-checkable signals (section
 * presence, contact completeness, date consistency, bullet length,
 * quantification, etc.) live here. The AI is only ever layered on top for
 * the things that genuinely require semantic judgement — keyword strength
 * against a role/JD and prose quality — see `analyzeResumeHealth` in
 * ai-service.ts, which adds a bounded AI contribution on top of this.
 */

export type CheckSeverity = "pass" | "warn" | "fail";

export interface AtsCheck {
  id: string;
  label: string;
  severity: CheckSeverity;
  /** Short explanation shown under the check when it's a warn/fail. */
  detail?: string | undefined;
}

export interface CategoryScore {
  id: string;
  label: string;
  score: number;
  max: number;
}

export interface DeterministicAtsResult {
  /** Sum of all category scores. Out of DETERMINISTIC_MAX (80). */
  score: number;
  max: number;
  categories: CategoryScore[];
  checks: AtsCheck[];
}

export const DETERMINISTIC_MAX = 100;
/** Raw internal weighting sums to this before being rescaled to 100. */
const RAW_MAX = 80;

const ACTION_VERBS = [
  "led",
  "built",
  "created",
  "developed",
  "designed",
  "implemented",
  "launched",
  "managed",
  "increased",
  "decreased",
  "reduced",
  "improved",
  "optimized",
  "architected",
  "engineered",
  "delivered",
  "drove",
  "spearheaded",
  "streamlined",
  "automated",
  "scaled",
  "achieved",
  "coordinated",
  "established",
  "generated",
  "grew",
  "resolved",
  "reduced",
  "shipped",
  "owned",
  "mentored",
  "analyzed",
  "wrote",
  "authored",
  "researched",
  "trained",
  "deployed",
  "migrated",
];

const METRIC_PATTERN = /\d/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /[\d][\d\s().-]{6,}/;
const URL_PATTERN = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;
const UNUSUAL_SYMBOL_PATTERN = /[★☆♦♣♠♥※©®™✓✔➤▶◆]/;

function pushCheck(checks: AtsCheck[], check: AtsCheck) {
  checks.push(check);
}

function scoreContactInfo(data: ResumeData, checks: AtsCheck[]): number {
  const p = data.personal;
  let score = 0;
  const max = 5;

  const hasName = Boolean(p.fullName?.trim());
  const hasEmail = Boolean(p.email?.trim() && EMAIL_PATTERN.test(p.email.trim()));
  const hasPhone = Boolean(p.phone?.trim() && PHONE_PATTERN.test(p.phone.trim()));
  const hasLinkedin = Boolean(p.linkedin?.trim());
  const hasGithubOrSite = Boolean(p.github?.trim() || p.website?.trim());

  pushCheck(checks, {
    id: "contact-name",
    label: "Full name present",
    severity: hasName ? "pass" : "fail",
    detail: hasName ? undefined : "Add your full name to the header.",
  });
  pushCheck(checks, {
    id: "contact-email",
    label: "Valid email address",
    severity: hasEmail ? "pass" : "fail",
    detail: hasEmail ? undefined : "Add a valid email address recruiters can reach you at.",
  });
  pushCheck(checks, {
    id: "contact-phone",
    label: "Phone number present",
    severity: hasPhone ? "pass" : "warn",
    detail: hasPhone
      ? undefined
      : "Add a phone number — some ATS systems flag resumes without one.",
  });
  pushCheck(checks, {
    id: "contact-linkedin",
    label: "LinkedIn URL present",
    severity: hasLinkedin ? "pass" : "warn",
    detail: hasLinkedin ? undefined : "Missing LinkedIn URL — most recruiters check it first.",
  });
  pushCheck(checks, {
    id: "contact-portfolio",
    label: "GitHub / portfolio link present",
    severity: hasGithubOrSite ? "pass" : "warn",
    detail: hasGithubOrSite ? undefined : "Add a GitHub or portfolio link if you have one.",
  });

  if (hasName) score += 1.5;
  if (hasEmail) score += 1.5;
  if (hasPhone) score += 0.75;
  if (hasLinkedin) score += 0.75;
  if (hasGithubOrSite) score += 0.5;

  return Math.min(max, score);
}

function scoreStructure(data: ResumeData, checks: AtsCheck[]): number {
  const max = 10;
  let score = 0;

  const coreSections: { key: string; present: boolean; label: string }[] = [
    { key: "summary", present: Boolean(data.summary?.trim()), label: "Summary" },
    { key: "experience", present: data.experience.length > 0, label: "Experience" },
    { key: "education", present: data.education.length > 0, label: "Education" },
    { key: "skills", present: data.skills.some((g) => g.items.length > 0), label: "Skills" },
  ];
  const presentCount = coreSections.filter((s) => s.present).length;

  pushCheck(checks, {
    id: "structure-core-sections",
    label: "Standard section headings present",
    severity: presentCount === coreSections.length ? "pass" : presentCount >= 2 ? "warn" : "fail",
    detail:
      presentCount === coreSections.length
        ? undefined
        : `Missing: ${coreSections
            .filter((s) => !s.present)
            .map((s) => s.label)
            .join(", ")}`,
  });

  const hiddenCount = data.hiddenSections?.length ?? 0;
  pushCheck(checks, {
    id: "structure-hidden-sections",
    label: "No sections hidden that ATS would expect",
    severity: hiddenCount === 0 ? "pass" : "warn",
    detail:
      hiddenCount > 0 ? `${hiddenCount} section(s) currently hidden from the résumé.` : undefined,
  });

  score += (presentCount / coreSections.length) * 8;
  if (hiddenCount === 0) score += 2;

  return Math.min(max, score);
}

function parseDateLoosely(value: string): number | null {
  if (!value?.trim()) return null;
  const v = value.trim();
  if (/present|current/i.test(v)) return Date.now();
  const parsed = Date.parse(v);
  if (!Number.isNaN(parsed)) return parsed;
  // Try "MMM yyyy" / "yyyy" fallbacks
  const yearMatch = v.match(/\d{4}/);
  if (yearMatch) return Date.parse(`${yearMatch[0]}-01-01`);
  return null;
}

function scoreExperience(data: ResumeData, checks: AtsCheck[]): number {
  const max = 15;
  let score = 0;

  if (data.experience.length === 0) {
    pushCheck(checks, {
      id: "experience-present",
      label: "Work experience listed",
      severity: "warn",
      detail: "No work experience yet — fine for freshers, but add internships/projects instead.",
    });
    return 0;
  }

  pushCheck(checks, {
    id: "experience-present",
    label: "Work experience listed",
    severity: "pass",
  });
  score += 3;

  const allBullets = data.experience.flatMap((e) => e.bullets.filter(Boolean));
  const bulletCount = allBullets.length;
  pushCheck(checks, {
    id: "experience-bullets",
    label: "Experience entries have bullet points",
    severity:
      bulletCount >= data.experience.length * 2 ? "pass" : bulletCount > 0 ? "warn" : "fail",
    detail:
      bulletCount === 0 ? "Add bullet points describing your impact in each role." : undefined,
  });
  score += Math.min(4, (bulletCount / Math.max(1, data.experience.length * 3)) * 4);

  const longBullets = allBullets.filter((b) => b.split(/\s+/).length > 28);
  pushCheck(checks, {
    id: "experience-bullet-length",
    label: "Bullets are a readable length",
    severity: longBullets.length === 0 ? "pass" : longBullets.length <= 2 ? "warn" : "fail",
    detail:
      longBullets.length > 0
        ? `${longBullets.length} bullet(s) are over 28 words — tighten them.`
        : undefined,
  });
  score += longBullets.length === 0 ? 3 : longBullets.length <= 2 ? 1.5 : 0;

  const actionVerbCount = allBullets.filter((b) => {
    const first = b
      .trim()
      .split(/\s+/)[0]
      ?.toLowerCase()
      .replace(/[^a-z]/g, "");
    return first ? ACTION_VERBS.includes(first) : false;
  }).length;
  const actionVerbRatio = bulletCount > 0 ? actionVerbCount / bulletCount : 0;
  pushCheck(checks, {
    id: "experience-action-verbs",
    label: "Bullets start with strong action verbs",
    severity: actionVerbRatio >= 0.7 ? "pass" : actionVerbRatio >= 0.3 ? "warn" : "fail",
    detail:
      actionVerbRatio < 0.7
        ? "Start more bullets with a strong verb (Led, Built, Reduced...)."
        : undefined,
  });
  score += actionVerbRatio * 3;

  const quantifiedCount = allBullets.filter((b) => METRIC_PATTERN.test(b)).length;
  const quantifiedRatio = bulletCount > 0 ? quantifiedCount / bulletCount : 0;
  pushCheck(checks, {
    id: "experience-quantified",
    label: "Bullets include measurable impact (numbers)",
    severity: quantifiedRatio >= 0.4 ? "pass" : quantifiedRatio > 0 ? "warn" : "fail",
    detail:
      quantifiedRatio < 0.4
        ? "Add numbers where you genuinely have them — scale, %, time saved."
        : undefined,
  });
  score += quantifiedRatio * 2;

  // Date consistency
  const badDates = data.experience.filter((e) => {
    const start = parseDateLoosely(e.startDate);
    const end = e.current ? Date.now() : parseDateLoosely(e.endDate);
    return start === null || end === null || start > end;
  });
  pushCheck(checks, {
    id: "experience-dates",
    label: "Consistent, valid date ranges",
    severity: badDates.length === 0 ? "pass" : "warn",
    detail:
      badDates.length > 0
        ? `${badDates.length} entry(ies) have missing or out-of-order dates.`
        : undefined,
  });

  return Math.min(max, score);
}

function scoreProjects(data: ResumeData, checks: AtsCheck[]): number {
  const max = 10;
  if (data.projects.length === 0) {
    pushCheck(checks, {
      id: "projects-present",
      label: "Projects listed",
      severity: "warn",
      detail: "Add 1-2 projects, especially useful if you have limited work experience.",
    });
    return 0;
  }
  let score = 4;
  pushCheck(checks, { id: "projects-present", label: "Projects listed", severity: "pass" });

  const withDescription = data.projects.filter((p) => p.description?.trim().length > 15);
  pushCheck(checks, {
    id: "projects-description",
    label: "Projects have real descriptions",
    severity:
      withDescription.length === data.projects.length
        ? "pass"
        : withDescription.length > 0
          ? "warn"
          : "fail",
  });
  score += (withDescription.length / data.projects.length) * 3;

  const withTech = data.projects.filter((p) => p.tech.length > 0);
  pushCheck(checks, {
    id: "projects-tech",
    label: "Projects list technologies used",
    severity:
      withTech.length === data.projects.length ? "pass" : withTech.length > 0 ? "warn" : "fail",
  });
  score += (withTech.length / data.projects.length) * 3;

  return Math.min(max, score);
}

function scoreEducation(data: ResumeData, checks: AtsCheck[]): number {
  const max = 5;
  if (data.education.length === 0) {
    pushCheck(checks, {
      id: "education-present",
      label: "Education listed",
      severity: "fail",
      detail: "Add your education history.",
    });
    return 0;
  }
  const complete = data.education.filter((e) => e.school?.trim() && e.degree?.trim());
  pushCheck(checks, {
    id: "education-present",
    label: "Education entries complete",
    severity: complete.length === data.education.length ? "pass" : "warn",
  });
  return complete.length === data.education.length
    ? max
    : (complete.length / data.education.length) * max;
}

function scoreSkills(data: ResumeData, checks: AtsCheck[]): number {
  const max = 10;
  const allSkills = data.skills.flatMap((g) => g.items);
  if (allSkills.length === 0) {
    pushCheck(checks, {
      id: "skills-present",
      label: "Skills section populated",
      severity: "fail",
      detail: "Add a skills section — it's one of the first things ATS parsers look for.",
    });
    return 0;
  }
  pushCheck(checks, {
    id: "skills-present",
    label: "Skills section populated",
    severity: allSkills.length >= 6 ? "pass" : "warn",
    detail: allSkills.length < 6 ? "List more specific, relevant skills (aim for 8+)." : undefined,
  });
  const organized = data.skills.length > 1 || data.skills.some((g) => g.category?.trim());
  pushCheck(checks, {
    id: "skills-organized",
    label: "Skills organized into categories",
    severity: organized ? "pass" : "warn",
    detail: organized
      ? undefined
      : "Group skills into categories (Languages, Frameworks, Tools) for readability.",
  });
  let score = Math.min(6, (allSkills.length / 10) * 6);
  if (organized) score += 4;
  return Math.min(max, score);
}

function scoreAtsCompatibility(data: ResumeData, checks: AtsCheck[]): number {
  const max = 15;
  let score = max;

  const allText = [
    data.summary,
    ...data.experience.flatMap((e) => e.bullets),
    ...data.projects.map((p) => p.description),
  ].join(" ");

  const hasUnusualSymbols = UNUSUAL_SYMBOL_PATTERN.test(allText);
  pushCheck(checks, {
    id: "ats-symbols",
    label: "No unusual symbols or icons in content",
    severity: hasUnusualSymbols ? "warn" : "pass",
    detail: hasUnusualSymbols
      ? "Decorative symbols can confuse ATS parsers — stick to plain text and standard bullets."
      : undefined,
  });
  if (hasUnusualSymbols) score -= 3;

  const linkFields = [data.personal.linkedin, data.personal.github, data.personal.website];
  const badLinks = linkFields.filter((l) => l?.trim() && !URL_PATTERN.test(l.trim()));
  pushCheck(checks, {
    id: "ats-links",
    label: "Contact links are well-formed URLs",
    severity: badLinks.length === 0 ? "pass" : "warn",
    detail: badLinks.length > 0 ? "One or more links don't look like valid URLs." : undefined,
  });
  if (badLinks.length > 0) score -= 2;

  const wordCount = allText.split(/\s+/).filter(Boolean).length;
  pushCheck(checks, {
    id: "ats-length",
    label: "Content length is reasonable",
    severity: wordCount >= 80 && wordCount <= 900 ? "pass" : wordCount < 80 ? "warn" : "warn",
    detail:
      wordCount < 80
        ? "Resume content looks thin — add more detail to your experience and projects."
        : wordCount > 900
          ? "Resume content is dense — consider trimming to stay within 1-2 pages."
          : undefined,
  });
  if (wordCount < 80 || wordCount > 900) score -= 3;

  return Math.max(0, Math.min(max, score));
}

function scoreReadability(data: ResumeData, checks: AtsCheck[]): number {
  const max = 10;
  let score = max;

  const summaryLen = data.summary?.trim().length ?? 0;
  const summaryOk = summaryLen === 0 || (summaryLen >= 40 && summaryLen <= 500);
  pushCheck(checks, {
    id: "readability-summary",
    label: "Summary is a focused length",
    severity: summaryOk ? "pass" : "warn",
    detail: !summaryOk
      ? "Keep your summary to 2-4 sentences (roughly 40-500 characters)."
      : undefined,
  });
  if (!summaryOk) score -= 3;

  const allBullets = data.experience.flatMap((e) => e.bullets.filter(Boolean));
  const veryLong = allBullets.filter((b) => b.length > 220);
  pushCheck(checks, {
    id: "readability-paragraphs",
    label: "No excessively long bullet paragraphs",
    severity: veryLong.length === 0 ? "pass" : "warn",
    detail:
      veryLong.length > 0
        ? `${veryLong.length} bullet(s) read more like a paragraph than a bullet — split them up.`
        : undefined,
  });
  if (veryLong.length > 0) score -= Math.min(4, veryLong.length * 1.5);

  return Math.max(0, Math.min(max, score));
}

/**
 * Runs the full deterministic pass over a resume. Pure function — call it
 * as many times as you like on the same input and it always returns the
 * same result. This is the score the AI layer adds bounded, semantic-only
 * signal on top of (see analyzeResumeHealth in ai-service.ts) — it is
 * never overridden or replaced by the AI.
 */
export function scoreResumeDeterministic(data: ResumeData): DeterministicAtsResult {
  const checks: AtsCheck[] = [];

  const contact = scoreContactInfo(data, checks);
  const structure = scoreStructure(data, checks);
  const experience = scoreExperience(data, checks);
  const projects = scoreProjects(data, checks);
  const education = scoreEducation(data, checks);
  const skills = scoreSkills(data, checks);
  const atsCompat = scoreAtsCompatibility(data, checks);
  const readability = scoreReadability(data, checks);

  // Rescale from the raw 80-point internal weighting up to a clean 100,
  // preserving relative category weights.
  const scale = DETERMINISTIC_MAX / RAW_MAX;
  const categories: CategoryScore[] = [
    {
      id: "atsCompatibility",
      label: "ATS Compatibility",
      score: round1(atsCompat * scale),
      max: round1(15 * scale),
    },
    {
      id: "structure",
      label: "Structure",
      score: round1(structure * scale),
      max: round1(10 * scale),
    },
    {
      id: "contact",
      label: "Contact Information",
      score: round1(contact * scale),
      max: round1(5 * scale),
    },
    {
      id: "skills",
      label: "Skills Relevance",
      score: round1(skills * scale),
      max: round1(10 * scale),
    },
    {
      id: "experience",
      label: "Experience Quality",
      score: round1(experience * scale),
      max: round1(15 * scale),
    },
    {
      id: "projects",
      label: "Project Quality",
      score: round1(projects * scale),
      max: round1(10 * scale),
    },
    {
      id: "education",
      label: "Education",
      score: round1(education * scale),
      max: round1(5 * scale),
    },
    {
      id: "readability",
      label: "Readability",
      score: round1(readability * scale),
      max: round1(10 * scale),
    },
  ];

  const score = round1(categories.reduce((sum, c) => sum + c.score, 0));

  return { score, max: DETERMINISTIC_MAX, categories, checks };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
