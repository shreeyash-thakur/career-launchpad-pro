"use client";
import React, { useState } from "react";
import { GraduationCap, CheckCircle2, ChevronRight, Layers, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ResumeData } from "@/features/resume-builder/types";
import { cn } from "@/lib/utils";

interface Props {
  data: ResumeData;
  onApplyOrder?: () => void;
}

export function FresherGuidePanel({ data, onApplyOrder }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const [expandedTip, setExpandedTip] = useState<string | null>("education");

  if (dismissed) return null;

  const hasEducation = data.education.length > 0;
  const hasProjects = data.projects.length > 0;
  const hasSkills = data.skills.length > 0 && data.skills.some((s) => s.items.length > 0);
  const hasSummary = Boolean(data.summary && data.summary.trim().length > 20);

  const completedCount = [hasEducation, hasProjects, hasSkills, hasSummary].filter(Boolean).length;

  return (
    <div className="no-print rounded-2xl border border-primary/30 bg-[color-mix(in_oklab,var(--primary)_8%,var(--card))] p-4 text-xs space-y-3 mb-4 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-3.5" />
          </span>
          <div>
            <h4 className="font-semibold text-foreground">Fresher Career Accelerator Mode</h4>
            <p className="text-[10px] text-muted-foreground">Guided tips for fresh grads and early-career talent</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-foreground p-1 rounded"
          aria-label="Dismiss fresher guidance"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* Progress pill */}
      <div className="flex items-center justify-between bg-background/60 rounded-xl p-2 border border-border/60">
        <span className="text-[11px] font-medium text-foreground">
          Fresher Checklist: {completedCount} / 4 Essential Sections
        </span>
        <div className="flex gap-1">
          {[hasEducation, hasProjects, hasSkills, hasSummary].map((done, idx) => (
            <div
              key={idx}
              className={cn(
                "size-2 rounded-full",
                done ? "bg-emerald-500" : "bg-secondary border border-border",
              )}
            />
          ))}
        </div>
      </div>

      {/* Interactive Tips */}
      <div className="space-y-1.5">
        <button
          type="button"
          onClick={() => setExpandedTip(expandedTip === "education" ? null : "education")}
          className="w-full flex items-center justify-between p-2 rounded-xl bg-card/60 hover:bg-card border border-border/50 text-left transition-colors"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className={cn("size-3.5", hasEducation ? "text-emerald-500" : "text-muted-foreground/50")} />
            <span className="font-medium text-[11px]">1. Lead with Education & Coursework</span>
          </div>
          <ChevronRight className={cn("size-3 text-muted-foreground transition-transform", expandedTip === "education" && "rotate-90")} />
        </button>
        {expandedTip === "education" && (
          <div className="p-2.5 text-[11px] text-muted-foreground bg-background/40 rounded-xl border border-border/40 space-y-1">
            <p>For fresh grads, recruiters look at your degree, GPA (if &gt; 3.2), relevant academic coursework, and capstone thesis highlights.</p>
            {onApplyOrder && (
              <Button variant="ghost" size="sm" onClick={onApplyOrder} className="h-6 px-2 text-[10px] text-primary gap-1 font-semibold">
                <Layers className="size-3" /> Place Education First
              </Button>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => setExpandedTip(expandedTip === "projects" ? null : "projects")}
          className="w-full flex items-center justify-between p-2 rounded-xl bg-card/60 hover:bg-card border border-border/50 text-left transition-colors"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className={cn("size-3.5", hasProjects ? "text-emerald-500" : "text-muted-foreground/50")} />
            <span className="font-medium text-[11px]">2. Showcase 2-3 High-Impact Projects</span>
          </div>
          <ChevronRight className={cn("size-3 text-muted-foreground transition-transform", expandedTip === "projects" && "rotate-90")} />
        </button>
        {expandedTip === "projects" && (
          <div className="p-2.5 text-[11px] text-muted-foreground bg-background/40 rounded-xl border border-border/40">
            <p>Treat your personal and hackathon projects with the same gravity as job experience. Detail the problem solved, tech stack used, and deploy live links or GitHub repos.</p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setExpandedTip(expandedTip === "skills" ? null : "skills")}
          className="w-full flex items-center justify-between p-2 rounded-xl bg-card/60 hover:bg-card border border-border/50 text-left transition-colors"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className={cn("size-3.5", hasSkills ? "text-emerald-500" : "text-muted-foreground/50")} />
            <span className="font-medium text-[11px]">3. Categorize Technical & Tool Skills</span>
          </div>
          <ChevronRight className={cn("size-3 text-muted-foreground transition-transform", expandedTip === "skills" && "rotate-90")} />
        </button>
        {expandedTip === "skills" && (
          <div className="p-2.5 text-[11px] text-muted-foreground bg-background/40 rounded-xl border border-border/40">
            <p>Avoid a single unordered skill blob. Separate into Languages (Python, JavaScript), Frameworks (React, Node), and Tools (Git, Docker, Figma).</p>
          </div>
        )}
      </div>
    </div>
  );
}
