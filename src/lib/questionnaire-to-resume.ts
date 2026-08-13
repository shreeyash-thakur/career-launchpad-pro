import type {
  CertificationItem,
  CustomSection,
  EducationItem,
  ExperienceItem,
  LanguageItem,
  PersonalInfo,
  ProjectItem,
  ResumeData,
  SectionKind,
  SkillGroup,
} from "@/features/resume-builder/types";
import {
  DEFAULT_SECTION_ORDER,
  emptyPersonal,
  makeId,
} from "@/features/resume-builder/sample-data";
import type { QuestionnaireAnswers } from "@/lib/resume-service";

const CAREER_GOAL_LABELS: Record<string, string> = {
  internship: "an internship",
  "first-job": "an entry-level role",
  experienced: "an experienced-level role",
  "career-change": "a career change",
  college: "college / university admission",
};

const INDUSTRY_LABELS: Record<string, string> = {
  tech: "technology",
  finance: "finance",
  marketing: "marketing and design",
  healthcare: "healthcare",
  education: "education",
  other: "their field",
};

function buildSummary(answers: QuestionnaireAnswers): string {
  const role = answers.targetRole?.trim();
  const goal = answers.careerGoal ? CAREER_GOAL_LABELS[answers.careerGoal] : undefined;
  const industry = answers.targetIndustry ? INDUSTRY_LABELS[answers.targetIndustry] : undefined;

  if (!role && !goal) return "";

  const parts: string[] = [];
  parts.push(role ? `${role} pursuing ${goal ?? "new opportunities"}` : `Pursuing ${goal}`);
  if (industry) parts.push(`in ${industry}`);

  return `${parts.join(" ")}.`;
}

/**
 * Converts the answers collected by the questionnaire wizard into the shape the
 * resume builder/editor/templates actually render (`ResumeData`). Without this,
 * a completed questionnaire leaves the resume itself blank.
 */
export function answersToResumeData(answers: QuestionnaireAnswers): ResumeData {
  const personal: PersonalInfo = {
    ...emptyPersonal(),
    fullName: answers.personal?.fullName ?? "",
    title: answers.targetRole ?? "",
    email: answers.personal?.email ?? "",
    phone: answers.personal?.phone ?? "",
    location: answers.personal?.location ?? "",
    website: answers.personal?.portfolio ?? "",
    linkedin: answers.personal?.linkedin ?? "",
    github: answers.personal?.github ?? "",
  };

  const experience: ExperienceItem[] = (answers.experience ?? []).map((e) => ({
    id: makeId("exp"),
    role: e.position,
    company: e.company,
    location: e.location,
    startDate: e.startDate,
    endDate: e.current ? "" : e.endDate,
    current: Boolean(e.current),
    bullets: e.bullets ?? [],
  }));

  const education: EducationItem[] = (answers.education ?? []).map((e) => ({
    id: makeId("edu"),
    school: e.school,
    degree: e.degree,
    field: e.field,
    startDate: e.startDate,
    endDate: e.endDate,
    gpa: e.gpa,
    details: "",
  }));

  const skills: SkillGroup[] = [];
  if (answers.skills?.technical?.length) {
    skills.push({
      id: makeId("skl"),
      category: "Technical Skills",
      items: answers.skills.technical,
    });
  }
  if (answers.skills?.tools?.length) {
    skills.push({ id: makeId("skl"), category: "Tools", items: answers.skills.tools });
  }
  if (answers.skills?.languages?.length) {
    skills.push({
      id: makeId("skl"),
      category: "Languages & Frameworks",
      items: answers.skills.languages,
    });
  }
  if (answers.skills?.soft?.length) {
    skills.push({ id: makeId("skl"), category: "Soft Skills", items: answers.skills.soft });
  }

  const projects: ProjectItem[] = (answers.projects ?? []).map((p) => ({
    id: makeId("prj"),
    name: p.name,
    description: p.description,
    tech: p.technologies ?? [],
    link: p.url || p.githubUrl || "",
  }));

  const certifications: CertificationItem[] = (answers.certifications ?? []).map((c) => ({
    id: makeId("cert"),
    name: c.name,
    issuer: c.issuer,
    date: c.date,
  }));

  const languages: LanguageItem[] = (answers.additional?.languages ?? [])
    .filter((l) => l.name)
    .map((l) => ({ id: makeId("lang"), name: l.name, level: l.level }));

  // Achievements + free-text "additional" answers become custom sections so
  // nothing the person typed gets silently dropped.
  const customSections: CustomSection[] = [];
  const extraSectionOrder: SectionKind[] = [];

  if (answers.achievements?.length) {
    const section: CustomSection = {
      id: makeId("cus"),
      title: "Achievements",
      entries: answers.achievements.map((a) => ({
        id: makeId("ent"),
        heading: a,
        subheading: "",
        date: "",
        description: "",
      })),
    };
    customSections.push(section);
    extraSectionOrder.push(`custom:${section.id}`);
  }

  const miscEntries = [
    { label: "Volunteer Experience", value: answers.additional?.volunteer },
    { label: "Publications", value: answers.additional?.publications },
    { label: "Extracurricular Activities", value: answers.additional?.extracurricular },
    { label: "Interests", value: answers.additional?.interests },
  ].filter((entry): entry is { label: string; value: string } => Boolean(entry.value?.trim()));

  if (miscEntries.length) {
    const section: CustomSection = {
      id: makeId("cus"),
      title: "Additional Information",
      entries: miscEntries.map((entry) => ({
        id: makeId("ent"),
        heading: entry.label,
        subheading: "",
        date: "",
        description: entry.value,
      })),
    };
    customSections.push(section);
    extraSectionOrder.push(`custom:${section.id}`);
  }

  return {
    personal,
    summary: buildSummary(answers),
    experience,
    education,
    skills,
    projects,
    certifications,
    languages,
    customSections,
    sectionOrder: [...DEFAULT_SECTION_ORDER, ...extraSectionOrder],
    hiddenSections: [],
  };
}
