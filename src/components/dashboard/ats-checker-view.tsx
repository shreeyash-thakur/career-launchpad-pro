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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { type FirestoreResume } from "@/lib/resume-service";
import {
  analyzeResumeATSOnly,
  checkATSScore,
  resumeToText,
  type ResumeOnlyATSResult,
  type ScoredATSResult,
} from "@/lib/ai-service";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  resumes: FirestoreResume[];
  preselectId?: string;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function GradeBadge({ grade }: { grade: string }) {
  const colors: Record<string, string> = {
    A: "bg-emerald-500 text-white",
    B: "bg-blue-500 text-white",
    C: "bg-amber-500 text-white",
    D: "bg-orange-500 text-white",
    F: "bg-red-500 text-white",
  };
  return (
    <div className={cn("flex size-16 items-center justify-center rounded-2xl text-3xl font-black shadow-sm", colors[grade] ?? "bg-secondary text-foreground")}>
      {grade}
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const color = score >= 75 ? "#22c55e" : score >= 55 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative flex shrink-0 items-center justify-center">
      <svg width="132" height="132" className="-rotate-90">
        <circle cx="66" cy="66" r={radius} fill="none" stroke="currentColor" strokeWidth="9" className="text-border" />
        <circle cx="66" cy="66" r={radius} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`} style={{ transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-bold tabular-nums" style={{ color }}>{score}</div>
        <div className="text-[10px] text-muted-foreground font-medium">/ 100</div>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "excellent") return <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />;
  if (status === "good") return <CheckCircle2 className="size-4 text-blue-500 shrink-0" />;
  if (status === "needs-work") return <AlertTriangle className="size-4 text-amber-500 shrink-0" />;
  return <XCircle className="size-4 text-red-500 shrink-0" />;
}

function SectionCard({ section }: { section: ResumeOnlyATSResult["sections"][0] }) {
  const [open, setOpen] = useState(section.status === "needs-work" || section.status === "missing");
  const statusColors = {
    excellent: "border-emerald-500/30 bg-emerald-500/5",
    good: "border-blue-500/30 bg-blue-500/5",
    "needs-work": "border-amber-500/30 bg-amber-500/10",
    missing: "border-red-500/30 bg-red-500/10",
  };
  return (
    <div className={cn("rounded-2xl border text-xs transition-all", statusColors[section.status as keyof typeof statusColors] || "border-border bg-card")}>
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 p-3.5 text-left">
        <StatusIcon status={section.status} />
        <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
          <span className="font-semibold text-foreground">{section.name}</span>
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <div className="h-1.5 w-16 rounded-full bg-secondary overflow-hidden">
                <div className={cn("h-full rounded-full", section.score >= 75 ? "bg-emerald-500" : section.score >= 50 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${section.score}%` }} />
              </div>
              {section.score}%
            </div>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
              section.status === "excellent" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" :
              section.status === "good" ? "bg-blue-500/15 text-blue-700 dark:text-blue-300" :
              section.status === "needs-work" ? "bg-amber-500/15 text-amber-700 dark:text-amber-300" :
              "bg-red-500/15 text-red-700 dark:text-red-300"
            )}>
              {section.status.replace("-", " ")}
            </span>
            {open ? <ChevronUp className="size-3.5 text-muted-foreground" /> : <ChevronDown className="size-3.5 text-muted-foreground" />}
          </div>
        </div>
      </button>
      {open && (section.issues.length > 0 || section.fixes.length > 0) && (
        <div className="border-t border-border/40 p-3.5 grid gap-3 sm:grid-cols-2 animate-in fade-in-50 duration-150">
          {section.issues.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Issues Found</p>
              {section.issues.map((issue, i) => (
                <p key={i} className="text-[11px] text-foreground flex items-start gap-1.5">
                  <AlertTriangle className="size-3 text-amber-500 shrink-0 mt-0.5" /> {issue}
                </p>
              ))}
            </div>
          )}
          {section.fixes.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">How to Fix</p>
              {section.fixes.map((fix, i) => (
                <p key={i} className="text-[11px] text-foreground flex items-start gap-1.5">
                  <CheckCircle2 className="size-3 text-emerald-500 shrink-0 mt-0.5" /> {fix}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BucketBar({ label, weight, score }: { label: string; weight: string; score: number }) {
  const color = score >= 75 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{label} <span className="text-[10px] text-muted-foreground">({weight})</span></span>
        <span className="font-semibold tabular-nums">{score}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function AtsCheckerView({ resumes, preselectId }: Props) {
  const [selectedResumeId, setSelectedResumeId] = useState<string>(preselectId || (resumes[0]?.id ?? ""));
  const [jobDescription, setJobDescription] = useState("");
  const [customResumeText, setCustomResumeText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resumeOnlyResult, setResumeOnlyResult] = useState<ResumeOnlyATSResult | null>(null);
  const [jdResult, setJdResult] = useState<ScoredATSResult | null>(null);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<"overview" | "sections" | "jd">("overview");

  const activeResume = resumes.find((r) => r.id === selectedResumeId) || null;
  const hasJD = jobDescription.trim().length > 30;

  async function handleAnalyze() {
    const resumeText = activeResume ? resumeToText(activeResume.resumeData) : customResumeText;
    if (!resumeText.trim()) {
      toast.error("Please select a resume or paste your resume content.");
      return;
    }

    setIsAnalyzing(true);
    try {
      if (resumeOnlyResult) setPreviousScore(resumeOnlyResult.overallScore);

      // Always run the resume-only analysis
      const roResult = await analyzeResumeATSOnly({
        resumeData: activeResume?.resumeData!,
        jobDescription: hasJD ? jobDescription : undefined,
      });
      setResumeOnlyResult(roResult);

      // If JD provided, also run JD match scoring
      if (hasJD && (activeResume?.resumeData || resumeText)) {
        const jdRes = await checkATSScore({
          resumeText,
          jobDescription,
          resumeData: activeResume?.resumeData,
        });
        setJdResult(jdRes);
        setActiveResultTab("jd");
      } else {
        setJdResult(null);
        setActiveResultTab("overview");
      }

      toast.success(`ATS analysis complete! Score: ${roResult.overallScore}/100 (Grade ${roResult.grade})`);
    } catch (err) {
      toast.error("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  const result = resumeOnlyResult;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1.5">
          <Target className="size-4" />
          <span>Comprehensive ATS & Resume Quality Analyzer</span>
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight">ATS Resume Checker</h1>
        <p className="text-xs text-muted-foreground max-w-xl">
          Get a full section-by-section ATS quality audit with grades, specific fixes, and quick wins — <strong>no job description required</strong>. Optionally add a JD for keyword gap analysis.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Input */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-border bg-card p-6 space-y-5">
            <h3 className="font-display text-sm font-bold">Resume to Analyze</h3>

            {resumes.length > 0 ? (
              <div className="space-y-1.5">
                <Label className="text-xs">Select from saved resumes:</Label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>{r.title} — {r.templateId}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label className="text-xs">Paste resume content:</Label>
                <Textarea
                  placeholder="Paste your resume text here..."
                  value={customResumeText}
                  onChange={(e) => setCustomResumeText(e.target.value)}
                  className="h-32 text-xs"
                />
              </div>
            )}

            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Job Description</Label>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground rounded-full bg-secondary px-2 py-0.5">
                  <Info className="size-3" /> Optional — adds keyword gap analysis
                </span>
              </div>
              <Textarea
                placeholder="Leave blank to analyze your resume quality on its own. Add a JD to also check keyword alignment with a specific role..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="h-36 text-xs font-mono leading-relaxed"
              />
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (!activeResume && !customResumeText.trim())}
              className="w-full bg-[image:var(--gradient-emerald)] text-primary-foreground font-semibold shadow-[var(--shadow-glow)] gap-2 text-xs"
            >
              {isAnalyzing ? (
                <><Loader2 className="size-3.5 animate-spin" /> Analyzing Resume…</>
              ) : (
                <><Sparkles className="size-3.5" /> {hasJD ? "Analyze Resume + JD Match" : "Analyze Resume ATS Score"}</>
              )}
            </Button>

            {/* Mode indicator */}
            <div className={cn("rounded-2xl border p-3 text-[11px] space-y-1", hasJD ? "border-primary/30 bg-primary/5" : "border-border bg-secondary/40")}>
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                {hasJD ? <><Target className="size-3.5 text-primary" /> JD Match Mode Active</> : <><BarChart3 className="size-3.5" /> Resume Quality Mode</>}
              </p>
              <p className="text-muted-foreground">
                {hasJD
                  ? "Will run full section audit + keyword gap analysis against your target role."
                  : "Will run a full resume quality audit with grade, section scores, and actionable fixes."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="space-y-4 animate-in fade-in-50 duration-300">
              {/* Score Evolution */}
              {previousScore !== null && (
                <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-medium">
                    <TrendingUp className="size-4" />
                    Score: <strong className="line-through text-muted-foreground">{previousScore}</strong> → <strong>{result.overallScore}</strong>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                    {result.overallScore >= previousScore ? `+${result.overallScore - previousScore}` : result.overallScore - previousScore} pts
                  </span>
                </div>
              )}

              {/* Result Tabs */}
              {jdResult && (
                <div className="flex gap-1 rounded-2xl bg-secondary/40 p-1">
                  {(["overview", "sections", "jd"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveResultTab(tab)}
                      className={cn(
                        "flex-1 rounded-xl py-1.5 text-xs font-semibold transition-all capitalize",
                        activeResultTab === tab ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {tab === "jd" ? "JD Match" : tab}
                    </button>
                  ))}
                </div>
              )}

              {/* Overview Tab */}
              {(activeResultTab === "overview" || !jdResult) && (
                <div className="space-y-4">
                  {/* Score Card */}
                  <div className="rounded-3xl border border-border bg-card p-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="flex items-center gap-4">
                        <ScoreRing score={result.overallScore} />
                        <GradeBadge grade={result.grade} />
                      </div>
                      <div className="space-y-2 text-center sm:text-left">
                        <div className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold",
                          result.overallScore >= 80 ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" :
                          result.overallScore >= 65 ? "bg-blue-500/10 text-blue-700 dark:text-blue-300" :
                          result.overallScore >= 50 ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" :
                          "bg-red-500/10 text-red-700 dark:text-red-300"
                        )}>
                          <Target className="size-3.5" />
                          {result.overallScore >= 80 ? "Excellent ATS Alignment" : result.overallScore >= 65 ? "Good — Minor Fixes Needed" : result.overallScore >= 50 ? "Fair — Several Improvements Required" : "Poor — Significant Rework Needed"}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{result.verdict}</p>
                        {activeResume && (
                          <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs mt-1">
                            <Link to="/builder" search={{ resumeId: activeResume.id, template: activeResume.templateId }}>
                              Fix in Resume Builder <ArrowRight className="size-3" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Strengths & Critical Issues */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {result.strengths.length > 0 && (
                      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="size-3.5" /> Your Strengths
                        </p>
                        <ul className="space-y-1">
                          {result.strengths.map((s, i) => (
                            <li key={i} className="text-[11px] text-foreground flex items-start gap-1.5">
                              <span className="text-emerald-500 mt-0.5">✓</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.criticalIssues.length > 0 && (
                      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 space-y-2">
                        <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                          <XCircle className="size-3.5" /> Critical Issues
                        </p>
                        <ul className="space-y-1">
                          {result.criticalIssues.map((s, i) => (
                            <li key={i} className="text-[11px] text-foreground flex items-start gap-1.5">
                              <span className="text-red-500 mt-0.5">✗</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Quick Wins */}
                  {result.quickWins.length > 0 && (
                    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                      <h4 className="text-xs font-bold flex items-center gap-2">
                        <Zap className="size-3.5 text-amber-500" /> Quick Wins — Highest Impact Actions
                      </h4>
                      <div className="space-y-2">
                        {result.quickWins.map((win, i) => (
                          <div key={i} className="flex items-center gap-2 rounded-xl bg-secondary/40 p-2.5 text-[11px]">
                            <span className={cn("rounded-md px-1.5 py-0.5 text-[9px] font-bold shrink-0",
                              win.impact === "high" ? "bg-red-500/15 text-red-700 dark:text-red-300" :
                              win.impact === "medium" ? "bg-amber-500/15 text-amber-700 dark:text-amber-300" :
                              "bg-secondary text-muted-foreground"
                            )}>
                              {win.impact.toUpperCase()}
                            </span>
                            <span className="flex-1 text-foreground">{win.action}</span>
                            <span className={cn("rounded-md px-1.5 py-0.5 text-[9px] font-bold shrink-0 text-muted-foreground bg-secondary")}>
                              {win.effort}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sections Tab */}
              {(activeResultTab === "sections" || (!jdResult && result.sections.length > 0)) && (
                <div className="space-y-3">
                  <h3 className="font-display text-sm font-bold flex items-center gap-2">
                    <ClipboardList className="size-4 text-primary" /> Section-by-Section Audit
                  </h3>
                  {result.sections.map((section, i) => (
                    <SectionCard key={i} section={section} />
                  ))}
                </div>
              )}

              {/* JD Match Tab */}
              {activeResultTab === "jd" && jdResult && (
                <div className="space-y-4 animate-in fade-in-50 duration-200">
                  <div className="rounded-3xl border border-border bg-card p-6 space-y-5">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <ScoreRing score={jdResult.weightedScore} />
                      <div className="space-y-2 text-center sm:text-left">
                        <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
                          <Target className="size-3.5" />
                          {jdResult.weightedScore >= 75 ? "Strong JD Alignment" : jdResult.weightedScore >= 50 ? "Moderate Match — Fixes Needed" : "Low JD Alignment"}
                        </div>
                        <p className="text-xs text-muted-foreground">{jdResult.verdict}</p>
                      </div>
                    </div>
                    <div className="space-y-3 pt-4 border-t border-border">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Weighted Breakdown:</h4>
                      <div className="space-y-2.5">
                        <BucketBar label="Keyword Match" weight="35%" score={jdResult.bucketScores.keywords} />
                        <BucketBar label="Section Completeness" weight="20%" score={jdResult.bucketScores.completeness} />
                        <BucketBar label="Quantified Impact" weight="20%" score={jdResult.bucketScores.quantification} />
                        <BucketBar label="Seniority & Scope" weight="15%" score={jdResult.bucketScores.seniority} />
                        <BucketBar label="Format & Cleanliness" weight="10%" score={jdResult.bucketScores.formatting} />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
                      <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5" /> Matched Keywords ({jdResult.matchedKeywords.length})
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {jdResult.matchedKeywords.map((k) => (
                          <span key={k} className="rounded-md bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 text-[11px] font-medium">{k}</span>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
                      <p className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
                        <AlertTriangle className="size-3.5" /> Missing Keywords ({jdResult.missingKeywords.length})
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {jdResult.missingKeywords.map((k) => (
                          <span key={k} className="rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-200 px-2 py-0.5 text-[11px] font-medium">+ {k}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {jdResult.suggestions.length > 0 && (
                    <div className="rounded-2xl border border-border bg-card p-4 space-y-2.5">
                      <h4 className="text-xs font-bold">Recommendations:</h4>
                      {jdResult.suggestions.map((s, idx) => (
                        <div key={idx} className="rounded-xl bg-secondary/40 p-2.5 text-xs space-y-1">
                          <div className="font-semibold text-primary">{s.section}: {s.issue}</div>
                          <div className="text-muted-foreground">{s.fix}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border p-14 text-center text-muted-foreground space-y-4 min-h-[500px]">
              <FileSearch className="size-12 text-muted-foreground/40" />
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-foreground">No Analysis Yet</h3>
                <p className="text-xs max-w-xs leading-relaxed">
                  Select your resume and click <strong>Analyze ATS Score</strong>. <br />
                  <span className="text-muted-foreground">Job description is optional — analysis works on the resume alone.</span>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] max-w-xs w-full">
                {[
                  { icon: BarChart3, label: "Overall ATS Score & Grade" },
                  { icon: ClipboardList, label: "Section-by-section audit" },
                  { icon: Zap, label: "Prioritized quick wins" },
                  { icon: Target, label: "JD keyword gap (optional)" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 rounded-xl border border-border bg-secondary/30 p-2">
                    <Icon className="size-3.5 text-primary shrink-0" />
                    <span className="text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
