import React from "react";
import { Link } from "@tanstack/react-router";
import {
  Sparkles,
  Wand2,
  Bot,
  FileSearch,
  Zap,
  ArrowRight,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * This tab used to contain three "AI" demo tools (Bullet Enhancer, Summary
 * Generator, Keyword Matcher) that were entirely fake — they ran setTimeout
 * and string templates instead of calling the AI, and the keyword matcher
 * used a hardcoded static dictionary. All of that has been removed.
 *
 * Every one of those capabilities now exists for real, wired to the actual
 * OpenRouter-backed AI service, right where it's most useful: inside the
 * resume editor itself (so suggestions land straight in your resume) and
 * in the dedicated ATS Score Checker tab. This page is now an honest
 * landing/launch point plus a genuinely useful static reference.
 */
export function AiToolsView() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1.5">
          <Sparkles className="size-4" />
          <span>Real AI-Powered Utilities</span>
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight">AI Career Tools</h1>
        <p className="text-xs text-muted-foreground max-w-lg">
          Every AI tool below writes directly into your resume as you build it, or analyses it
          against a real job description — no demos, no placeholders.
        </p>
      </div>

      {/* Real tool launch cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6 space-y-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Wand2 className="size-5" />
          </div>
          <h3 className="font-display text-base font-bold">Summary &amp; Bullet Writer</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Open any resume in the editor and use the <strong>Write with AI</strong> buttons on
            your Summary, Experience bullets, and Project descriptions. Each one reads your role,
            skills, and existing content to generate results tailored to you.
          </p>
          <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
            <Link to="/dashboard" search={{ tab: "resumes" }}>
              Open a resume <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 space-y-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FileSearch className="size-5" />
          </div>
          <h3 className="font-display text-base font-bold">ATS Score Checker</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Paste a real job description and get a genuine AI-scored match against your resume —
            matched keywords, missing keywords, and specific fixes, not a static word list.
          </p>
          <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
            <Link to="/dashboard" search={{ tab: "ats" }}>
              Check ATS Score <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 space-y-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ListChecks className="size-5" />
          </div>
          <h3 className="font-display text-base font-bold">Skill Suggestions</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            In the Skills section of the editor, hit <strong>Suggest skills</strong> to get 8–10
            role-relevant skills the AI thinks you're missing, merged straight into your list.
          </p>
          <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
            <Link to="/dashboard" search={{ tab: "resumes" }}>
              Open a resume <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 space-y-3 opacity-90">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
            <Bot className="size-5" />
          </div>
          <h3 className="font-display text-base font-bold">Cover Letter Generator</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Generate a tailored cover letter from your resume and a job description in one click.
          </p>
          <span className="inline-flex w-fit rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
            Coming soon
          </span>
        </div>
      </div>

      {/* Power Action Verbs — legitimate static reference, kept */}
      <div className="rounded-3xl border border-border bg-card p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-amber-500" />
          <h3 className="font-display text-base font-bold">Executive Action Verb Reference</h3>
        </div>
        <p className="text-xs text-muted-foreground -mt-4">
          A quick-reference word bank — swap weak, passive phrasing in your bullets for one of
          these instead.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <VerbGroup
            title="Leadership & Ownership"
            verbs={["Spearheaded", "Orchestrated", "Directed", "Championed", "Guided", "Steered", "Mobilized"]}
          />
          <VerbGroup
            title="Engineering & Building"
            verbs={["Architected", "Engineered", "Constructed", "Deployed", "Implemented", "Devised", "Configured"]}
          />
          <VerbGroup
            title="Growth & Optimization"
            verbs={["Accelerated", "Amplified", "Maximized", "Streamlined", "Elevated", "Scaled", "Revitalized"]}
          />
          <VerbGroup
            title="Analysis & Problem Solving"
            verbs={["Identified", "Diagnosed", "Overhauled", "Formulated", "Synthesized", "Resolved", "Standardized"]}
          />
        </div>
      </div>

      {/* Honest Roadmap Section */}
      <div className="rounded-3xl border border-border bg-card/60 p-6 space-y-4">
        <h3 className="font-display text-sm font-bold">Upcoming AI Tools</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <RoadmapCard
            title="AI Cover Letter Generator"
            description="Generate tailored cover letters referencing specific job requirements and resume milestones."
          />
          <RoadmapCard
            title="LinkedIn Profile Tailor"
            description="Optimize your LinkedIn headline and about section for recruiter searches."
          />
          <RoadmapCard
            title="Mock Interview Coach"
            description="Simulate role-specific technical and behavioral interviews with real-time feedback."
          />
        </div>
      </div>
    </div>
  );
}

function VerbGroup({ title, verbs }: { title: string; verbs: string[] }) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-2">
      <h4 className="text-xs font-bold text-foreground">{title}</h4>
      <div className="flex flex-wrap gap-1">
        {verbs.map((v) => (
          <span
            key={v}
            className="rounded-md bg-background px-2 py-0.5 text-[11px] text-muted-foreground border border-border/60"
          >
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}

function RoadmapCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-secondary/20 p-4 space-y-1.5 opacity-80">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-xs">{title}</span>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
          Coming Soon
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground">{description}</p>
    </div>
  );
}