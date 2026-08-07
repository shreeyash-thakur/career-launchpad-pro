import type { ResumeData, ResumeStyle } from "./types";

let idCounter = 0;
export function makeId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

export function emptyPersonal() {
  return {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    photo: "",
  };
}

export const DEFAULT_SECTION_ORDER: ResumeData["sectionOrder"] = [
  "summary",
  "experience",
  "projects",
  "education",
  "skills",
  "certifications",
  "languages",
];

export function blankResume(): ResumeData {
  return {
    personal: emptyPersonal(),
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    customSections: [],
    sectionOrder: [...DEFAULT_SECTION_ORDER],
  };
}

export function sampleResume(): ResumeData {
  return {
    personal: {
      fullName: "Ananya Sharma",
      title: "Product Designer",
      email: "ananya.sharma@email.com",
      phone: "+91 98765 43210",
      location: "Bengaluru, India",
      website: "ananyasharma.design",
      linkedin: "linkedin.com/in/ananyasharma",
      github: "",
      photo: "",
    },
    summary:
      "Product designer with 6 years of experience shipping design systems and 0-to-1 products for consumer fintech. I pair fast prototyping with quantitative research to ship features that move activation and retention.",
    experience: [
      {
        id: makeId("exp"),
        role: "Senior Product Designer",
        company: "Northstar Finance",
        location: "Bengaluru, India",
        startDate: "2022-03",
        endDate: "",
        current: true,
        bullets: [
          "Led redesign of the onboarding flow, lifting activation by 24% across 180K monthly signups.",
          "Built and shipped a component-based design system adopted by 4 product squads.",
          "Ran weekly usability studies and translated findings into a prioritized design backlog.",
        ],
      },
      {
        id: makeId("exp"),
        role: "Product Designer",
        company: "Loopin Labs",
        location: "Remote",
        startDate: "2019-06",
        endDate: "2022-02",
        current: false,
        bullets: [
          "Designed the core scheduling product end-to-end from research through launch.",
          "Partnered with engineering to introduce a token-based theming system, cutting design QA time by 40%.",
        ],
      },
    ],
    education: [
      {
        id: makeId("edu"),
        school: "National Institute of Design",
        degree: "B.Des",
        field: "Interaction Design",
        startDate: "2015",
        endDate: "2019",
        gpa: "",
        details: "",
      },
    ],
    skills: [
      {
        id: makeId("skl"),
        category: "Design",
        items: ["Figma", "Prototyping", "Design systems", "User research"],
      },
      { id: makeId("skl"), category: "Tools", items: ["Notion", "Framer", "Jira", "Maze"] },
    ],
    projects: [
      {
        id: makeId("prj"),
        name: "Component Library v2",
        description:
          "Rebuilt the internal design system as a token-driven Figma + code library used by 40 designers and engineers.",
        tech: ["Figma", "Tokens Studio", "Storybook"],
        link: "",
      },
    ],
    certifications: [
      {
        id: makeId("cert"),
        name: "Certified Usability Analyst",
        issuer: "Human Factors International",
        date: "2021",
      },
    ],
    languages: [
      { id: makeId("lang"), name: "English", level: "Fluent" },
      { id: makeId("lang"), name: "Hindi", level: "Native" },
    ],
    customSections: [],
    sectionOrder: [...DEFAULT_SECTION_ORDER],
  };
}

export function defaultStyle(): ResumeStyle {
  return {
    templateId: "modern",
    accentColor: "#6d3fd1",
    fontFamily: "sans",
    fontScale: 1,
    lineHeight: 1.35,
    pageSize: "letter",
    headerLayout: "left",
    photoShape: "circle",
    showPhoto: false,
  };
}

export const ACCENT_PRESETS = [
  "#6d3fd1",
  "#2563eb",
  "#0f766e",
  "#b45309",
  "#be123c",
  "#0369a1",
  "#4d7c0f",
  "#111827",
];
