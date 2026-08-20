import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/contexts/AuthContext";
import { getResume } from "@/lib/resume-service";
import type { ResumeData, ResumeStyle } from "@/features/resume-builder/types";
import { checkATSScore, resumeToText, type ATSResult } from "@/lib/ai-service";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  FileSearch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { blankResume, defaultStyle } from "@/features/resume-builder/sample-data";

export const Route = createFileRoute("/resumes/$resumeId/ats")({
  head: () => ({
    meta: [{ title: "ATS Score Checker — CareerGPT" }],
  }),
  component: ATSCheckerPage,
});

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const color =
    score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle
          cx="70" cy="70" r={radius}
          fill="none" stroke="currentColor"
          strokeWidth="10"
          className="text-border"
        />
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-4xl font-bold tabular-nums" style={{ color }}>{score}</div>
        <div className="text-xs text-muted-foreground font-medium">/ 100</div>
      </div>
    </div>
  );
}

function ATSCheckerPage() {
  const { resumeId } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [resume, setResume] = useState<{ data: ResumeData; style: ResumeStyle } | null>(null);
  const [loadingResume, setLoadingResume] = useState(true);
  const [jobDescription, setJobDescription] = useState("");
  const [analysing, setAnalysing] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    let cancelled = false;

    void getResume(resumeId, user.uid)
      .then((doc) => {
        if (cancelled) return;
        if (!doc) {
          toast.error("Resume not found.");
          void navigate({ to: "/resumes" });
          return;
        }
        setResume({ data: doc.resumeData, style: doc.style });
        setLoadingResume(false);
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("Couldn't load your resume.");
          setLoadingResume(false);
        }
      });

    return () => { cancelled = true; };
  }, [resumeId, user, loading, navigate]);

  async function handleAnalyse() {
    if (!resume) return;
    if (!jobDescription.trim()) {
      toast.error("Paste a job description first.");
      return;
    }
    setAnalysing(true);
    setResult(null);
    try {
      const resumeText = resumeToText(resume.data);
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

  if (loading || loadingResume) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="relative min-h-dvh bg-background">
        {/* Background blobs */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-background" />
          <div
            className="animate-blob absolute -left-[15%] -top-[20%] h-[70vw] w-[70vw] rounded-full opacity-20 blur-[120px]"
            style={{ background: "var(--gradient-emerald)" }}
          />
          <div
            className="animate-blob absolute -right-[20%] top-[10%] h-[55vw] w-[55vw] rounded-full opacity-15 blur-[130px] [animation-delay:-8s]"
            style={{ background: "var(--gradient-gold)" }}
          />
        </div>

        <div className="mx-auto max-w-5xl px-4 py-10">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/resumes/$resumeId/editor" params={{ resumeId }}>
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex size-7 items-center justify-center rounded-lg bg-[image:var(--gradient-emerald)] text-primary-foreground">
                  <FileSearch className="size-3.5" />
                </div>
                <h1 className="font-display text-2xl font-semibold">ATS Score Checker</h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Paste a job description to see how well your resume matches it.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left — Job Description Input */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card/60 p-6">
                <h2 className="mb-3 font-display text-base font-semibold">Job Description</h2>
                <Textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here — include requirements, responsibilities, and qualifications for the most accurate analysis..."
                  className="min-h-72 resize-none text-sm"
                />
                <Button
                  className="mt-4 w-full gap-2"
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

              {/* Tips card */}
              {!result && !analysing && (
                <div className="rounded-2xl border border-border bg-card/40 p-5">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Lightbulb className="size-4 text-amber-500" />
                    How ATS works
                  </h3>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex gap-2"><span className="text-primary">•</span> ATS software scans resumes for keywords matching the job description before a human sees it.</li>
                    <li className="flex gap-2"><span className="text-primary">•</span> Resumes scoring below 50 are often filtered out automatically.</li>
                    <li className="flex gap-2"><span className="text-primary">•</span> Use exact phrases from the JD — not just synonyms.</li>
                    <li className="flex gap-2"><span className="text-primary">•</span> Paste the full JD including requirements for the most accurate score.</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Right — Results */}
            <div className="space-y-4">
              {analysing && (
                <div className="rounded-2xl border border-border bg-card/60 p-10 text-center">
                  <Loader2 className="mx-auto mb-4 size-8 animate-spin text-primary" />
                  <p className="font-medium">Scanning your resume…</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Comparing against the job description
                  </p>
                </div>
              )}

              {result && verdict && (
                <>
                  {/* Score card */}
                  <div className="rounded-2xl border border-border bg-card/60 p-6">
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
                      <ScoreRing score={result.score} />
                      <div className="text-center sm:text-left">
                        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-2", verdict.bg, verdict.color)}>
                          {result.score >= 75 ? <CheckCircle2 className="size-3.5" /> : result.score >= 50 ? <AlertTriangle className="size-3.5" /> : <XCircle className="size-3.5" />}
                          {verdict.label}
                        </span>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {result.verdict}
                        </p>
                        <Button variant="outline" size="sm" className="mt-3 gap-1.5 text-xs" asChild>
                          <Link to="/resumes/$resumeId/editor" params={{ resumeId }}>
                            <ArrowLeft className="size-3.5" />
                            Go fix resume
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="rounded-2xl border border-border bg-card/60 p-6 space-y-4">
                    <h3 className="font-display text-sm font-semibold">Keyword Analysis</h3>

                    {result.matchedKeywords.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-emerald-600">
                          <CheckCircle2 className="size-3.5" />
                          Matched ({result.matchedKeywords.length})
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {result.matchedKeywords.map((kw) => (
                            <Badge key={kw} variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-xs">
                              {kw}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.missingKeywords.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-red-600">
                          <XCircle className="size-3.5" />
                          Missing ({result.missingKeywords.length})
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {result.missingKeywords.map((kw) => (
                            <Badge key={kw} variant="secondary" className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 text-xs">
                              {kw}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Suggestions */}
                  {result.suggestions.length > 0 && (
                    <div className="rounded-2xl border border-border bg-card/60 p-6">
                      <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2">
                        <Lightbulb className="size-4 text-amber-500" />
                        How to improve your score
                      </h3>
                      <div className="space-y-3">
                        {result.suggestions.map((s, i) => (
                          <div key={i} className="rounded-lg border border-border bg-background/50 p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                {s.section}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">{s.issue}</p>
                            <p className="text-xs font-medium text-foreground">
                              <span className="text-primary mr-1">Fix:</span>{s.fix}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Re-analyse nudge */}
                  <p className="text-center text-xs text-muted-foreground">
                    Updated your resume?{" "}
                    <button
                      className="text-primary underline underline-offset-2"
                      onClick={handleAnalyse}
                    >
                      Re-analyse
                    </button>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
