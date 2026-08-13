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
    title: "Print-ready export",
    body: "Vector-sharp PDF at true page size. No watermarks, no compression artifacts.",
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
    title: "One profile, many resumes",
    body: "Duplicate, rename, favourite and organise variants for every role you chase.",
  },
  {
    icon: Type,
    title: "Typography that behaves",
    body: "Optical sizing and consistent baselines across all 25 templates. Nothing ever collides.",
  },
] as const;

export const STATS = [
  { value: 25, suffix: "+", label: "Original templates" },
  { value: 148000, suffix: "+", label: "Resumes crafted" },
  { value: 96, suffix: "%", label: "ATS parse rate" },
  { value: 4.9, decimals: 1, suffix: "/5", label: "Average rating" },
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
  "Medical",
  "ATS Friendly",
  "Timeline",
  "One Page",
] as const;

export const TEMPLATES = [
  { name: "Meridian", category: "Modern", accent: "emerald" },
  { name: "Charter", category: "Corporate", accent: "gold" },
  { name: "Atelier", category: "Creative", accent: "emerald" },
  { name: "Quiet", category: "Minimal", accent: "gold" },
  { name: "Monospace", category: "Developer", accent: "emerald" },
  { name: "Campus", category: "Student", accent: "gold" },
  { name: "Boardroom", category: "Executive", accent: "emerald" },
  { name: "Vellum", category: "Elegant", accent: "gold" },
] as const;

export const TESTIMONIALS = [
  {
    quote:
      "I rebuilt eight years of experience in about twenty minutes. The live preview is the first one I've used that doesn't lie about the print.",
    name: "Ananya Rao",
    role: "Staff Engineer, fintech",
  },
  {
    quote:
      "Our whole cohort switched. The typography alone puts these resumes ahead of anything coming out of a word processor.",
    name: "Marcus Bell",
    role: "Career coach, MBA program",
  },
  {
    quote:
      "Duplicating a resume per application sounds small. It changed how aggressively I apply.",
    name: "Sofia Marchetti",
    role: "Product designer",
  },
  {
    quote:
      "Exported straight to the recruiter portal, parsed perfectly, no reformatting email for the first time ever.",
    name: "Daniel Okoye",
    role: "Data scientist",
  },
] as const;

export const PRICING = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "Everything you need to ship one excellent resume.",
    features: ["1 resume", "6 templates", "PDF export", "Autosave & undo"],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Professional",
    price: "$9",
    period: "per month",
    description: "For people actively interviewing across multiple roles.",
    features: [
      "Unlimited resumes",
      "All 25+ templates",
      "Full customization suite",
      "Custom sections & icons",
      "Print-ready high-res export",
    ],
    cta: "Go professional",
    featured: true,
  },
  {
    name: "Career Suite",
    price: "$19",
    period: "per month",
    description: "Early access to everything we ship next.",
    features: [
      "Everything in Professional",
      "Portfolio generator",
      "Job tracker",
      "Priority support",
    ],
    cta: "Join the suite",
    featured: false,
  },
] as const;

export const FAQS = [
  {
    q: "Do I need an account to try it?",
    a: "No. You can open the builder, pick a template and design a full resume before signing up. Creating an account is only needed to save, sync and export.",
  },
  {
    q: "Will my resume pass applicant tracking systems?",
    a: "Every template renders a semantic, selectable text layer beneath the visual design. Parsers read clean headings, dates and roles rather than an image of a page.",
  },
  {
    q: "Can I use my own fonts and colors?",
    a: "Yes. Accent color, type pairing, spacing scale, margins, corner radius, header layout and profile image shape are all adjustable per resume.",
  },
  {
    q: "What happens to my data?",
    a: "Your documents are stored against your account and are never sold, shared or used to train anything. You can delete a resume, or your whole account, at any time.",
  },
  {
    q: "Is the export really print-ready?",
    a: "Exports are true page size at high resolution with embedded fonts, so a printed copy matches the screen exactly.",
  },
  {
    q: "What is coming after this release?",
    a: "The roadmap adds an ATS scorer, interview coach, job tracker and portfolio generator. The foundation is already structured for them.",
  },
] as const;
