"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { TEMPLATE_CATEGORIES } from "@/constants/landing";
import { TEMPLATES as BUILDER_TEMPLATES } from "@/features/resume-builder/templates";
import { fadeUp, revealOnce, stagger } from "@/animations/variants";
import { SectionHeading } from "./section-heading";
import { TiltCard } from "./tilt-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Accent palette per template ────────────────────────────────────────────
const TEMPLATE_ACCENTS: Record<string, { bg: string; side: string }> = {
  modern:                { bg: "bg-[oklch(0.97_0.01_95)]",  side: "var(--gradient-emerald)" },
  minimal:               { bg: "bg-[oklch(0.98_0.005_95)]", side: "oklch(0.75_0.04_165)" },
  "compact-ats":         { bg: "bg-[oklch(0.97_0.01_95)]", side: "oklch(0.65_0.05_240)" },
  "harvard-ats":         { bg: "bg-[oklch(0.98_0.005_95)]", side: "oklch(0.2_0.02_240)" },
  executive:             { bg: "bg-[oklch(0.97_0.008_80)]", side: "oklch(0.6_0.08_40)" },
  "mckinsey-consulting": { bg: "bg-[oklch(0.97_0.01_95)]",  side: "oklch(0.3_0.08_240)" },
  "wall-street-finance": { bg: "bg-[oklch(0.97_0.008_80)]", side: "oklch(0.25_0.1_265)" },
  elegant:               { bg: "bg-[oklch(0.97_0.012_80)]", side: "var(--gradient-gold)" },
  "teal-sidebar":        { bg: "bg-[oklch(0.97_0.01_95)]",  side: "oklch(0.65_0.12_180)" },
  creative:              { bg: "bg-[oklch(0.97_0.01_95)]",  side: "var(--gradient-emerald)" },
  "bold-header":         { bg: "bg-[oklch(0.97_0.01_95)]", side: "var(--gradient-emerald)" },
  startup:               { bg: "bg-[oklch(0.97_0.01_95)]",  side: "var(--gradient-emerald)" },
  developer:             { bg: "bg-[oklch(0.12_0.02_240)]", side: "oklch(0.7_0.18_145)" },
  "react-developer":     { bg: "bg-[oklch(0.12_0.02_240)]", side: "oklch(0.65_0.18_220)" },
  "tech-grid":           { bg: "bg-[oklch(0.14_0.02_240)]", side: "oklch(0.6_0.15_260)" },
  "ai-research":         { bg: "bg-[oklch(0.97_0.01_95)]",  side: "oklch(0.7_0.16_60)" },
  timeline:              { bg: "bg-[oklch(0.97_0.01_95)]",  side: "var(--gradient-emerald)" },
  "editorial-slate":     { bg: "bg-[oklch(0.98_0.005_95)]", side: "oklch(0.35_0.05_240)" },
  "campus-graduate":     { bg: "bg-[oklch(0.97_0.01_95)]",  side: "oklch(0.55_0.15_250)" },
  academic:              { bg: "bg-[oklch(0.98_0.005_80)]", side: "oklch(0.55_0.08_30)" },
};

// ─── Category → template id map for filtering ────────────────────────────────
const CATEGORY_MAP: Record<string, string[]> = {
  All:           BUILDER_TEMPLATES.map((t) => t.id),
  Modern:        ["modern", "startup", "teal-sidebar"],
  Corporate:     ["executive", "modern", "mckinsey-consulting"],
  Creative:      ["creative", "bold-header", "startup", "editorial-slate"],
  Minimal:       ["minimal", "editorial-slate"],
  Developer:     ["developer", "react-developer", "tech-grid", "compact-ats"],
  Student:       ["campus-graduate", "minimal", "modern", "startup"],
  Executive:     ["executive", "elegant", "wall-street-finance", "mckinsey-consulting", "academic"],
  Elegant:       ["elegant", "teal-sidebar"],
  Engineering:   ["developer", "react-developer", "tech-grid", "ai-research", "compact-ats"],
  Marketing:     ["creative", "bold-header", "editorial-slate"],
  Finance:       ["wall-street-finance", "mckinsey-consulting", "executive", "minimal"],
  Medical:       ["academic", "minimal", "harvard-ats"],
  "ATS Friendly": ["compact-ats", "harvard-ats", "ats-classic", "developer", "minimal", "modern"],
  Timeline:      ["timeline"],
  "One Page":    ["minimal", "compact-ats", "modern", "harvard-ats", "mckinsey-consulting"],
};

