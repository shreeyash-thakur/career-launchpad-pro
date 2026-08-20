import { useRef, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import {
  Redo2,
  Undo2,
  FileJson,
  Upload,
  RotateCcw,
  Sparkles,
  Check,
  Loader2,
  MoreVertical,
  FileSearch,
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
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ResumeData, ResumeStyle } from "../types";
import type { SaveStatus } from "../hooks/use-resume-store";
import { downloadJson, readJsonFile } from "../utils/export";
import { useResumeExport } from "./resume-export-surface";
import { DownloadMenu } from "./download-menu";
import { toast } from "sonner";

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
  const [startOverOpen, setStartOverOpen] = useState(false);
  const { resumeId } = useParams({ from: "/resumes/$resumeId/editor" });
  const { ExportSurface, download, exporting } = useResumeExport(
    data,
    style,
    data.personal.fullName || "resume",
  );

  async function handleDownload(format: Parameters<typeof download>[0]) {
    try {
      await download(format);
    } catch (err) {
      console.error("Failed to export resume:", err);
      const message =
        err instanceof Error && /render|generate/i.test(err.message)
          ? err.message
          : "Couldn't generate the download. Please try again.";
      toast.error(message);
    }
  }

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

  const statusLabel =
    status === "saving" ? "Saving…" : status === "saved" ? "Saved to cloud" : "Autosave on";

  return (
    <div className="no-print flex items-center justify-between gap-2 border-b border-border bg-background/80 px-3 py-2.5 backdrop-blur sm:gap-3 sm:px-4 sm:py-3">
      <Link to="/" className="flex shrink-0 items-center gap-2 font-display text-sm font-semibold">
        <span className="flex size-7 items-center justify-center rounded-lg bg-[image:var(--gradient-emerald)] text-primary-foreground">
          <Sparkles className="size-3.5" />
        </span>
        <span className="hidden sm:inline">CareerGPT</span>
      </Link>

      <div className="hidden flex-1 items-center justify-center gap-1 text-xs text-muted-foreground sm:flex">
        {status === "saving" ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Check className="size-3.5 text-emerald-600" />
        )}
        {statusLabel}
      </div>

      <input
        ref={importRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => handleImport(e.target.files?.[0])}
      />

      {/* Compact status pill on phones, where there's no room for the centered label above. */}
      <div className="flex items-center gap-1 text-[11px] text-muted-foreground sm:hidden">
        {status === "saving" ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Check className="size-3.5 text-emerald-600" />
        )}
      </div>

      <div className="flex items-center gap-1.5">
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

        {/* Secondary actions: always visible from sm up, tucked into a menu on phones
            so the toolbar doesn't wrap into multiple rows and eat editing space. */}
        <div className="hidden items-center gap-1.5 sm:flex">
          <div className="mx-1 h-5 w-px bg-border" />
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/5"
            asChild
          >
            <Link to="/resumes/$resumeId/ats" params={{ resumeId }}>
              <FileSearch className="size-3.5" /> ATS Score
            </Link>
          </Button>
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
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-muted-foreground"
            onClick={() => setStartOverOpen(true)}
          >
            <RotateCcw className="size-3.5" /> Start over
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 sm:hidden"
              aria-label="More actions"
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild className="gap-2">
              <Link to="/resumes/$resumeId/ats" params={{ resumeId }}>
                <FileSearch className="size-3.5" /> ATS Score
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => importRef.current?.click()} className="gap-2">
              <Upload className="size-3.5" /> Import JSON
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => downloadJson(`${data.personal.fullName || "resume"}.json`, data)}
              className="gap-2"
            >
              <FileJson className="size-3.5" /> Export JSON
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setStartOverOpen(true)}
              className="gap-2 text-destructive"
            >
              <RotateCcw className="size-3.5" /> Start over
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={startOverOpen} onOpenChange={setStartOverOpen}>
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

        <DownloadMenu onDownload={handleDownload} exporting={exporting} size="compact" />
      </div>
      <ExportSurface />
    </div>
  );
}