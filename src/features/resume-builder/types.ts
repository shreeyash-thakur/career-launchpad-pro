export type SectionKind =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "languages"
  | `custom:${string}`;

export interface PersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  photo: string; // data URL, empty string if none
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
  details: string;
}

export interface SkillGroup {
  id: string;
  category: string;
  items: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  tech: string[];
  link: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface LanguageItem {
  id: string;
  name: string;
  level: string;
}

export interface CustomEntry {
  id: string;
  heading: string;
  subheading: string;
  date: string;
  description: string;
}

export interface CustomSection {
  id: string;
  title: string;
  entries: CustomEntry[];
}

export interface ResumeData {
  personal: PersonalInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillGroup[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  languages: LanguageItem[];
  customSections: CustomSection[];
  /** Display order for the reorderable body sections (everything but the header). */
  sectionOrder: SectionKind[];
  /**
   * Sections the user has explicitly hidden from the résumé (they stay in sectionOrder so their
   * position + content are preserved if the user shows them again). Optional for backwards
   * compatibility with résumés saved before this field existed — treat missing as [].
   */
  hiddenSections?: SectionKind[];
}

export type PageSize = "letter" | "a4";
export type HeaderLayout = "left" | "center" | "split";
export type PhotoShape = "circle" | "square" | "none";
/** "template" means "let the template's own default decide" — the common/default choice. */
export type BulletStyle = "template" | "dot" | "dash" | "none";
export type DividerStyle = "template" | "on" | "off";

export interface ResumeStyle {
  templateId: string;
  accentColor: string;
  fontFamily: "sans" | "serif" | "mono";
  fontScale: number; // 0.85 - 1.15
  lineHeight: number; // 1.15 - 1.6
  pageSize: PageSize;
  headerLayout: HeaderLayout;
  photoShape: PhotoShape;
  showPhoto: boolean;
  /** Overrides each template's default bullet marker for experience bullets. Optional for backwards compatibility. */
  bulletStyle?: BulletStyle;
  /** Overrides each template's default rule/divider under section headings. Optional for backwards compatibility. */
  sectionDividers?: DividerStyle;
}

export interface TemplateMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  columns: 1 | 2;
}
