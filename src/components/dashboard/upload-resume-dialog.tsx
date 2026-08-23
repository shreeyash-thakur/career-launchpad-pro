import { useRef, useState } from "react";
import { UploadCloud, FileText, Loader2, AlertTriangle, CheckCircle2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  extractTextFromResumeFile,
  ResumeFileError,
} from "@/features/resume-builder/utils/resume-file-parser";
import { parseUploadedResume } from "@/lib/ai-service";
import { ResumeService, type FirestoreResume } from "@/lib/resume-service";
import { cn } from "@/lib/utils";

type Stage = "pick" | "reading" | "analyzing" | "review" | "error";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uid: string | undefined;
  onCreated: (resume: FirestoreResume) => void;
}

export function UploadResumeDialog({ open, onOpenChange, uid, onCreated }: Props) {
  const [stage, setStage] = useState<Stage>("pick");
  const [fileName, setFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [uncertainFields, setUncertainFields] = useState<string[]>([]);
  const [pendingResumeData, setPendingResumeData] = useState<
    Awaited<ReturnType<typeof parseUploadedResume>>["resumeData"] | null
  >(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setStage("pick");
    setFileName("");
    setErrorMessage("");
    setUncertainFields([]);
    setPendingResumeData(null);
    setSaving(false);
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setFileName(file.name);
    setStage("reading");
    setErrorMessage("");

    try {
      const text = await extractTextFromResumeFile(file);
      setStage("analyzing");
      const { resumeData, uncertainFields } = await parseUploadedResume({
        ...(uid ? { uid } : {}),
        resumeText: text,
      });
      setPendingResumeData(resumeData);
      setUncertainFields(uncertainFields);
      setStage("review");
    } catch (err) {
      setStage("error");
      setErrorMessage(
        err instanceof ResumeFileError
          ? err.message
          : "Something went wrong analysing that resume. Please try again.",
      );
    }
  }

  async function handleConfirm() {
    if (!uid || !pendingResumeData) return;
    setSaving(true);
    try {
      const created = await ResumeService.createResume(uid, {
        title: pendingResumeData.personal.fullName
          ? `${pendingResumeData.personal.fullName}'s Resume`
          : "Uploaded Resume",
        resumeData: pendingResumeData,
        questionnaireCompleted: true,
      });
      onCreated(created);
      onOpenChange(false);
      reset();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Couldn't save this resume. Please try again.",
      );
      setStage("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload your resume</DialogTitle>
          <DialogDescription>
            We&apos;ll extract your existing content into an editable, ATS-friendly resume. Nothing
            is invented — anything unclear gets flagged for you to confirm.
          </DialogDescription>
        </DialogHeader>

        {stage === "pick" && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border p-10 text-center hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <UploadCloud className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Click to choose a file</p>
            <p className="text-xs text-muted-foreground">PDF or DOCX, up to 8MB</p>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(e) => void handleFile(e.target.files?.[0])}
            />
          </button>
        )}

        {(stage === "reading" || stage === "analyzing") && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border p-10 text-center">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">
              {stage === "reading" ? `Reading ${fileName}…` : "Structuring your resume…"}
            </p>
            <p className="text-xs text-muted-foreground">This usually takes a few seconds.</p>
          </div>
        )}

        {stage === "error" && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <AlertTriangle className="size-7 text-destructive" />
            <p className="text-sm font-medium text-foreground">{errorMessage}</p>
            <Button variant="outline" size="sm" onClick={reset}>
              Try a different file
            </Button>
          </div>
        )}

        {stage === "review" && pendingResumeData && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-secondary/40 p-4">
              <FileText className="size-5 text-primary shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {pendingResumeData.personal.fullName || "Extracted resume"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {pendingResumeData.experience.length} experience entr
                  {pendingResumeData.experience.length === 1 ? "y" : "ies"} ·{" "}
                  {pendingResumeData.education.length} education ·{" "}
                  {pendingResumeData.skills.reduce((n, g) => n + g.items.length, 0)} skills found
                </p>
              </div>
            </div>

            {uncertainFields.length > 0 && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="size-3.5" /> Please double-check these after import
                </div>
                <ul className="space-y-1">
                  {uncertainFields.map((f, i) => (
                    <li key={i} className="text-xs text-foreground/80 flex gap-1.5">
                      <span>•</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {uncertainFields.length === 0 && (
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-600">
                <CheckCircle2 className="size-3.5" /> Everything extracted cleanly.
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              You&apos;ll land in the editor next to review every field before it&apos;s considered
              final — we never add skills, achievements, or numbers that weren&apos;t in your
              original file.
            </p>
          </div>
        )}

        <DialogFooter>
          {stage === "review" ? (
            <>
              <Button variant="ghost" size="sm" onClick={reset} disabled={saving}>
                Start over
              </Button>
              <Button variant="hero" size="sm" onClick={handleConfirm} disabled={saving}>
                {saving ? "Creating…" : "Create & review resume"}
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className={cn(stage === "pick" ? "" : "gap-1.5")}
            >
              {stage !== "pick" && stage !== "error" && <X className="size-3.5" />}
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