// ─── Realistic mini resume thumbnail ────────────────────────────────────────
function ResumeThumbnail({
  templateId,
  recommended,
}: {
  templateId: string;
  recommended: boolean;
}) {
  const accent = TEMPLATE_ACCENTS[templateId] ?? TEMPLATE_ACCENTS["modern"]!;
  const isDark = templateId === "developer" || templateId === "tech-grid";
  const lineColor = isDark
    ? "oklch(0.7_0.15_145_/_30%)"
    : "oklch(0.2_0.02_165_/_14%)";
  const headlineColor = isDark
    ? "oklch(0.7_0.15_145_/_60%)"
    : "oklch(0.2_0.02_165_/_35%)";
  const isTwoCol = templateId === "elegant" || templateId === "creative";

  return (
    <div className={cn("relative aspect-[1/1.32] overflow-hidden rounded-2xl p-4", accent.bg)}>
      {/* Recommended sparkle badge */}
      {recommended && (
        <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full bg-[image:var(--gradient-gold)] px-2 py-0.5 text-[10px] font-semibold text-gold-foreground shadow-sm">
          <Star className="size-2.5 fill-current" aria-hidden="true" />
          Recommended
        </div>
      )}

      {/* Header bar / name block */}
      {isTwoCol ? (
        <div className="flex gap-2 h-full">
          {/* Sidebar */}
          <div
            className="w-1/3 rounded-lg p-2 flex flex-col gap-1.5"
            style={{ background: accent.side }}
          >
            <div className="h-2 w-4/5 rounded-full bg-white/40" />
            <div className="h-1.5 w-3/5 rounded-full bg-white/30" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-1.5 rounded-full bg-white/20" style={{ width: `${60 + i * 8}%` }} />
            ))}
          </div>
          {/* Main */}
          <div className="flex flex-1 flex-col gap-1.5 pt-1">
            <div className="h-2 w-4/5 rounded-full" style={{ backgroundColor: headlineColor }} />
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-1.5 rounded-full" style={{ backgroundColor: lineColor, width: `${68 + ((i * 11) % 28)}%` }} />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Full-width header */}
          <div
            className="h-8 w-full rounded-md mb-3 flex items-center px-3"
            style={{ background: accent.side }}
          >
            <div className="h-2 w-2/5 rounded-full bg-white/50" />
          </div>
          {/* Body lines */}
          <div className="flex flex-col gap-1.5">
            <div className="h-2 w-1/3 rounded-full" style={{ backgroundColor: headlineColor }} />
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-1.5 rounded-full" style={{ backgroundColor: lineColor, width: `${68 + ((i * 13) % 28)}%` }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Template card ────────────────────────────────────────────────────────────
function TemplateCard({
  template,
  recommended,
}: {
  template: (typeof BUILDER_TEMPLATES)[number];
  recommended: boolean;
}) {
  return (
    <TiltCard className="rounded-3xl h-full" intensity={8}>
      <article className="glass overflow-hidden rounded-3xl p-3 h-full flex flex-col">
        <ResumeThumbnail templateId={template.id} recommended={recommended} />
        <div className="flex items-end justify-between px-2 pb-1 pt-3 mt-auto">
          <div className="min-w-0">
            <h3 className="font-display text-sm font-semibold truncate">{template.name}</h3>
            <p className="text-xs text-muted-foreground truncate">{template.category}</p>
          </div>
          <Link
            id={`use-template-${template.id}`}
            to="/builder"
            search={{ template: template.id }}
            className="ml-3 shrink-0 inline-flex items-center gap-1 rounded-lg bg-[image:var(--gradient-emerald)] px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:brightness-110 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`Use ${template.name} template`}
          >
            Use this
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </article>
    </TiltCard>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const ALL_CATEGORIES = ["All", ...TEMPLATE_CATEGORIES] as const;

export function TemplateShowcase() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [recommendedId, setRecommendedId] = useState<string | null>(null);

  // Read sessionStorage for onboarding recommendation
  useEffect(() => {
    try {
      const rec = sessionStorage.getItem("onboarding:recommended");
      if (rec) setRecommendedId(rec);
    } catch {}
  }, []);

  const visibleIds = CATEGORY_MAP[activeCategory] ?? CATEGORY_MAP["All"]!;
  const visibleTemplates = BUILDER_TEMPLATES.filter((t) => visibleIds.includes(t.id));

  return (
    <section id="templates" className="section-pad relative px-4">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Templates"
          title="Pick your look. We'll handle the rest."
          description="Every template is drawn from scratch with its own typographic system, then stress-tested against real résumé content. ATS-clean under the hood."
        />

        {/* Category filter pills */}
        <motion.div
          variants={stagger(0.03, 0.02)}
          initial="hidden"
          whileInView="show"
          viewport={revealOnce}
          className="mt-10 flex flex-wrap justify-center gap-2"
          role="tablist"
          aria-label="Filter templates by category"
        >
          {ALL_CATEGORIES.map((category) => (
            <motion.div key={category} variants={fadeUp}>
              <button
                id={`filter-${category.toLowerCase().replace(/\s+/g, "-")}`}
                role="tab"
                aria-selected={activeCategory === category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "glass inline-flex rounded-full px-3.5 py-1.5 text-xs transition-all duration-200 cursor-pointer",
                  "hover:text-foreground hover:border-primary/40",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  activeCategory === category
                    ? "text-foreground border-primary/60 bg-[color-mix(in_oklab,var(--primary)_12%,transparent)] font-semibold shadow-[0_0_16px_color-mix(in_oklab,var(--primary)_20%,transparent)]"
                    : "text-muted-foreground",
                )}
              >
                {category}
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Template cards grid */}
        <div className="mt-12 min-h-[420px]">
          <AnimatePresence mode="wait">
            <motion.ul
              key={activeCategory}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
            >
              {visibleTemplates.map((template) => (
                <li key={template.id}>
                  <TemplateCard
                    template={template}
                    recommended={template.id === recommendedId}
                  />
                </li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </div>

        {/* CTA */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={revealOnce}
          className="mt-10 flex flex-col items-center gap-4"
        >
          <Link
            id="browse-all-templates"
            to="/onboarding"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-emerald)] px-7 h-12 text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:brightness-110 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Sparkles className="size-4" aria-hidden="true" />
            Let us pick the best template for you
          </Link>
          <p className="text-xs text-muted-foreground">5 quick questions · takes under a minute</p>
        </motion.div>
      </div>
    </section>
  );
}
