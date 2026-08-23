import React from "react";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { type FirestoreResume } from "@/lib/resume-service";
import { type ResumeHealthResult } from "@/lib/ai-service";
import { type AtsCheck } from "@/features/resume-builder/utils/ats-score";
import { cn } from "@/lib/utils";

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
          {Math.round(score)}
        </div>
        <div className="text-[10px] text-muted-foreground font-medium">/ 100</div>
      </div>
    </div>
  );
}

function verdictMeta(score: number) {
  return score >= 75
    ? { label: "Strong", color: "text-emerald-600", bg: "bg-emerald-500/10", Icon: CheckCircle2 }
    : score >= 50
      ? { label: "Needs Work", color: "text-amber-600", bg: "bg-amber-500/10", Icon: AlertTriangle }
      : { label: "Weak", color: "text-red-600", bg: "bg-red-500/10", Icon: XCircle };
}

function CategoryBar({ label, score, max }: { label: string; score: number; max: number }) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  const color = pct >= 75 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground tabular-nums">
          {Math.round(score * 10) / 10}/{max}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const severityMeta: Record<AtsCheck["severity"], { Icon: typeof CheckCircle2; color: string }> = {
  pass: { Icon: CheckCircle2, color: "text-emerald-600" },
  warn: { Icon: AlertTriangle, color: "text-amber-600" },
  fail: { Icon: XCircle, color: "text-red-600" },
};

function ChecksList({ checks }: { checks: AtsCheck[] }) {
  const sorted = [...checks].sort((a, b) => {
    const order = { fail: 0, warn: 1, pass: 2 } as const;
    return order[a.severity] - order[b.severity];
  });
  return (
    <div className="space-y-2">
      {sorted.map((check) => {
        const meta = severityMeta[check.severity];
        const Icon = meta.Icon;
        return (
          <div key={check.id} className="flex items-start gap-2 text-xs">
            <Icon className={cn("size-3.5 mt-0.5 shrink-0", meta.color)} />
            <div>
              <span className="text-foreground">{check.label}</span>
              {check.detail && (
                <p className="text-[11px] text-muted-foreground mt-0.5">{check.detail}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ResumeHealthReportCard({
  result,
  selected,
  onReanalyse,
  reanalysing,
}: {
  result: ResumeHealthResult;
  selected: FirestoreResume | null;
  onReanalyse: () => void;
  reanalysing: boolean;
}) {
  const verdict = verdictMeta(result.score);
  const VerdictIcon = verdict.Icon;

  return (
    <div className="space-y-4">
      {/* Score + verdict */}
      <div className="rounded-3xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-sm font-bold">Resume Health</h3>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
            <ShieldCheck className="size-3" /> 80% deterministic scoring
          </span>
        </div>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
          <ScoreRing score={result.score} />
          <div className="text-center sm:text-left">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-2",
                verdict.bg,
                verdict.color,
              )}
            >
              <VerdictIcon className="size-3.5" />
              {verdict.label}
            </span>
            {result.aiDegraded && (
              <p className="text-[11px] text-amber-600 mb-1">
                AI analysis was unavailable — this score reflects deterministic checks only.
              </p>
            )}
            {selected && (
              <Button variant="outline" size="sm" className="mt-1 gap-1.5 text-xs" asChild>
                <Link
                  to="/builder"
                  search={{ resumeId: selected.id, template: selected.templateId }}
                >
                  Go fix resume <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="rounded-3xl border border-border bg-card p-6 space-y-3">
        <h3 className="font-display text-sm font-bold mb-1">Score Breakdown</h3>
        <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {result.categories.map((c) => (
            <CategoryBar key={c.id} label={c.label} score={c.score} max={c.max} />
          ))}
        </div>
      </div>

      {/* Critical problems / improvements / strengths */}
      {(result.criticalProblems.length > 0 ||
        result.improvements.length > 0 ||
        result.strengths.length > 0) && (
        <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
          {result.criticalProblems.length > 0 && (
            <div className="space-y-1.5">
              {result.criticalProblems.map((p, i) => (
                <p key={i} className="text-xs text-foreground flex gap-2">
                  <span>🔴</span> {p}
                </p>
              ))}
            </div>
          )}
          {result.improvements.length > 0 && (
            <div className="space-y-1.5">
              {result.improvements.map((p, i) => (
                <p key={i} className="text-xs text-foreground flex gap-2">
                  <span>🟡</span> {p}
                </p>
              ))}
            </div>
          )}
          {result.strengths.length > 0 && (
            <div className="space-y-1.5">
              {result.strengths.map((p, i) => (
                <p key={i} className="text-xs text-foreground flex gap-2">
                  <span>🟢</span> {p}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Keyword analysis */}
      {(result.matchedKeywords.length > 0 || result.missingKeywords.length > 0) && (
        <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-display text-sm font-bold">Keyword Analysis</h3>
          {result.matchedKeywords.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="size-3.5" /> Strong ({result.matchedKeywords.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.matchedKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded-lg bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300"
                  >
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
                  <span
                    key={kw}
                    className="rounded-lg bg-red-500/15 border border-red-500/25 px-2 py-0.5 text-[11px] font-medium text-red-700 dark:text-red-300"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ATS checks */}
      <div className="rounded-3xl border border-border bg-card p-6">
        <h3 className="font-display text-sm font-bold mb-3 flex items-center gap-2">
          <Lightbulb className="size-4 text-amber-500" />
          ATS Checks
        </h3>
        <ChecksList checks={result.checks} />
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Updated your resume?{" "}
        <button
          className="text-primary underline underline-offset-2 disabled:opacity-50"
          onClick={onReanalyse}
          disabled={reanalysing}
        >
          Re-analyse
        </button>
      </p>
    </div>
  );
}
