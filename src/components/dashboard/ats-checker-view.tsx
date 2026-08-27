"use client";
import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  FileSearch,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Target,
  TrendingUp,
  Zap,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Lightbulb,
  ClipboardList,
  Info,
  Copy,
  Check,
  Award,
  Sliders,
  Layers,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { type FirestoreResume } from "@/lib/resume-service";
import {
  analyzeComprehensiveATS,
  resumeToText,
  type ComprehensiveATSAuditResult,
  type ATSRecommendation,
  type SectionAudit,
} from "@/lib/ai-service";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  resumes: FirestoreResume[];
  preselectId?: string;
}

// ─── Score and Grade Visuals ──────────────────────────────────────────────────

function GradeBadge({ grade }: { grade: string }) {
  const colors: Record<string, string> = {
    "A+": "bg-emerald-500 text-white shadow-emerald-500/25 shadow-lg",
    A: "bg-emerald-600 text-white shadow-emerald-600/25 shadow-lg",
    B: "bg-blue-600 text-white shadow-blue-600/25 shadow-lg",
    C: "bg-amber-500 text-white shadow-amber-500/25 shadow-lg",
    D: "bg-orange-500 text-white shadow-orange-500/25 shadow-lg",
    F: "bg-red-500 text-white shadow-red-500/25 shadow-lg",
  };
  return (
    <div className={cn("flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl text-2xl font-black transition-all", colors[grade] || "bg-secondary text-foreground")}>
      <span>{grade}</span>
      <span className="text-[9px] font-semibold uppercase tracking-wider opacity-90">ATS Grade</span>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const color = score >= 80 ? "#22c55e" : score >= 65 ? "#3b82f6" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative flex shrink-0 items-center justify-center">
      <svg width="132" height="132" className="-rotate-90">
        <circle cx="66" cy="66" r={radius} fill="none" stroke="currentColor" strokeWidth="9" className="text-border" />
        <circle cx="66" cy="66" r={radius} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`} style={{ transition: "stroke-dasharray 1.2s ease" }} />
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-bold tabular-nums" style={{ color }}>{score}</div>
        <div className="text-[10px] text-muted-foreground font-medium">/ 100</div>
      </div>
    </div>
  );
}

function RecommendationCard({ rec, onCopy }: { rec: ATSRecommendation; onCopy: (text: string) => void }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const categoryConfig = {
    Critical: {
      bg: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30",
      badge: "bg-red-500 text-white",
      border: "border-red-500/40",
      icon: XCircle,
    },
    "High Impact": {
      bg: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
      badge: "bg-amber-500 text-white",
      border: "border-amber-500/40",
      icon: AlertTriangle,
    },
    "Quick Fix": {
      bg: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
      badge: "bg-blue-500 text-white",
      border: "border-blue-500/40",
      icon: Zap,
    },
    Optimization: {
      bg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
      badge: "bg-emerald-600 text-white",
      border: "border-emerald-500/40",
      icon: Sparkles,
    },
  };

  const config = categoryConfig[rec.category] || categoryConfig["High Impact"];
  const Icon = config.icon;

  const handleCopyFix = () => {
    if (!rec.exampleFix) return;
    onCopy(rec.exampleFix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("rounded-2xl border bg-card p-5 space-y-3.5 transition-all shadow-sm", config.border)}>
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", config.badge)}>
            <Icon className="size-3" />
            {rec.category}
          </span>
          <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-semibold text-foreground">
            {rec.section}
          </span>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            +{rec.impactScore} pts
          </span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-[11px] text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 self-end sm:self-auto"
        >
          {expanded ? "Hide Details" : "Show Details"}
          {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        </button>
      </div>

      {/* Title */}
      <h4 className="font-display text-sm font-bold text-foreground leading-snug">
        {rec.title}
      </h4>

      {expanded && (
        <div className="space-y-3 pt-1 text-xs animate-in fade-in-50 duration-200">
          {/* Issue */}
          <div className="rounded-xl bg-secondary/50 p-3 space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="size-3 text-amber-500" /> Detected Problem:
            </p>
            <p className="text-[11px] text-foreground leading-relaxed">
              {rec.issue}
            </p>
          </div>

          {/* Suggestion */}
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 space-y-1">
            <p className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
              <Lightbulb className="size-3" /> Recommended Fix:
            </p>
            <p className="text-[11px] text-foreground leading-relaxed">
              {rec.suggestion}
            </p>
          </div>

          {/* Concrete Example Fix */}
          {rec.exampleFix && (
            <div className="rounded-xl border border-border bg-background p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Wand2 className="size-3 text-primary" /> Suggested Replacement Example:
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyFix}
                  className="h-6 gap-1 px-2 text-[10px] font-semibold"
                >
                  {copied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                  {copied ? "Copied" : "Copy Fix"}
                </Button>
              </div>
              <pre className="rounded-lg bg-secondary/60 p-2.5 text-[11px] font-mono text-foreground leading-relaxed whitespace-pre-wrap select-all">
                {rec.exampleFix}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SectionAuditCard({ section }: { section: SectionAudit }) {
  const [open, setOpen] = useState(section.status === "needs-work" || section.status === "missing");
  const statusColors = {
    excellent: "border-emerald-500/30 bg-emerald-500/5",
    good: "border-blue-500/30 bg-blue-500/5",
    "needs-work": "border-amber-500/30 bg-amber-500/10",
    missing: "border-red-500/30 bg-red-500/10",
  };

  return (
    <div className={cn("rounded-2xl border text-xs transition-all", statusColors[section.status] || "border-border bg-card")}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left"
      >
        <div className="flex items-center gap-3">
          {section.status === "excellent" ? <CheckCircle2 className="size-4 text-emerald-500" /> :
           section.status === "good" ? <CheckCircle2 className="size-4 text-blue-500" /> :
           section.status === "needs-work" ? <AlertTriangle className="size-4 text-amber-500" /> :
           <XCircle className="size-4 text-red-500" />}
          <div>
            <span className="font-semibold text-foreground text-sm">{section.name}</span>
            <p className="text-[11px] text-muted-foreground">{section.summary}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <span className="font-bold text-foreground tabular-nums">{section.score}%</span>
            <div className="h-1.5 w-16 rounded-full bg-secondary overflow-hidden mt-1">
              <div
                className={cn("h-full rounded-full", section.score >= 75 ? "bg-emerald-500" : section.score >= 50 ? "bg-amber-500" : "bg-red-500")}
                style={{ width: `${section.score}%` }}
              />
            </div>
          </div>
          {open ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-border/60 p-4 space-y-3 animate-in fade-in-50 duration-200">
          {section.issues.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Issues Identified:</p>
              <ul className="space-y-1">
                {section.issues.map((issue, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-[11px] text-foreground">
                    <span className="text-amber-500 mt-0.5">•</span> {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {section.fixes.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Action Steps to Fix:</p>
              <ul className="space-y-1">
                {section.fixes.map((fix, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-[11px] text-foreground">
                    <span className="text-emerald-500 mt-0.5">✓</span> {fix}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {section.suggestedAdditions && section.suggestedAdditions.length > 0 && (
            <div className="pt-2 border-t border-border/40 space-y-1">
              <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Recommended Keywords/Items to Include:</p>
              <div className="flex flex-wrap gap-1">
                {section.suggestedAdditions.map((item, idx) => (
                  <span key={idx} className="rounded-md bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold">
                    + {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export function AtsCheckerView({ resumes, preselectId }: Props) {
  const [selectedResumeId, setSelectedResumeId] = useState<string>(preselectId || (resumes[0]?.id ?? ""));
  const [jobDescription, setJobDescription] = useState("");
  const [customResumeText, setCustomResumeText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ComprehensiveATSAuditResult | null>(null);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"recommendations" | "sections" | "jd-match">("recommendations");

  const activeResume = resumes.find((r) => r.id === selectedResumeId) || null;
  const hasJD = jobDescription.trim().length > 25;

  async function handleAnalyze() {
    const resumeText = activeResume ? resumeToText(activeResume.resumeData) : customResumeText;
    if (!resumeText.trim()) {
      toast.error("Please select a resume or paste your resume content.");
      return;
    }

    setIsAnalyzing(true);
    try {
      if (result) setPreviousScore(result.overallScore);

      const audit = await analyzeComprehensiveATS({
        resumeData: activeResume?.resumeData,
        resumeText,
        jobDescription: hasJD ? jobDescription : undefined,
      });

      setResult(audit);
      setActiveTab("recommendations");
      toast.success(`ATS Audit completed! Score: ${audit.overallScore}/100 (Grade ${audit.grade})`);
    } catch (err) {
      toast.error("Audit failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1.5">
          <Target className="size-4" />
          <span>AI ATS Audit & Actionable Optimization Engine</span>
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight">ATS Resume Checker</h1>
        <p className="text-xs text-muted-foreground max-w-xl">
          Get a comprehensive ATS quality audit with grades, specific recommendations, step-by-step fixes, and copyable rewrite examples — <strong>job description optional</strong>.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Input Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-3xl border border-border bg-card p-6 space-y-5 sticky top-4">
            <h3 className="font-display text-sm font-bold flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> Setup Resume Audit
            </h3>

            {resumes.length > 0 ? (
              <div className="space-y-1.5">
                <Label className="text-xs">Select Saved Resume:</Label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} ({r.templateId})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label className="text-xs">Paste Resume Text:</Label>
                <Textarea
                  placeholder="Paste your full resume text..."
                  value={customResumeText}
                  onChange={(e) => setCustomResumeText(e.target.value)}
                  className="h-32 text-xs"
                />
              </div>
            )}

            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Target Job Description</Label>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">Optional</span>
              </div>
              <Textarea
                placeholder="Leave blank for general ATS audit. Paste job posting requirements to get keyword gap analysis..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="h-36 text-xs font-mono leading-relaxed"
              />
              <p className="text-[10px] text-muted-foreground">
                💡 Adding a JD unlocks matched vs missing keyword analysis and seniority weighting.
              </p>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (!activeResume && !customResumeText.trim())}
              className="w-full bg-[image:var(--gradient-emerald)] text-primary-foreground font-semibold shadow-[var(--shadow-glow)] gap-2 text-xs"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" /> Auditing Resume & Generating Fixes…
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" /> {hasJD ? "Run ATS Audit + JD Match" : "Run Comprehensive ATS Audit"}
                </>
              )}
            </Button>

            {/* Quick Feature Checklist */}
            <div className="pt-3 border-t border-border/60 space-y-1.5 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3 text-emerald-500" />
                <span>Deterministic + AI Quality Scoring</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3 text-emerald-500" />
                <span>Concrete Suggested Rewrites & Examples</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3 text-emerald-500" />
                <span>Section-by-Section Quality Breakdown</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3 text-emerald-500" />
                <span>Quantification & Action Verb Analysis</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output Area */}
        <div className="lg:col-span-8 space-y-4">
          {result ? (
            <div className="space-y-5 animate-in fade-in-50 duration-300">
              {/* Score Snapshot Evolution */}
              {previousScore !== null && (
                <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-950 dark:text-emerald-200">
                  <div className="flex items-center gap-2 font-medium">
                    <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      Score Evolution: <strong className="line-through text-muted-foreground">{previousScore}</strong> → <strong className="font-bold text-emerald-700 dark:text-emerald-300">{result.overallScore}</strong>
                    </span>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                    {result.overallScore >= previousScore ? `+${result.overallScore - previousScore}` : result.overallScore - previousScore} pts
                  </span>
                </div>
              )}

              {/* Main Score Hero Card */}
              <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="flex items-center gap-4">
                    <ScoreRing score={result.overallScore} />
                    <GradeBadge grade={result.grade} />
                  </div>
                  <div className="space-y-2 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
                      <Target className="size-3.5" />
                      {result.overallScore >= 80 ? "Top-Tier ATS Alignment" : result.overallScore >= 65 ? "Good — Phrasing Improvements Needed" : "Critical Gaps — Low Pass Rate"}
                    </div>
                    <h3 className="font-display text-base font-bold text-foreground">
                      {result.verdict}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {result.summaryFeedback}
                    </p>
                    {activeResume && (
                      <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs mt-1">
                        <Link to="/builder" search={{ resumeId: activeResume.id, template: activeResume.templateId }}>
                          Open in Resume Builder to Apply Fixes <ArrowRight className="size-3" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Key ATS Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-border">
                  <div className="rounded-xl bg-secondary/40 p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground font-semibold">Quantified Impact</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">{result.metrics.quantifiedBulletsPercent}%</p>
                  </div>
                  <div className="rounded-xl bg-secondary/40 p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground font-semibold">Action Verbs</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">{result.metrics.actionVerbStrength}</p>
                  </div>
                  <div className="rounded-xl bg-secondary/40 p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground font-semibold">Skills Detected</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">{result.metrics.skillsCount}</p>
                  </div>
                  <div className="rounded-xl bg-secondary/40 p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground font-semibold">Contact Completeness</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">{result.metrics.contactCompleteness}%</p>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-1.5 border-b border-border pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("recommendations")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all",
                    activeTab === "recommendations"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <Lightbulb className="size-3.5" />
                  Recommendations & Fixes ({result.recommendations.length})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("sections")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all",
                    activeTab === "sections"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <ClipboardList className="size-3.5" />
                  Section Audit ({result.sections.length})
                </button>

                {result.jdMatch && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("jd-match")}
                    className={cn(
                      "flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all",
                      activeTab === "jd-match"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    <Target className="size-3.5" />
                    Job Match & Keywords
                  </button>
                )}
              </div>

              {/* Tab 1: Recommendations & Fixes */}
              {activeTab === "recommendations" && (
                <div className="space-y-4 animate-in fade-in-50 duration-200">
                  {/* Quick Wins Banner */}
                  {result.quickWins.length > 0 && (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Zap className="size-4 text-amber-500" />
                        <h4 className="font-display text-xs font-bold text-foreground">
                          Quick Wins — 2-Minute High-Leverage Actions
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {result.quickWins.map((win, i) => (
                          <div key={i} className="flex items-start justify-between gap-3 rounded-xl bg-background/80 p-2.5 text-xs border border-border/80">
                            <div className="space-y-1">
                              <span className="font-semibold text-foreground">{win.action}</span>
                              {win.fixCode && (
                                <p className="text-[11px] text-muted-foreground font-mono bg-secondary/50 p-1.5 rounded-lg">
                                  {win.fixCode}
                                </p>
                              )}
                            </div>
                            <span className={cn("rounded-md px-2 py-0.5 text-[9px] font-bold shrink-0 uppercase",
                              win.impact === "high" ? "bg-red-500/15 text-red-700 dark:text-red-300" : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                            )}>
                              {win.impact} impact
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* List of Detailed Recommendations */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-sm font-bold text-foreground">
                        Specific Actionable Recommendations ({result.recommendations.length})
                      </h3>
                      <span className="text-[11px] text-muted-foreground">
                        Implement these to maximize your ATS pass rate
                      </span>
                    </div>

                    {result.recommendations.map((rec) => (
                      <RecommendationCard key={rec.id} rec={rec} onCopy={handleCopy} />
                    ))}
                  </div>

                  {/* Strengths & Critical Blockers */}
                  <div className="grid gap-3 sm:grid-cols-2 pt-2">
                    {result.strengths.length > 0 && (
                      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="size-3.5" /> What You Did Well
                        </p>
                        <ul className="space-y-1 text-xs text-foreground">
                          {result.strengths.map((s, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-emerald-500 mt-0.5">✓</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.criticalIssues.length > 0 && (
                      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 space-y-2">
                        <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                          <XCircle className="size-3.5" /> Critical Rejection Risks
                        </p>
                        <ul className="space-y-1 text-xs text-foreground">
                          {result.criticalIssues.map((s, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-red-500 mt-0.5">✗</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Section-by-Section Audit */}
              {activeTab === "sections" && (
                <div className="space-y-3 animate-in fade-in-50 duration-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-bold text-foreground">
                      Section-by-Section Quality Audit
                    </h3>
                    <span className="text-[11px] text-muted-foreground">
                      Click any section to inspect specific issues & fixes
                    </span>
                  </div>

                  {result.sections.map((section, idx) => (
                    <SectionAuditCard key={idx} section={section} />
                  ))}
                </div>
              )}

              {/* Tab 3: JD Match & Keywords */}
              {activeTab === "jd-match" && result.jdMatch && (
                <div className="space-y-4 animate-in fade-in-50 duration-200">
                  <div className="rounded-3xl border border-border bg-card p-6 space-y-5">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">
                          Job Alignment Match
                        </span>
                        <h3 className="font-display text-lg font-bold text-foreground mt-0.5">
                          {result.jdMatch.verdict}
                        </h3>
                      </div>
                      <div className="rounded-2xl bg-primary/10 border border-primary/20 px-4 py-2 text-center shrink-0">
                        <span className="font-display text-2xl font-black text-primary tabular-nums">
                          {result.jdMatch.matchScore}%
                        </span>
                        <p className="text-[10px] font-semibold text-muted-foreground">JD Alignment</p>
                      </div>
                    </div>

                    {/* Keywords Breakdown */}
                    <div className="grid gap-3 sm:grid-cols-2 pt-3 border-t border-border">
                      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="size-3.5" /> Matched Keywords ({result.jdMatch.matchedKeywords.length})
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {result.jdMatch.matchedKeywords.map((k) => (
                            <span key={k} className="rounded-md bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 text-[11px] font-semibold">
                              {k}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
                        <p className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                          <AlertTriangle className="size-3.5" /> Missing Keywords from JD ({result.jdMatch.missingKeywords.length})
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {result.jdMatch.missingKeywords.map((k) => (
                            <button
                              key={k}
                              type="button"
                              onClick={() => handleCopy(k)}
                              className="rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-200 hover:bg-amber-500/25 px-2 py-0.5 text-[11px] font-semibold transition-colors"
                              title="Click to copy keyword"
                            >
                              + {k}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border p-16 text-center text-muted-foreground flex flex-col items-center justify-center space-y-4 min-h-[500px]">
              <FileSearch className="size-12 text-muted-foreground/40" />
              <div className="space-y-1.5">
                <h3 className="font-semibold text-base text-foreground">No ATS Audit Run Yet</h3>
                <p className="text-xs max-w-sm leading-relaxed">
                  Select your resume and click <strong>Run Comprehensive ATS Audit</strong>. <br />
                  <span className="text-muted-foreground">The AI engine will inspect your resume section-by-section and generate exact rewrite examples and fixes.</span>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] max-w-xs w-full">
                <div className="flex items-center gap-1.5 rounded-xl border border-border bg-secondary/30 p-2">
                  <Lightbulb className="size-3.5 text-primary shrink-0" />
                  <span>Actionable Fix Examples</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-xl border border-border bg-secondary/30 p-2">
                  <ClipboardList className="size-3.5 text-primary shrink-0" />
                  <span>Section Quality Audits</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-xl border border-border bg-secondary/30 p-2">
                  <Zap className="size-3.5 text-primary shrink-0" />
                  <span>Quick Wins Breakdown</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-xl border border-border bg-secondary/30 p-2">
                  <Target className="size-3.5 text-primary shrink-0" />
                  <span>Optional JD Keyword Match</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
