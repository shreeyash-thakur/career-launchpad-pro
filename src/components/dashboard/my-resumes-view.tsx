import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Clock,
  MoreVertical,
  Edit2,
  Copy,
  Trash2,
  ArrowRight,
  FileText,
  Layout,
  CheckCircle2,
  FileSearch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { ResumeService, type FirestoreResume } from "@/lib/resume-service";
import { calculateResumeCompletion } from "@/features/resume-builder/utils/completion";
import { getTemplate } from "@/features/resume-builder/templates";

interface Props {
  resumes: FirestoreResume[];
  onRefresh: () => void;
  onCreateNew: () => void;
  onNavigateToAts?: (resumeId: string) => void;
}

export function MyResumesView({ resumes, onRefresh, onCreateNew, onNavigateToAts }: Props) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "title" | "completion">("recent");

  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState<FirestoreResume | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);

  const filtered = resumes
    .filter((r) => {
      const matchSearch =
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.templateId.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "completion") {
        const scoreA = calculateResumeCompletion(a.resumeData).score;
        const scoreB = calculateResumeCompletion(b.resumeData).score;
        return scoreB - scoreA;
      }
      return b.updatedAt - a.updatedAt;
    });

  const handleOpenRename = (r: FirestoreResume) => {
    setSelectedResume(r);
    setNewTitle(r.title);
    setRenameDialogOpen(true);
  };

  const handleConfirmRename = async () => {
    if (!selectedResume || !user?.uid || !newTitle.trim()) return;
    setLoadingAction(true);
    try {
      await ResumeService.renameResume(selectedResume.id, user.uid, newTitle.trim());
      setRenameDialogOpen(false);
      onRefresh();
    } catch (err) {
      console.error("Failed to rename:", err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleOpenDelete = (r: FirestoreResume) => {
    setSelectedResume(r);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedResume || !user?.uid) return;
    setLoadingAction(true);
    try {
      await ResumeService.deleteResume(selectedResume.id, user.uid);
      setDeleteDialogOpen(false);
      onRefresh();
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDuplicate = async (r: FirestoreResume) => {
    if (!user?.uid) return;
    try {
      await ResumeService.duplicateResume(r.id, user.uid);
      onRefresh();
    } catch (err) {
      console.error("Failed to duplicate:", err);
    }
  };

  function formatTimeAgo(timestamp: number) {
    const diffMs = Date.now() - timestamp;
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">My Resumes</h1>
          <p className="text-xs text-muted-foreground">
            Manage, customize, duplicate, and download all your resume variations.
          </p>
        </div>

        <Button
          onClick={onCreateNew}
          className="bg-[image:var(--gradient-emerald)] text-primary-foreground font-semibold shadow-[var(--shadow-glow)] hover:brightness-110 gap-2 text-xs"
        >
          <Plus className="size-4" />
          Create New Resume
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search resumes by title or template…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-muted-foreground shrink-0">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "recent" | "title" | "completion")}
            className="h-9 rounded-xl border border-input bg-card px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="recent">Recently edited</option>
            <option value="title">Title (A-Z)</option>
            <option value="completion">Completion %</option>
          </select>
        </div>
      </div>

      {/* Resumes Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <FileText className="size-7" />
          </div>
          {searchTerm ? (
            <>
              <h3 className="font-display text-base font-bold">No matching resumes found</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Try adjusting your search keywords or clear the filter.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchTerm("")}
                className="mt-4 text-xs"
              >
                Clear Search
              </Button>
            </>
          ) : (
            <>
              <h3 className="font-display text-base font-bold">
                You haven&apos;t created any resumes yet
              </h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                Get started by creating your first resume. Pick from 20+ ATS templates.
              </p>
              <Button
                onClick={onCreateNew}
                className="mt-4 bg-[image:var(--gradient-emerald)] text-primary-foreground font-semibold shadow-[var(--shadow-glow)] gap-2 text-xs"
              >
                <Plus className="size-4" />
                Create First Resume
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((resume) => {
            const completion = calculateResumeCompletion(resume.resumeData);
            const template = getTemplate(resume.templateId);
            const isComplete = completion.score >= 80;

            return (
              <div
                key={resume.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                      <Layout className="size-3 text-primary" />
                      {template.name}
                    </span>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-7 rounded-lg">
                          <MoreVertical className="size-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => handleOpenRename(resume)}
                          className="gap-2 text-xs"
                        >
                          <Edit2 className="size-3.5" /> Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicate(resume)}
                          className="gap-2 text-xs"
                        >
                          <Copy className="size-3.5" /> Duplicate
                        </DropdownMenuItem>
                        {onNavigateToAts && (
                          <DropdownMenuItem
                            onClick={() => onNavigateToAts(resume.id)}
                            className="gap-2 text-xs"
                          >
                            <FileSearch className="size-3.5" /> ATS Score
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleOpenDelete(resume)}
                          className="gap-2 text-xs text-destructive focus:text-destructive"
                        >
                          <Trash2 className="size-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <h3 className="font-display font-bold text-base leading-snug truncate group-hover:text-primary transition-colors">
                    {resume.title}
                  </h3>

                  <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5" />
                    <span>Last edited {formatTimeAgo(resume.updatedAt)}</span>
                  </div>

                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">Completion</span>
                      <span className="font-semibold text-foreground">
                        {completion.score}% Complete
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[image:var(--gradient-emerald)] transition-all duration-500"
                        style={{ width: `${completion.score}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                  <Button
                    variant={isComplete ? "hero" : "outline"}
                    size="sm"
                    className="w-full text-xs font-semibold gap-1.5"
                    asChild
                  >
                    <Link
                      to="/builder"
                      search={{ resumeId: resume.id, template: resume.templateId }}
                    >
                      {isComplete ? "Open Resume" : "Continue Editing"}
                      <ArrowRight className="size-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Resume</DialogTitle>
            <DialogDescription>Enter a new name for your resume document.</DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-1.5">
            <Label htmlFor="resume-rename" className="text-xs">
              Resume Name
            </Label>
            <Input
              id="resume-rename"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              className="text-sm"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="hero"
              size="sm"
              disabled={loadingAction || !newTitle.trim()}
              onClick={handleConfirmRename}
            >
              Save Name
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Resume</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete &ldquo;{selectedResume?.title}&rdquo;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={loadingAction}
              onClick={handleConfirmDelete}
            >
              Delete Resume
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}