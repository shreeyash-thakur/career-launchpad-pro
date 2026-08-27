import { useState } from "react";
import { Sparkles, Loader2, Check, X, AlertTriangle, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ResumeData } from "@/features/resume-builder/types";
import { optimizeResume, applyResumeChanges, type ResumeChange } from "@/lib/ai-service";
import { cn } from "@/lib/utils";

type Stage = "idle" | "loading" | "review" | "empty" | "error";
type Decision = "pending" | "accepted" | "rejected";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uid: string | undefined;
  resumeData: ResumeData;
  onApply: (updated: ResumeData) => void;
}

const typeLabel: Record<ResumeChange["type"], string> = {
  summary: "Summary",
  "experience-bullet": "Experience",
  "project-description": "Project",
};

export function ResumeOptimizerDialog({ open, onOpenChange, uid, resumeData, onApply }: Props) {
  const [stage, setStage] = useState<Stage>("idle");
  const [changes, setChanges] = useState<ResumeChange[]>([]);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [applying, setApplying] = useState(false);

  async function runOptimizer() {
    setStage("loading");
    setErrorMessage("");
    try {
      const result = await optimizeResume({
        ...(uid ? { uid } : {}),
        resumeData,
      });
      setChanges(result);
      setDecisions(Object.fromEntries(result.map((c) => [c.id, "pending" as Decision])));
      setStage(result.length === 0 ? "empty" : "review");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Couldn't analyse your resume. Please try again.",
      );
      setStage("error");
    }
  }

  function decide(id: string, decision: Decision) {
    setDecisions((prev) => ({ ...prev, [id]: decision }));
  }

  function acceptAll() {
    setDecisions(Object.fromEntries(changes.map((c) => [c.id, "accepted" as Decision])));
  }

  function applyDecisions() {
    const acceptedIds = new Set(
      Object.entries(decisions)
        .filter(([, d]) => d === "accepted")
        .map(([id]) => id),
    );
    if (acceptedIds.size === 0) {
      onOpenChange(false);
      reset();
      return;
    }
    setApplying(true);
    const updated = applyResumeChanges(resumeData, changes, acceptedIds);
    onApply(updated);
    setApplying(false);
    onOpenChange(false);
    reset();
  }

  function reset() {
    setStage("idle");
    setChanges([]);
    setDecisions({});
    setErrorMessage("");
  }

  const pendingCount = changes.filter((c) => decisions[c.id] === "pending").length;
  const acceptedCount = changes.filter((c) => decisions[c.id] === "accepted").length;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" /> Optimize My Resume
          </DialogTitle>
          <DialogDescription>
            Review every suggested change before it's applied. Nothing here invents new
            achievements, numbers, or skills — only rewords what's already in your resume.
          </DialogDescription>
        </DialogHeader>

        {stage === "idle" && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border p-10 text-center">
            <Sparkles className="size-8 text-primary" />
            <p className="text-sm font-medium text-foreground">
              Scan your summary, experience bullets, and project descriptions for improvements.
            </p>
            <Button onClick={() => void runOptimizer()} variant="hero" size="sm" className="mt-1">
              Analyse my resume
            </Button>
          </div>
        )}

        {stage === "loading" && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border p-10 text-center">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">Looking for improvements…</p>
          </div>
        )}

        {stage === "empty" && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-10 text-center">
            <Check className="size-8 text-emerald-600" />
            <p className="text-sm font-medium text-foreground">
              Your summary, experience, and project descriptions already read well — nothing worth
              changing right now.
            </p>
          </div>
        )}

        {stage === "error" && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <AlertTriangle className="size-7 text-destructive" />
            <p className="text-sm font-medium text-foreground">{errorMessage}</p>
            <Button variant="outline" size="sm" onClick={() => void runOptimizer()}>
              Try again
            </Button>
          </div>
        )}

        {stage === "review" && (
          <>
            <div className="flex items-center justify-between shrink-0">
              <p className="text-xs text-muted-foreground">
                {changes.length} suggestion{changes.length === 1 ? "" : "s"} · {acceptedCount}{" "}
                accepted
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={acceptAll}
                disabled={pendingCount === 0}
              >
                <Check className="size-3.5" /> Accept all
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 -mr-1">
              {changes.map((change) => {
                const decision = decisions[change.id] ?? "pending";
                return (
                  <div
                    key={change.id}
                    className={cn(
                      "rounded-2xl border p-4 space-y-2.5 transition-colors",
                      decision === "accepted" && "border-emerald-500/40 bg-emerald-500/5",
                      decision === "rejected" && "border-border bg-secondary/20 opacity-60",
                      decision === "pending" && "border-border bg-card",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        {typeLabel[change.type]}
                      </span>
                      <span className="text-[11px] font-medium text-muted-foreground truncate max-w-[60%] text-right">
                        {change.label}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <p className="rounded-lg bg-red-500/5 border border-red-500/15 px-2.5 py-1.5 text-foreground/70 line-through decoration-red-500/40">
                        {change.before || <span className="italic">(empty)</span>}
                      </p>
                      <p className="rounded-lg bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1.5 text-foreground">
                        {change.after}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={decision === "accepted" ? "default" : "outline"}
                        className="h-7 gap-1 text-[11px] flex-1"
                        onClick={() => decide(change.id, "accepted")}
                      >
                        <Check className="size-3" /> Accept
                      </Button>
                      <Button
                        size="sm"
                        variant={decision === "rejected" ? "secondary" : "outline"}
                        className="h-7 gap-1 text-[11px] flex-1"
                        onClick={() => decide(change.id, "rejected")}
                      >
                        <X className="size-3" /> Reject
                      </Button>
                      {decision !== "pending" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 gap-1 text-[11px] text-muted-foreground"
                          onClick={() => decide(change.id, "pending")}
                        >
                          <RotateCcw className="size-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <DialogFooter className="shrink-0">
          {stage === "review" ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                variant="hero"
                size="sm"
                onClick={applyDecisions}
                disabled={applying || acceptedCount === 0}
              >
                {applying
                  ? "Applying…"
                  : `Apply ${acceptedCount || ""} change${acceptedCount === 1 ? "" : "s"}`}
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              {stage === "empty" || stage === "error" ? "Close" : "Cancel"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
