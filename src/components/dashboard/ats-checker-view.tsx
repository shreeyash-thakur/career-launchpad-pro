"use client";
import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  FileSearch,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Target,
  Layers,
  Award,
  TrendingUp,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { type FirestoreResume } from "@/lib/resume-service";
import {
  checkATSScore,
  resumeToText,
  type ScoredATSResult,
} from "@/lib/ai-service";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  resumes: FirestoreResume[];
  preselectId?: string;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative flex shrink-0 items-center justify-center">
      <svg width="132" height="132" className="-rotate-90">
        <circle
          cx="66"
          cy="66"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="9"
          className="text-border"
        />
        <circle
          cx="66"
          cy="66"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-bold tabular-nums" style={{ color }}>
          {score}
        </div>
        <div className="text-[10px] text-muted-foreground font-medium">/ 100</div>
      </div>
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
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function AtsCheckerView({ resumes, preselectId }: Props) {
  const [selectedResumeId, setSelectedResumeId] = useState<string>(
    preselectId || (resumes[0]?.id ?? ""),
  );
  const [jobDescription, setJobDescription] = useState("");
  const [customResumeText, setCustomResumeText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScoredATSResult | null>(null);
  const [previousScore, setPreviousScore] = useState<number | null>(null);

  const activeResume = resumes.find((r) => r.id === selectedResumeId) || null;

  async function handleAnalyze() {
    if (!jobDescription.trim()) {
      toast.error("Please paste a target Job Description first.");
      return;
    }

    const text = activeResume ? resumeToText(activeResume.resumeData) : customResumeText;
    if (!text.trim()) {
      toast.error("Please select a resume or paste your resume content.");
      return;
    }

    setIsAnalyzing(true);
    try {
      if (result) {
        setPreviousScore(result.weightedScore);
      }

      const res = await checkATSScore({
        resumeText: text,
        jobDescription,
        resumeData: activeResume?.resumeData,
      });
      setResult(res);
      toast.success("ATS Analysis completed with weighted bucket scoring!");
    } catch (err) {
      toast.error("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1.5">
          <Target className="size-4" />
          <span>Deterministic Weighted Scoring System</span>
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Job Match ATS Checker</h1>
        <p className="text-xs text-muted-foreground max-w-xl">
          Evaluate your resume against target Job Descriptions using transparent 5-bucket scoring: Keyword Match (35%), Section Completeness (20%), Quantification (20%), Seniority (15%), and Format (10%).
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Input Column */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-display text-sm font-bold">1. Select or Paste Resume</h3>

            {resumes.length > 0 ? (
              <div className="space-y-2">
                <Label className="text-xs">Choose from your saved resumes:</Label>
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
              <div className="space-y-2">
                <Label className="text-xs">Paste your resume content:</Label>
                <Textarea
                  placeholder="Paste your resume experience, skills, and summary here..."
                  value={customResumeText}
                  onChange={(e) => setCustomResumeText(e.target.value)}
                  className="h-32 text-xs"
                />
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-border">
              <Label className="text-xs font-semibold">2. Target Job Description:</Label>
              <Textarea
                placeholder="Paste the target job description requirements, responsibilities, and qualifications..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="h-44 text-xs font-mono leading-relaxed"
              />
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !jobDescription.trim()}
              className="w-full bg-[image:var(--gradient-emerald)] text-primary-foreground font-semibold shadow-[var(--shadow-glow)] gap-2 text-xs"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" /> Calculating Weighted Match…
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" /> Analyze ATS Job Match
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Output Column */}
        <div className="lg:col-span-6 space-y-4">
          {result ? (
            <div className="space-y-4 animate-in fade-in-50 duration-300">
              {/* Score Snapshot & Delta */}
              {previousScore !== null && (
                <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-950 dark:text-emerald-200">
                  <div className="flex items-center gap-2 font-medium">
                    <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      Match Score Evolution: <strong className="line-through text-muted-foreground">{previousScore}%</strong> → <strong className="font-bold text-sm text-emerald-700 dark:text-emerald-300">{result.weightedScore}%</strong>
                    </span>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                    {result.weightedScore >= previousScore ? `+${result.weightedScore - previousScore}%` : `${result.weightedScore - previousScore}%`}
                  </span>
                </div>
              )}

              {/* Main Score Card */}
              <div className="rounded-3xl border border-border bg-card p-6 space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <ScoreRing score={result.weightedScore} />
                  <div className="space-y-2 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
                      <Target className="size-3.5" />
                      {result.weightedScore >= 75 ? "Strong ATS Alignment" : result.weightedScore >= 50 ? "Moderate Match — Fixes Needed" : "Low Alignment"}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {result.verdict}
                    </p>
                    {activeResume && (
                      <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs mt-1">
                        <Link to="/builder" search={{ resumeId: activeResume.id, template: activeResume.templateId }}>
                          Open in Resume Builder <ArrowRight className="size-3" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>

                {/* 5-Bucket Score Breakdown */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Deterministic Weighted Breakdown:
                  </h4>
                  <div className="space-y-2.5">
                    <BucketBar label="Keyword Match" weight="35%" score={result.bucketScores.keywords} />
                    <BucketBar label="Section Completeness" weight="20%" score={result.bucketScores.completeness} />
                    <BucketBar label="Quantified Impact Metrics" weight="20%" score={result.bucketScores.quantification} />
                    <BucketBar label="Seniority & Scope" weight="15%" score={result.bucketScores.seniority} />
                    <BucketBar label="Formatting & Cleanliness" weight="10%" score={result.bucketScores.formatting} />
                  </div>
                </div>
              </div>

              {/* Keyword Breakdown Card */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5" /> Matched Keywords ({result.matchedKeywords.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {result.matchedKeywords.map((k) => (
                      <span key={k} className="rounded-md bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 text-[11px] font-medium">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
                    <AlertTriangle className="size-3.5" /> Missing High-Priority ({result.missingKeywords.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {result.missingKeywords.map((k) => (
                      <span key={k} className="rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-200 px-2 py-0.5 text-[11px] font-medium">
                        + {k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              {result.suggestions.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-4 space-y-2.5">
                  <h4 className="text-xs font-bold text-foreground">Actionable Recommendations:</h4>
                  <div className="space-y-2">
                    {result.suggestions.map((s, idx) => (
                      <div key={idx} className="rounded-xl bg-secondary/40 p-2.5 text-xs space-y-1">
                        <div className="font-semibold text-primary">{s.section}: {s.issue}</div>
                        <div className="text-muted-foreground">{s.fix}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground space-y-3">
              <FileSearch className="size-10 text-muted-foreground/50" />
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-foreground">No Analysis Yet</h3>
                <p className="text-xs max-w-xs">
                  Paste a Job Description and click Analyze to receive your weighted score and keyword gap analysis.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
