import type { ComponentType } from "react";
import type { TemplateMeta } from "../types";
import type { TemplateProps } from "./template-props";
import { ModernTemplate } from "./modern";
import { MinimalTemplate } from "./minimal";
import { ExecutiveTemplate } from "./executive";
import { DeveloperTemplate } from "./developer";
import { CreativeTemplate } from "./creative";
import { TimelineTemplate } from "./timeline";
import { CompactAtsTemplate } from "./compact-ats";
import { ElegantTemplate } from "./elegant";
import { BoldHeaderTemplate } from "./bold-header";
import { AcademicTemplate } from "./academic";
import { TechGridTemplate } from "./tech-grid";
import { StartupTemplate } from "./startup";
import { HarvardAtsTemplate } from "./harvard-ats";
import { MckinseyConsultingTemplate } from "./mckinsey-consulting";
import { WallStreetFinanceTemplate } from "./wall-street-finance";
import { ReactDeveloperTemplate } from "./react-developer";
import { TealSidebarTemplate } from "./teal-sidebar";
import { EditorialSlateTemplate } from "./editorial-slate";
import { AiResearchTemplate } from "./ai-research";
import { CampusGraduateTemplate } from "./campus-graduate";

export type { TemplateProps };

export const TEMPLATES: (TemplateMeta & { Component: ComponentType<TemplateProps> })[] = [
  {
    id: "modern",
    name: "Modern",
    category: "Popular",
    description: "Clean single column with a bold accent name and rule-lined sections.",
    columns: 1,
    Component: ModernTemplate,
  },
  {
    id: "minimal",
    name: "Minimal",
    category: "Understated",
    description: "Typography-first layout with generous whitespace. Great for any industry.",
    columns: 1,
    Component: MinimalTemplate,
  },
  {
    id: "compact-ats",
    name: "Compact ATS",
    category: "ATS-friendly",
    description:
      "Dense, single-column and parser-safe — fits more content per page for longer careers.",
    columns: 1,
    Component: CompactAtsTemplate,
  },
  {
    id: "harvard-ats",
    name: "Harvard Standard ATS",
    category: "ATS-friendly",
    description:
      "Gold-standard Ivy League traditional single-column template for strict ATS parsers.",
    columns: 1,
    Component: HarvardAtsTemplate,
  },
  {
    id: "executive",
    name: "Executive",
    category: "Formal",
    description: "Centered serif header for senior, leadership and academic roles.",
    columns: 1,
    Component: ExecutiveTemplate,
  },
  {
    id: "mckinsey-consulting",
    name: "McKinsey Strategy Consultant",
    category: "Corporate",
    description:
      "Ultra-clean, high-density single-column format favored in management consulting.",
    columns: 1,
    Component: MckinseyConsultingTemplate,
  },
  {
    id: "wall-street-finance",
    name: "Wall Street Finance Lead",
    category: "Finance",
    description:
      "Formal double-ruled lines with serif typography for banking and private equity.",
    columns: 1,
    Component: WallStreetFinanceTemplate,
  },
  {
    id: "elegant",
    name: "Elegant",
    category: "Two column",
    description: "Soft-toned sidebar with a photo and serif headers — refined, not flashy.",
    columns: 2,
    Component: ElegantTemplate,
  },
  {
    id: "teal-sidebar",
    name: "Teal Vista Sidebar",
    category: "Two column",
    description: "Luminous teal sidebar layout with initials avatar badge and clean sections.",
    columns: 2,
    Component: TealSidebarTemplate,
  },
  {
    id: "creative",
    name: "Creative",
    category: "Bold",
    description: "Two-column layout with a colored sidebar for contact, skills and languages.",
    columns: 2,
    Component: CreativeTemplate,
  },
  {
    id: "bold-header",
    name: "Bold Header",
    category: "Bold",
    description: "Full-width color banner header, then a clean single-column body.",
    columns: 1,
    Component: BoldHeaderTemplate,
  },
  {
    id: "startup",
    name: "Startup",
    category: "Modern",
    description: "Gradient accent header with rounded skill chips — playful, modern-tech energy.",
    columns: 1,
    Component: StartupTemplate,
  },
  {
    id: "developer",
    name: "Developer",
    category: "ATS-friendly",
    description: "Monospace, high-contrast, single column — built to parse cleanly in ATS systems.",
    columns: 1,
    Component: DeveloperTemplate,
  },
  {
    id: "react-developer",
    name: "Full-Stack React & Node",
    category: "Developer",
    description:
      "Two-column developer layout optimized for framework chips and GitHub repository links.",
    columns: 2,
    Component: ReactDeveloperTemplate,
  },
  {
    id: "tech-grid",
    name: "Tech Grid",
    category: "Technical",
    description:
      "Skills shown as a tag grid with a structured single column — built for engineers.",
    columns: 1,
    Component: TechGridTemplate,
  },
  {
    id: "ai-research",
    name: "AI & ML Research Spec",
    category: "Engineering",
    description:
      "Gradient accent bar with compact metrics display for data science and AI researchers.",
    columns: 1,
    Component: AiResearchTemplate,
  },
  {
    id: "timeline",
    name: "Timeline",
    category: "Visual",
    description: "A connected timeline highlights career and education progression at a glance.",
    columns: 1,
    Component: TimelineTemplate,
  },
  {
    id: "editorial-slate",
    name: "Editorial Slate",
    category: "Creative",
    description:
      "Magazine-style serif layout with generous whitespace for writers and content leads.",
    columns: 1,
    Component: EditorialSlateTemplate,
  },
  {
    id: "campus-graduate",
    name: "Campus Graduate Blue",
    category: "Student",
    description:
      "Centered header layout prioritizing Education and Projects for freshers and interns.",
    columns: 1,
    Component: CampusGraduateTemplate,
  },
  {
    id: "academic",
    name: "Academic",
    category: "Academic / CV",
    description:
      "Formal CV layout suited to research, publications and multi-page academic histories.",
    columns: 1,
    Component: AcademicTemplate,
  },
];

export function getTemplate(id: string) {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]!;
}
