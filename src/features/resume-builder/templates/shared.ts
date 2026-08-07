import type { ResumeData, SectionKind } from "../types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Accepts "YYYY-MM", "YYYY", or free text and renders something reasonable. */
export function formatDate(value: string): string {
  if (!value) return "";
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (match) {
    const year = match[1] ?? "";
    const monthIndex = Number(match[2] ?? "0") - 1;
    const month = MONTHS[monthIndex];
    return month ? `${month} ${year}` : year;
  }
  return value;
}

export function dateRange(start: string, end: string, current: boolean): string {
  const startLabel = formatDate(start);
  const endLabel = current ? "Present" : formatDate(end);
  if (!startLabel && !endLabel) return "";
  if (!endLabel) return startLabel;
  if (!startLabel) return endLabel;
  return `${startLabel} — ${endLabel}`;
}

export interface OrderedSection {
  kind: SectionKind;
  hasContent: boolean;
}

/** Sections in the user's chosen order, tagged with whether they have content. */
export function orderedSections(data: ResumeData): OrderedSection[] {
  return data.sectionOrder.map((kind) => ({ kind, hasContent: sectionHasContent(data, kind) }));
}

export function sectionHasContent(data: ResumeData, kind: SectionKind): boolean {
  switch (kind) {
    case "summary":
      return Boolean(data.summary.trim());
    case "experience":
      return data.experience.length > 0;
    case "education":
      return data.education.length > 0;
    case "skills":
      return data.skills.length > 0;
    case "projects":
      return data.projects.length > 0;
    case "certifications":
      return data.certifications.length > 0;
    case "languages":
      return data.languages.length > 0;
    default: {
      if (kind.startsWith("custom:")) {
        const id = kind.slice("custom:".length);
        const section = data.customSections.find((s) => s.id === id);
        return Boolean(section && section.entries.length > 0);
      }
      return false;
    }
  }
}

export function sectionLabel(data: ResumeData, kind: SectionKind): string {
  switch (kind) {
    case "summary":
      return "Summary";
    case "experience":
      return "Experience";
    case "education":
      return "Education";
    case "skills":
      return "Skills";
    case "projects":
      return "Projects";
    case "certifications":
      return "Certifications";
    case "languages":
      return "Languages";
    default: {
      if (kind.startsWith("custom:")) {
        const id = kind.slice("custom:".length);
        return data.customSections.find((s) => s.id === id)?.title || "Custom section";
      }
      return kind;
    }
  }
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}
