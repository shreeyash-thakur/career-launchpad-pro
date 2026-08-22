import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Redo2,
  Undo2,
  FileJson,
  Upload,
  RotateCcw,
  Sparkles,
  Check,
  Loader2,
  LayoutDashboard,
  CloudCheck,
  Edit2,
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
import { downloadJson, readJsonFile, type ExportFormat } from "../utils/export";
import { calculateResumeCompletion } from "../utils/completion";
import { ResumeReadyModal } from "./resume-ready-modal";
import { DownloadMenu } from "./download-menu";
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
  onReplaceData: (data: ResumeData) => void;
  onResetBlank: () => void;
  onResetSample: () => void;
  isCloudSynced?: boolean;
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
}: Props) {
  const importRef = useRef<HTMLInputElement>(null);
  const [readyModalOpen, setReadyModalOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);

  const completion = calculateResumeCompletion(data);

  const { ExportSurface, download, exporting } = useResumeExport(
    data,
    style,
    title || data.personal.fullName || "resume",
  );

  async function handleImport(file: File | undefined) {
    if (!file) return;
    try {
      const parsed = await readJsonFile<ResumeData>(file);
      if (parsed && typeof parsed === "object" && "personal" in parsed) {
        onReplaceData(parsed);
      }
    } catch {
      // Silently ignore
    }
  }

  async function handleDownload(format: ExportFormat) {
    try {
      await download(format);
      setTimeout(() => {
        setReadyModalOpen(true);
      }, 300);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Couldn't generate the download. Please try again.",
      );
    }
  }

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

          {/* Real Completion percentage */}
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
            className="gap-1.5 text-xs hidden sm:flex"
            onClick={() => importRef.current?.click()}
          >
            <Upload className="size-3.5" /> Import
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs hidden md:flex"
            onClick={() => downloadJson(`${title || "resume"}.json`, data)}
          >
            <FileJson className="size-3.5" /> JSON
          </Button>

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
                  This resets the current draft in the editor. You can always undo or export a JSON
                  backup first.
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

          <DownloadMenu onDownload={handleDownload} exporting={exporting} size="compact" />
        </div>
      </div>

      <ExportSurface />

      <ResumeReadyModal
        open={readyModalOpen}
        onOpenChange={setReadyModalOpen}
        pageSize={style.pageSize}
        resumeTitle={title}
      />
    </>
  );
}