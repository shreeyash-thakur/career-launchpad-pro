import React, { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  FileSearch,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { type FirestoreResume } from "@/lib/resume-service";
import { checkATSScore, resumeToText, type ATSResult } from "@/lib/ai-service";
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
        <circle cx="66" cy="66" r={radius} fill="none" stroke="currentColor" strokeWidth="9" className="text-border" />
        <circle
          cx="66" cy="66" r={radius}
          fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-bold tabular-nums" style={{ color }}>{score}</div>
        <div className="text-[10px] text-muted-foreground font-medium">/ 100</div>
      </div>
    </div>
  );
}

export function AtsCheckerView({ resumes, preselectId }: Props) {
  const [selectedId, setSelectedId] = useState<string>(preselectId ?? resumes[0]?.id ?? "");
  const [jobDescription, setJobDescription] = useState("");
  const [analysing, setAnalysing] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);

  const selected = useMemo(
    () => resumes.find((r) => r.id === selectedId) ?? null,
    [resumes, selectedId],
  );

  async function handleAnalyse() {
    if (!selected) {
      toast.error("Pick a resume to check first.");
      return;
    }
    if (!jobDescription.trim()) {
      toast.error("Paste a job description first.");
      return;
    }
    setAnalysing(true);
    setResult(null);
    try {
      const resumeText = resumeToText(selected.resumeData);
      const atsResult = await checkATSScore({ resumeText, jobDescription });
      setResult(atsResult);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    } finally {
      setAnalysing(false);
    }
  }

  const verdict =
    result
      ? result.score >= 75
        ? { label: "Strong Match", color: "text-emerald-600", bg: "bg-emerald-500/10" }
        : result.score >= 50
        ? { label: "Partial Match", color: "text-amber-600", bg: "bg-amber-500/10" }
        : { label: "Weak Match", color: "text-red-600", bg: "bg-red-500/10" }
      : null;

  if (resumes.length === 0) {
    return (
      <div className="space-y-8">
        <Header />
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <FileSearch className="size-7" />
          </div>
          <h3 className="font-display text-base font-bold">Create a resume first</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm">
            You need at least one resume before you can check its ATS match against a job description.
          </p>
          <Button asChild className="mt-4 bg-[image:var(--gradient-emerald)] text-primary-foreground font-semibold shadow-[var(--shadow-glow)] gap-2 text-xs">
            <Link to="/onboarding">
              <Sparkles className="size-4" />
              Create a Resume
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Header />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left — Inputs */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Resume to check</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>{r.title || "Untitled Resume"}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Job description</label>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description — requirements, responsibilities, and qualifications — for the most accurate score..."
                className="min-h-64 resize-none text-sm"
              />
            </div>

            <Button
              className="w-full gap-2 bg-[image:var(--gradient-emerald)] text-primary-foreground font-semibold shadow-[var(--shadow-glow)] hover:brightness-110"
              onClick={handleAnalyse}
              disabled={analysing || !jobDescription.trim()}
            >
              {analysing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Analysing your resume…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Check ATS Score
                </>
              )}
            </Button>
          </div>

          {!result && !analysing && (
            <div className="rounded-3xl border border-border bg-card/40 p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Lightbulb className="size-4 text-amber-500" />
                How ATS works
              </h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex gap-2"><span className="text-primary">•</span> ATS software scans resumes for keywords matching the job description before a human sees it.</li>
                <li className="flex gap-2"><span className="text-primary">•</span> Resumes scoring below 50 are often filtered out automatically.</li>
                <li className="flex gap-2"><span className="text-primary">•</span> Use exact phrases from the JD, not just synonyms.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Right — Results */}
        <div className="space-y-4">
          {analysing && (
            <div className="rounded-3xl border border-border bg-card p-10 text-center">
              <Loader2 className="mx-auto mb-4 size-8 animate-spin text-primary" />
              <p className="font-semibold text-sm">Scanning your resume…</p>
              <p className="mt-1 text-xs text-muted-foreground">Comparing against the job description</p>
            </div>
          )}

          {!analysing && !result && (
            <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/30 p-8 text-center">
              <FileSearch className="size-8 text-muted-foreground/50 mb-3" />
              <p className="text-xs text-muted-foreground max-w-56">
                Paste a job description and hit Check ATS Score to see your results here.
              </p>
            </div>
          )}

          {result && verdict && (
            <>
              <div className="rounded-3xl border border-border bg-card p-6">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
                  <ScoreRing score={result.score} />
                  <div className="text-center sm:text-left">
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-2", verdict.bg, verdict.color)}>
                      {result.score >= 75 ? <CheckCircle2 className="size-3.5" /> : result.score >= 50 ? <AlertTriangle className="size-3.5" /> : <XCircle className="size-3.5" />}
                      {verdict.label}
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed">{result.verdict}</p>
                    {selected && (
                      <Button variant="outline" size="sm" className="mt-3 gap-1.5 text-xs" asChild>
                        <Link to="/builder" search={{ resumeId: selected.id, template: selected.templateId }}>
                          Go fix resume <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
                <h3 className="font-display text-sm font-bold">Keyword Analysis</h3>

                {result.matchedKeywords.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-emerald-600">
                      <CheckCircle2 className="size-3.5" /> Matched ({result.matchedKeywords.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.matchedKeywords.map((kw) => (
                        <span key={kw} className="rounded-lg bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.missingKeywords.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-red-600">
                      <XCircle className="size-3.5" /> Missing ({result.missingKeywords.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.missingKeywords.map((kw) => (
                        <span key={kw} className="rounded-lg bg-red-500/15 border border-red-500/25 px-2 py-0.5 text-[11px] font-medium text-red-700 dark:text-red-300">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {result.suggestions.length > 0 && (
                <div className="rounded-3xl border border-border bg-card p-6">
                  <h3 className="font-display text-sm font-bold mb-3 flex items-center gap-2">
                    <Lightbulb className="size-4 text-amber-500" />
                    How to improve your score
                  </h3>
                  <div className="space-y-3">
                    {result.suggestions.map((s, i) => (
                      <div key={i} className="rounded-2xl border border-border/60 bg-secondary/20 p-3">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                          {s.section}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1.5 mb-1">{s.issue}</p>
                        <p className="text-xs font-medium text-foreground">
                          <span className="text-primary mr-1">Fix:</span>{s.fix}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-center text-xs text-muted-foreground">
                Updated your resume?{" "}
                <button className="text-primary underline underline-offset-2" onClick={handleAnalyse}>
                  Re-analyse
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div>
      <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1.5">
        <Sparkles className="size-4" />
        <span>Real AI-Powered Analysis</span>
      </div>
      <h1 className="font-display text-2xl font-bold tracking-tight">ATS Score Checker</h1>
      <p className="text-xs text-muted-foreground">
        Paste a job description to see how well your resume matches it — and exactly how to improve.
      </p>
    </div>
  );
}
