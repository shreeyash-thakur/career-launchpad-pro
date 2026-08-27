"use client";
import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus, ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  beforeScore: number;
  afterScore: number;
  label?: string;
  onDismiss?: () => void;
  autoDismissMs?: number;
}

export function ScoreDeltaBanner({
  beforeScore,
  afterScore,
  label = "ATS Match Score",
  onDismiss,
  autoDismissMs = 8000,
}: Props) {
  const delta = afterScore - beforeScore;
  const isImproved = delta > 0;
  const isRegressed = delta < 0;

  const [displayedScore, setDisplayedScore] = useState(beforeScore);

  useEffect(() => {
    const duration = 1000;
    const steps = 25;
    const stepTime = duration / steps;
    const diff = afterScore - beforeScore;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const current = Math.round(beforeScore + (diff * (step / steps)));
      setDisplayedScore(current);
      if (step >= steps) {
        setDisplayedScore(afterScore);
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [beforeScore, afterScore]);

  useEffect(() => {
    if (!autoDismissMs || !onDismiss) return;
    const timeout = setTimeout(() => {
      onDismiss();
    }, autoDismissMs);
    return () => clearTimeout(timeout);
  }, [autoDismissMs, onDismiss]);

  return (
    <div
      className={cn(
        "no-print relative flex items-center justify-between gap-3 px-4 py-2.5 text-xs transition-all duration-300 animate-in slide-in-from-top-2",
        isImproved
          ? "bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
          : isRegressed
            ? "bg-amber-500/15 border-b border-amber-500/30 text-amber-950 dark:text-amber-200"
            : "bg-secondary/70 border-b border-border text-foreground",
      )}
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <div
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full font-bold text-white shadow-sm",
            isImproved ? "bg-emerald-600" : isRegressed ? "bg-amber-600" : "bg-muted-foreground",
          )}
        >
          {isImproved ? (
            <TrendingUp className="size-3.5" />
          ) : isRegressed ? (
            <TrendingDown className="size-3.5" />
          ) : (
            <Minus className="size-3.5" />
          )}
        </div>

        <div className="flex items-center gap-1.5 font-medium">
          <span className="font-semibold text-foreground">{label}:</span>
          <span className="text-muted-foreground line-through tabular-nums">{beforeScore}%</span>
          <ArrowRight className="size-3 text-muted-foreground" />
          <span className="font-bold text-foreground tabular-nums text-sm">{displayedScore}%</span>
          <span
            className={cn(
              "ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold",
              isImproved
                ? "bg-emerald-500/25 text-emerald-700 dark:text-emerald-300"
                : isRegressed
                  ? "bg-amber-500/25 text-amber-700 dark:text-amber-300"
                  : "bg-secondary text-muted-foreground",
            )}
          >
            {delta > 0 ? `+${delta}% Improvement` : delta < 0 ? `${delta}% Regression` : "No Change"}
          </span>
        </div>

        <span className="hidden sm:inline text-muted-foreground text-[11px]">
          {isImproved
            ? "— Tailored rewrites increased target keyword alignment and impact clarity."
            : "— Changes applied successfully."}
        </span>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors shrink-0"
          aria-label="Dismiss score delta banner"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}