import type { ComponentType } from "react";
import type { ResumeData, ResumeStyle, TemplateMeta } from "../types";
import { ModernTemplate } from "./modern";
import { MinimalTemplate } from "./minimal";
import { ExecutiveTemplate } from "./executive";
import { DeveloperTemplate } from "./developer";
import { CreativeTemplate } from "./creative";
import { TimelineTemplate } from "./timeline";

export interface TemplateProps {
  data: ResumeData;
  style: ResumeStyle;
}

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
    id: "executive",
    name: "Executive",
    category: "Formal",
    description: "Centered serif header for senior, leadership and academic roles.",
    columns: 1,
    Component: ExecutiveTemplate,
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
    id: "developer",
    name: "Developer",
    category: "ATS-friendly",
    description: "Monospace, high-contrast, single column — built to parse cleanly in ATS systems.",
    columns: 1,
    Component: DeveloperTemplate,
  },
  {
    id: "timeline",
    name: "Timeline",
    category: "Visual",
    description: "A connected timeline highlights career and education progression at a glance.",
    columns: 1,
    Component: TimelineTemplate,
  },
];

export function getTemplate(id: string) {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]!;
}
