import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  Download,
  Redo2,
  Undo2,
  FileJson,
  Upload,
  RotateCcw,
  Sparkles,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ResumeData, ResumeStyle } from "../types";
import type { SaveStatus } from "../hooks/use-resume-store";
import { downloadJson, printResume, readJsonFile } from "../utils/export";

interface Props {
  data: ResumeData;
  style: ResumeStyle;
  status: SaveStatus;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReplaceData: (data: ResumeData) => void;
  onResetBlank: () => void;
  onResetSample: () => void;
}

export function BuilderToolbar({
  data,
  style,
  status,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReplaceData,
  onResetBlank,
  onResetSample,
}: Props) {
  const importRef = useRef<HTMLInputElement>(null);

  async function handleImport(file: File | undefined) {
    if (!file) return;
    try {
      const parsed = await readJsonFile<ResumeData>(file);
      if (parsed && typeof parsed === "object" && "personal" in parsed) {
        onReplaceData(parsed);
      }
    } catch {
      // Silently ignore malformed files; a toast system could surface this.
    }
  }

  return (
    <div className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
      <Link to="/" className="flex items-center gap-2 font-display text-sm font-semibold">
        <span className="flex size-7 items-center justify-center rounded-lg bg-[image:var(--gradient-emerald)] text-primary-foreground">
          <Sparkles className="size-3.5" />
        </span>
        CareerGPT
      </Link>

      <div className="flex flex-1 items-center justify-center gap-1 text-xs text-muted-foreground">
        {status === "saving" ? (
          <>
            <Loader2 className="size-3.5 animate-spin" /> Saving…
          </>
        ) : (
          <>
            <Check className="size-3.5 text-emerald-600" /> Saved locally
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          disabled={!canUndo}
          onClick={onUndo}
          aria-label="Undo"
        >
          <Undo2 className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          disabled={!canRedo}
          onClick={onRedo}
          aria-label="Redo"
        >
          <Redo2 className="size-4" />
        </Button>

        <div className="mx-1 h-5 w-px bg-border" />

        <input
          ref={importRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => handleImport(e.target.files?.[0])}
        />
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => importRef.current?.click()}
        >
          <Upload className="size-3.5" /> Import
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => downloadJson(`${data.personal.fullName || "resume"}.json`, data)}
        >
          <FileJson className="size-3.5" /> Export JSON
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
              <RotateCcw className="size-3.5" /> Start over
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Start a new résumé?</AlertDialogTitle>
              <AlertDialogDescription>
                This clears everything currently in the editor. Export a JSON backup first if you
                want to keep it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onResetBlank}>Clear and start blank</AlertDialogAction>
              <AlertDialogAction onClick={onResetSample}>Load sample instead</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          variant="hero"
          size="sm"
          className="gap-1.5"
          onClick={() => printResume(style.pageSize)}
        >
          <Download className="size-3.5" /> Download PDF
        </Button>
      </div>
    </div>
  );
}
