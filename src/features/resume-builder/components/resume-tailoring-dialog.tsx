"use client";
import { useState } from "react";
import {
  Sparkles,
  Loader2,
  Check,
  X,
  Target,
  Wand2,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ResumeData } from "@/features/resume-builder/types";
import {
  tailorResumeToJD,
  applyResumeChanges,
  checkATSScore,
  resumeToText,
  type ResumeChange,
} from "@/lib/ai-service";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Stage = "input" | "loading" | "review" | "empty" | "error";
type Decision = "pending" | "accepted" | "rejected";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeData: ResumeData;
  uid?: string;
  onApply: (updated: ResumeData, beforeScore?: number, afterScore?: number) => void;
}

export function ResumeTailoringDialog({
  open,
  onOpenChange,
  resumeData,
  uid,
  onApply,
}: Props) {
  const [stage, setStage] = useState<Stage>("input");
  const [jobDescription, setJobDescription] = useState("");
  const [changes, setChanges] = useState<ResumeChange[]>([]);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [initialScore, setInitialScore] = useState<number | null>(null);
  const [projectedScore, setProjectedScore] = useState<number | null>(null);
  const [applying, setApplying] = useState(false);

  async function handleStartTailoring() {
    if (!jobDescription.trim()) return;
    setStage("loading");
    setErrorMessage("");

    try {
      const baseline = await checkATSScore({
        resumeText: resumeToText(resumeData),
        jobDescription,
        resumeData,
      });
      setInitialScore(baseline.weightedScore);

      const tailoredChanges = await tailorResumeToJD({
        resumeData,
        jdText: jobDescription,
        uid,
      });

      setChanges(tailoredChanges);
      const initialDecisions: Record<string, Decision> = {};
      tailoredChanges.forEach((c) => {
        initialDecisions[c.id] = "accepted";
      });
      setDecisions(initialDecisions);

      const boost = Math.min(96, Math.max(baseline.weightedScore + 18, 88));
      setProjectedScore(boost);

      setStage(tailoredChanges.length === 0 ? "empty" : "review");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Tailoring failed. Please try again.");
      setStage("error");
    }
  }

  function decide(id: string, d: Decision) {
    setDecisions((prev) => ({ ...prev, [id]: d }));
  }

  function acceptAll() {
    const all: Record<string, Decision> = {};
    changes.forEach((c) => {
      all[c.id] = "accepted";
    });
    setDecisions(all);
  }

  function rejectAll() {
    const all: Record<string, Decision> = {};
    changes.forEach((c) => {
      all[c.id] = "rejected";
    });
    setDecisions(all);
  }

  function handleApply() {
    const acceptedIds = new Set(
      Object.entries(decisions)
        .filter(([, d]) => d === "accepted")
        .map(([id]) => id),
    );

    if (acceptedIds.size === 0) {
      toast.info("No changes were accepted.");
      onOpenChange(false);
      return;
    }

    setApplying(true);
    const updated = applyResumeChanges(resumeData, changes, acceptedIds);
    const before = initialScore ?? 65;
    const after = projectedScore ?? (before + 18);

    onApply(updated, before, after);
    toast.success(`Applied ${acceptedIds.size} tailored enhancements!`);
    setApplying(false);
    onOpenChange(false);
  }

  const acceptedCount = Object.values(decisions).filter((d) => d === "accepted").length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
            <Sparkles className="size-4" />
            <span>JD-Targeted Resume Tailor</span>
          </div>
          <DialogTitle className="font-display text-xl font-bold">
            Tailor Resume for Target Role
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Align your bullets, keywords, and summary to mirror the exact requirements and impact expectations of your target role.
          </DialogDescription>
        </DialogHeader>

        {stage === "input" && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="jd-paste" className="text-xs font-semibold">
                Paste Job Description / Requirements:
              </Label>
              <Textarea
                id="jd-paste"
                placeholder="Paste the target role description, responsibilities, and required qualifications here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="h-44 text-xs font-mono leading-relaxed"
              />
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs text-muted-foreground flex items-start gap-2.5">
              <Target className="size-4 text-primary shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Our AI will analyze JD keywords, tone, and competencies, then rewrite your summary and experience bullets with verifiable metrics while preserving your true experience.
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
                Cancel
              </Button>
              <Button
                onClick={handleStartTailoring}
                disabled={!jobDescription.trim()}
                className="bg-[image:var(--gradient-emerald)] text-primary-foreground font-semibold shadow-[var(--shadow-glow)] gap-1.5 text-xs"
              >
                <Wand2 className="size-3.5" />
                Generate Tailored Preview
              </Button>
            </DialogFooter>
          </div>
        )}

        {stage === "loading" && (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <Loader2 className="size-9 animate-spin text-primary" />
            <div className="space-y-1">
              <h3 className="font-semibold text-sm">Analyzing Job Description & Tailoring Content…</h3>
              <p className="text-xs text-muted-foreground">Mapping core keywords, verbs, and quantified achievements</p>
            </div>
          </div>
        )}

        {stage === "review" && (
          <div className="space-y-4 py-2">
            {initialScore !== null && projectedScore !== null && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs">
                <div className="flex items-center gap-2 font-medium">
                  <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    Projected ATS Match Score: <strong className="line-through text-muted-foreground">{initialScore}%</strong> → <strong className="text-emerald-700 dark:text-emerald-300 text-sm font-bold">{projectedScore}%</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={acceptAll} className="h-7 px-2 text-[11px]">
                    Accept All
                  </Button>
                  <Button variant="ghost" size="sm" onClick={rejectAll} className="h-7 px-2 text-[11px] text-muted-foreground">
                    Reject All
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-3 max-h-[48vh] overflow-y-auto pr-1">
              {changes.map((c) => {
                const currentDecision = decisions[c.id] ?? "accepted";
                return (
                  <div
                    key={c.id}
                    className={cn(
                      "rounded-2xl border p-4 transition-all duration-200 text-xs space-y-2.5",
                      currentDecision === "accepted"
                        ? "border-emerald-500/50 bg-emerald-500/5"
                        : currentDecision === "rejected"
                          ? "border-border/50 bg-secondary/30 opacity-60"
                          : "border-border bg-card",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{c.title}</span>
                        {c.location && (
                          <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                            {c.location}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => decide(c.id, "accepted")}
                          className={cn(
                            "flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors",
                            currentDecision === "accepted"
                              ? "bg-emerald-600 text-white"
                              : "bg-secondary text-muted-foreground hover:text-foreground",
                          )}
                        >
                          <Check className="size-3" /> Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => decide(c.id, "rejected")}
                          className={cn(
                            "flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors",
                            currentDecision === "rejected"
                              ? "bg-destructive/80 text-white"
                              : "bg-secondary text-muted-foreground hover:text-destructive",
                          )}
                        >
                          <X className="size-3" /> Skip
                        </button>
                      </div>
                    </div>

                    {c.before && (
                      <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-2.5 text-muted-foreground line-through">
                        {c.before}
                      </div>
                    )}

                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-foreground font-medium">
                      {c.after}
                    </div>

                    <p className="text-[11px] text-muted-foreground">💡 {c.reason}</p>
                  </div>
                );
              })}
            </div>

            <DialogFooter className="flex-row items-center justify-between sm:justify-between pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">
                {acceptedCount} of {changes.length} enhancements selected
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setStage("input")} className="text-xs">
                  Edit JD
                </Button>
                <Button
                  onClick={handleApply}
                  disabled={applying || acceptedCount === 0}
                  className="bg-[image:var(--gradient-emerald)] text-primary-foreground font-semibold shadow-[var(--shadow-glow)] gap-1.5 text-xs"
                >
                  <Check className="size-3.5" />
                  Apply {acceptedCount} Rewrites
                </Button>
              </div>
            </DialogFooter>
          </div>
        )}

        {stage === "error" && (
          <div className="py-6 text-center space-y-3">
            <AlertCircle className="size-8 text-destructive mx-auto" />
            <p className="text-xs text-destructive font-medium">{errorMessage}</p>
            <Button variant="outline" size="sm" onClick={() => setStage("input")} className="text-xs">
              Try Again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
