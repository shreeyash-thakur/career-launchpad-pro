import type { ResumeData } from "../types";

export interface CompletionBreakdown {
  score: number;
  personal: boolean;
  summary: boolean;
  experience: boolean;
  education: boolean;
  skills: boolean;
  extras: boolean;
  missing: string[];
}

export function calculateResumeCompletion(
  data: ResumeData | null | undefined,
): CompletionBreakdown {
  if (!data) {
    return {
      score: 0,
      personal: false,
      summary: false,
      experience: false,
      education: false,
      skills: false,
      extras: false,
      missing: ["Personal Info", "Summary", "Experience", "Education", "Skills"],
    };
  }

  let score = 0;
  const missing: string[] = [];

  // Personal Info (25%)
  const hasName = Boolean(data.personal?.fullName?.trim());
  const hasEmail = Boolean(data.personal?.email?.trim());
  const hasContact = Boolean(data.personal?.phone?.trim() || data.personal?.location?.trim());
  const personal = hasName && (hasEmail || hasContact);
  if (personal) {
    score += 25;
  } else {
    missing.push("Personal details");
  }

  // Summary (15%)
  const summary = Boolean(data.summary && data.summary.trim().length > 20);
  if (summary) {
    score += 15;
  } else {
    missing.push("Professional summary");
  }

  // Experience (20%)
  const experience = Boolean(
    data.experience &&
    data.experience.length > 0 &&
    data.experience.some((exp) => exp.role?.trim() && exp.company?.trim()),
  );
  if (experience) {
    score += 20;
  } else {
    missing.push("Work experience");
  }

  // Education (15%)
  const education = Boolean(
    data.education &&
    data.education.length > 0 &&
    data.education.some((edu) => edu.school?.trim() || edu.degree?.trim()),
  );
  if (education) {
    score += 15;
  } else {
    missing.push("Education");
  }

  // Skills (15%)
  const skills = Boolean(
    data.skills &&
    data.skills.length > 0 &&
    data.skills.some((group) => group.items && group.items.length > 0),
  );
  if (skills) {
    score += 15;
  } else {
    missing.push("Skills");
  }

  // Projects / Certifications / Languages / Custom (10%)
  const hasProjects = Boolean(
    data.projects && data.projects.length > 0 && data.projects.some((p) => p.name?.trim()),
  );
  const hasCerts = Boolean(
    data.certifications &&
    data.certifications.length > 0 &&
    data.certifications.some((c) => c.name?.trim()),
  );
  const hasLangs = Boolean(
    data.languages && data.languages.length > 0 && data.languages.some((l) => l.name?.trim()),
  );
  const hasCustom = Boolean(
    data.customSections &&
    data.customSections.length > 0 &&
    data.customSections.some((s) => s.title?.trim()),
  );
  const extras = hasProjects || hasCerts || hasLangs || hasCustom;
  if (extras) {
    score += 10;
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    personal,
    summary,
    experience,
    education,
    skills,
    extras,
    missing,
  };
}
