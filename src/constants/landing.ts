import {
  Blocks,
  Download,
  Layers,
  MousePointerClick,
  Palette,
  ShieldCheck,
  Sparkles,
  Type,
  Undo2,
} from "lucide-react";

export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Templates", href: "#templates" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
] as const;

export const FEATURES = [
  {
    icon: MousePointerClick,
    title: "Drag, drop, done",
    body: "Reorder every section with a single grab. The live preview keeps pace at 60fps, no reloads.",
  },
  {
    icon: Layers,
    title: "Live multi-page preview",
    body: "Watch pages break and reflow as you type. What you see is exactly what prints.",
  },
  {
    icon: Palette,
    title: "Total control of taste",
    body: "Fonts, accent colors, spacing, margins, radius, header layout — tuned to the pixel.",
  },
  {
    icon: Undo2,
    title: "Autosave with time travel",
    body: "Every keystroke is saved. Undo and redo across the whole document history.",
  },
  {
    icon: ShieldCheck,
    title: "ATS-clean output",
    body: "Semantic text layers under the design, so parsers read what recruiters read.",
  },
  {
    icon: Download,
    title: "100% Free PDF Export",
    body: "Vector-sharp PDF at true page size. No watermarks, no paywalls, and no subscription locks.",
  },
] as const;

export const BENEFITS = [
  {
    icon: Sparkles,
    title: "Built for the ten-second scan",
    body: "Hierarchy, rhythm and whitespace tuned by designers so the important line lands first.",
  },
  {
    icon: Blocks,
    title: "One account, multiple resumes",
    body: "Duplicate, rename, organize, and tailor specialized resume variants for every job opportunity.",
  },
  {
    icon: Type,
    title: "Typography that behaves",
    body: "Optical sizing and consistent baselines across all 20+ templates. Nothing ever collides.",
  },
] as const;

export const STATS = [
  { value: 20, suffix: "+", label: "Original ATS templates" },
  { value: 100, suffix: "%", label: "Free PDF downloads" },
  { value: 98, suffix: "%", label: "ATS parse reliability" },
  { value: 4.9, decimals: 1, suffix: "/5", label: "User satisfaction" },
] as const;

export const TEMPLATE_CATEGORIES = [
  "Modern",
  "Corporate",
  "Creative",
  "Minimal",
  "Developer",
  "Student",
  "Executive",
  "Elegant",
  "Engineering",
  "Marketing",
  "Finance",
  "ATS Friendly",
  "Timeline",
] as const;

export const TEMPLATES = [
  { name: "Modern", category: "Modern", accent: "emerald" },
  { name: "McKinsey Consulting", category: "Corporate", accent: "gold" },
  { name: "Creative Sidebar", category: "Creative", accent: "emerald" },
  { name: "Minimalist", category: "Minimal", accent: "gold" },
  { name: "Monospace Developer", category: "Developer", accent: "emerald" },
  { name: "Campus Graduate", category: "Student", accent: "gold" },
  { name: "Executive Serif", category: "Executive", accent: "emerald" },
  { name: "Wall Street Finance", category: "Finance", accent: "gold" },
] as const;

export const TESTIMONIALS = [
  {
    quote:
      "I tailored my resume for three different roles in about twenty minutes. The live preview is the first one I've used that doesn't lie about the print output.",
    name: "Ananya Rao",
    role: "Staff Engineer, Fintech",
  },
  {
    quote:
      "Our entire university cohort switched to PeasiProfile. The typography and ATS friendliness puts these resumes ahead of typical word processor files.",
    name: "Marcus Bell",
    role: "Career Advisor, MBA Program",
  },
  {
    quote:
      "Having a dashboard to manage multiple resumes per company application changed how strategically I apply.",
    name: "Sofia Marchetti",
    role: "Product Designer",
  },
  {
    quote:
      "Exported straight to the recruiter portal, parsed cleanly with zero formatting errors. Extremely fast and completely free.",
    name: "Daniel Okoye",
    role: "Data Scientist",
  },
] as const;

export const PRICING = [
  {
    name: "Standard Access",
    price: "Free",
    period: "forever",
    description: "Everything you need to craft, customize, and download recruiter-ready resumes.",
    features: [
      "Unlimited resumes & variants",
      "All 20+ ATS-optimized templates",
      "Full design customization suite",
      "Live vector PDF download",
      "Real-time autosave & history",
      "AI bullet point & summary tools",
    ],
    cta: "Start Free Now",
    featured: true,
  },
] as const;

export const FAQS = [
  {
    q: "Is PeasiProfile really free to use and download?",
    a: "Yes. You can create, edit, customize, and download vector PDF resumes 100% free with no paywall or hidden subscription.",
  },
  {
    q: "Do I have to go through the dashboard to create my resume?",
    a: "No! You can start directly from 'Create My Resume', answer quick questions, pick a template, edit your resume, and download your PDF. The dashboard is an optional workspace for returning to manage your resumes.",
  },
  {
    q: "Will my resume pass Applicant Tracking Systems (ATS)?",
    a: "Every template renders a semantic text layer beneath the visual design. Modern ATS parsers cleanly extract roles, dates, skills, and bullet points without distortion.",
  },
  {
    q: "Can I manage multiple resumes for different jobs?",
    a: "Yes. In your dashboard, you can create multiple specialized resumes (e.g. Frontend Developer, Full-Stack, Team Lead), duplicate existing resumes, and rename them per application.",
  },
  {
    q: "What happens to my data?",
    a: "Your data belongs to you. It is stored securely against your Firebase account and you can export or delete your documents at any time.",
  },
  {
    q: "Is the PDF export true to page size?",
    a: "Yes. Exports use print-accurate CSS page media rules (Letter and A4) so printed and downloaded PDFs match the screen preview exactly.",
  },
] as const;
