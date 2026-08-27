"use client";
import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  Award,
  Sparkles,
  CheckCircle2,
  Circle,
  ArrowRight,
  TrendingUp,
  FileText,
  Target,
  Globe,
  Bot,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { type FirestoreResume } from "@/lib/resume-service";
import { calculateCareerReadiness, type CareerReadinessReport } from "@/lib/ai-service";
import { cn } from "@/lib/utils";

interface Props {
  resumes: FirestoreResume[];
}

export function CareerReadinessView({ resumes }: Props) {
  const [selectedResumeId, setSelectedResumeId] = useState<string>(resumes[0]?.id ?? "");
  const activeResume = resumes.find((r) => r.id === selectedResumeId) || resumes[0];

  const report = calculateCareerReadiness({
    resumeData: activeResume?.resumeData,
    atsScore: 78,
    hasCoverLetter: true,
    hasLinkedInOpt: true,
    hasInterviewPrep: true,
  });

  const levelColor =
    report.level === "Executive Ready"
      ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/30"
      : report.level === "Job Ready"
        ? "text-primary bg-primary/10 border-primary/30"
        : "text-amber-600 bg-amber-500/10 border-amber-500/30";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1.5">
          <Award className="size-4" />
          <span>Composite Career Readiness Index</span>
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Career Readiness Score</h1>
        <p className="text-xs text-muted-foreground max-w-xl">
          Track your overall job application maturity across resume structure, ATS keyword alignment, cover letters, online presence, and interview preparedness.
        </p>
      </div>

      {resumes.length > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-muted-foreground">Active Profile:</span>
          <select
            value={selectedResumeId}
            onChange={(e) => setSelectedResumeId(e.target.value)}
            className="h-8 rounded-xl border border-input bg-card px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
          >
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Main Readiness Gauge */}
      <div className="rounded-3xl border border-border bg-gradient-to-r from-card via-card/80 to-secondary/30 p-6 sm:p-8 backdrop-blur">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border", levelColor)}>
              <Award className="size-3.5" />
              {report.level} Status
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
              Overall Job Search Readiness
            </h2>
            <p className="text-xs text-muted-foreground max-w-md">
              Your profile is in the top tier of candidates with high-impact bullets, complete social profiles, and target job matching.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card/90 p-6 shadow-sm min-w-[160px]">
            <span className="font-display text-4xl font-extrabold text-primary tabular-nums">
              {report.score}%
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">
              Readiness Index
            </span>
          </div>
        </div>
      </div>

      {/* Action Checklist */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-3">
          <h3 className="font-display text-sm font-bold">Readiness Verification Checklist</h3>
          <div className="space-y-2.5">
            {report.checklist.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-start justify-between gap-3 rounded-2xl border p-4 text-xs transition-all",
                  item.completed ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-card",
                )}
              >
                <div className="flex items-start gap-3">
                  {item.completed ? (
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{item.title}</span>
                      <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{item.recommendation}</p>
                  </div>
                </div>
                <span className={cn("text-[11px] font-bold shrink-0", item.completed ? "text-emerald-600" : "text-muted-foreground")}>
                  +{item.impactScore} pts
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Launchpad to Tools */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-display text-sm font-bold">Quick Boost Launchpad</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" asChild className="w-full justify-between text-xs h-9">
                <Link to="/dashboard" search={{ tab: "ats" }}>
                  <span className="flex items-center gap-2">
                    <Target className="size-3.5 text-primary" /> Run ATS Check
                  </span>
                  <ArrowRight className="size-3 text-muted-foreground" />
                </Link>
              </Button>

              <Button variant="outline" size="sm" asChild className="w-full justify-between text-xs h-9">
                <Link to="/dashboard" search={{ tab: "ai-tools" }}>
                  <span className="flex items-center gap-2">
                    <FileText className="size-3.5 text-primary" /> Cover Letter
                  </span>
                  <ArrowRight className="size-3 text-muted-foreground" />
                </Link>
              </Button>

              <Button variant="outline" size="sm" asChild className="w-full justify-between text-xs h-9">
                <Link to="/dashboard" search={{ tab: "ai-tools" }}>
                  <span className="flex items-center gap-2">
                    <Globe className="size-3.5 text-primary" /> LinkedIn Tailor
                  </span>
                  <ArrowRight className="size-3 text-muted-foreground" />
                </Link>
              </Button>

              <Button variant="outline" size="sm" asChild className="w-full justify-between text-xs h-9">
                <Link to="/dashboard" search={{ tab: "ai-tools" }}>
                  <span className="flex items-center gap-2">
                    <Bot className="size-3.5 text-primary" /> Mock Interview Prep
                  </span>
                  <ArrowRight className="size-3 text-muted-foreground" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
