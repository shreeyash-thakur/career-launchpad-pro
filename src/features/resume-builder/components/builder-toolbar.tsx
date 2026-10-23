import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Download,
  Redo2,
  Undo2,
  RotateCcw,
  Sparkles,
  Check,
  Loader2,
  LayoutDashboard,
  CloudCheck,
  Edit2,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { calculateResumeCompletion } from "../utils/completion";
import { ResumeReadyModal } from "./resume-ready-modal";
import { ResumeTailoringDialog } from "./resume-tailoring-dialog";
import { useResumeExport } from "./resume-export-surface";
import { toast } from "sonner";

interface Props {
  title: string;
  onTitleChange: (title: string) => void;
  data: ResumeData;
  style: ResumeStyle;
  status: SaveStatus;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReplaceData: (data: ResumeData, beforeScore?: number, afterScore?: number) => void;
  onResetBlank: () => void;
  onResetSample: () => void;
  isCloudSynced?: boolean;
  uid?: string;
}

export function BuilderToolbar({
  title,
  onTitleChange,
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
  isCloudSynced = false,
  uid,
}: Props) {
  const [readyModalOpen, setReadyModalOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [tailorModalOpen, setTailorModalOpen] = useState(false);
  const { ExportSurface, download, exporting } = useResumeExport(data, style, title);

  const completion = calculateResumeCompletion(data);

  const handleDownload = async () => {
    try {
      await download("pdf");
      setReadyModalOpen(true);
    } catch (err) {
      console.error("Failed to export resume:", err);
      toast.error(
        err instanceof Error && /render|generate/i.test(err.message)
          ? err.message
          : "Couldn't generate the download. Please try again.",
      );
    }
  };

  return (
    <>
      <div className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-2.5 backdrop-blur z-20">
        {/* Left: Brand + Document Title */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 font-display text-sm font-semibold hover:opacity-80 transition-opacity"
          >
            <span className="flex size-7 items-center justify-center rounded-lg bg-[image:var(--gradient-emerald)] text-primary-foreground shadow-[var(--shadow-glow)]">
              <Sparkles className="size-3.5" />
            </span>
            <span className="hidden sm:inline font-bold">PeasiProfile</span>
          </Link>

          <div className="h-4 w-px bg-border hidden sm:block" />

          {/* Editable Document Title */}
          <div className="flex items-center gap-1.5">
            {editingTitle ? (
              <Input
                type="text"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setEditingTitle(false);
                }}
                autoFocus
                className="h-7 w-48 text-xs font-semibold px-2"
              />
            ) : (
              <button
                type="button"
                onClick={() => setEditingTitle(true)}
                className="flex items-center gap-1.5 rounded px-2 py-1 text-xs font-semibold hover:bg-secondary/70 transition-colors text-foreground group"
                title="Click to rename"
              >
                <span className="truncate max-w-[140px] sm:max-w-[200px]">{title}</span>
                <Edit2 className="size-3 text-muted-foreground group-hover:text-foreground shrink-0 opacity-60" />
              </button>
            )}
          </div>
        </div>

        {/* Center: Save status & Completion score */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            {status === "saving" ? (
              <>
                <Loader2 className="size-3.5 animate-spin text-primary" /> Saving…
              </>
            ) : (
              <>
                <Check className="size-3.5 text-emerald-600" />
                <span>{isCloudSynced ? "Synced to cloud" : "Saved"}</span>
              </>
            )}
          </div>

          <div className="h-3 w-px bg-border hidden md:block" />

          {/* Completion percentage */}
          <div className="hidden md:flex items-center gap-1.5">
            <div className="h-2 w-16 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${completion.score}%` }}
              />
            </div>
            <span className="font-semibold text-[11px] text-foreground">
              {completion.score}% Complete
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* AI Tailor for Job Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTailorModalOpen(true)}
            className="gap-1.5 text-xs font-semibold border-primary/40 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
          >
            <Wand2 className="size-3.5" />
            <span>Tailor for Job</span>
          </Button>

          <div className="mx-0.5 h-5 w-px bg-border" />

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

          <div className="mx-1 h-5 w-px bg-border hidden sm:block" />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs text-muted-foreground hidden lg:flex"
              >
                <RotateCcw className="size-3.5" /> Reset
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Start a fresh resume?</AlertDialogTitle>
                <AlertDialogDescription>
                  This resets the current draft in the editor. You can always undo before clearing
                  it.
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
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link to="/dashboard">
              <LayoutDashboard className="size-3.5 text-primary" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </Button>

          <Button
            variant="hero"
            size="sm"
            className="gap-1.5 font-semibold shadow-[var(--shadow-glow)]"
            onClick={handleDownload}
            disabled={exporting !== null}
          >
            {exporting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5" />
            )}
            {exporting ? "Preparing…" : "Download PDF"}
          </Button>
        </div>
      </div>

      <ResumeTailoringDialog
        open={tailorModalOpen}
        onOpenChange={setTailorModalOpen}
        resumeData={data}
        {...(uid ? { uid } : {})}
        onApply={(updated, before, after) => {
          onReplaceData(updated, before, after);
        }}
      />

      <ResumeReadyModal
        open={readyModalOpen}
        onOpenChange={setReadyModalOpen}
        resumeTitle={title}
        onDownloadAgain={handleDownload}
        isExporting={exporting !== null}
      />
      <ExportSurface />
    </>
  );
}
