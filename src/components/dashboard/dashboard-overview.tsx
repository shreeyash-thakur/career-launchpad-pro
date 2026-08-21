import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Plus,
  Sparkles,
  FileText,
  Clock,
  CheckCircle2,
  MoreVertical,
  Edit2,
  Copy,
  Trash2,
  ArrowRight,
  Bot,
  Zap,
  Layout,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { ResumeService, type FirestoreResume } from "@/lib/resume-service";
import { calculateResumeCompletion } from "@/features/resume-builder/utils/completion";
import { getTemplate } from "@/features/resume-builder/templates";

interface Props {
  resumes: FirestoreResume[];
  onRefresh: () => void;
  onCreateNew: () => void;
  onNavigateTab: (tab: string) => void;
}

export function DashboardOverview({ resumes, onRefresh, onCreateNew, onNavigateTab }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState<FirestoreResume | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);

  const firstName = user?.displayName ? user.displayName.split(" ")[0] : "there";
  const recentResumes = resumes.slice(0, 3);

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
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  }

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-border bg-gradient-to-r from-card via-card/80 to-secondary/30 p-6 sm:p-8 backdrop-blur shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {firstName} 👋
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Continue building your career. Every resume is ATS-ready and free to download.
          </p>
        </div>

        <Button
          onClick={onCreateNew}
          size="lg"
          className="bg-[image:var(--gradient-emerald)] text-primary-foreground font-semibold shadow-[var(--shadow-glow)] hover:brightness-110 hover:-translate-y-0.5 transition-all gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="size-5" />
          Create New Resume
        </Button>
      </div>

      {/* Recent Resumes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold">Recent Resumes</h2>
            <p className="text-xs text-muted-foreground">Pick up where you left off</p>
          </div>
          {resumes.length > 3 && (
            <button
              type="button"
              onClick={() => onNavigateTab("resumes")}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              View all ({resumes.length}) <ArrowRight className="size-3" />
            </button>
          )}
        </div>

        {resumes.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/40 p-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
              <FileText className="size-7" />
            </div>
            <h3 className="font-display text-base font-bold">
              You haven&apos;t created a resume yet
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              Build your first professional resume in minutes with guided questions and ATS
              templates.
            </p>
            <Button
              onClick={onCreateNew}
              className="mt-5 bg-[image:var(--gradient-emerald)] text-primary-foreground font-semibold shadow-[var(--shadow-glow)] gap-2 text-xs"
            >
              <Plus className="size-4" />
              Create My Resume
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentResumes.map((resume) => {
              const completion = calculateResumeCompletion(resume.resumeData);
              const template = getTemplate(resume.templateId);
              const isComplete = completion.score >= 80;

              return (
                <div
                  key={resume.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1"
                >
                  <div>
                    {/* Top Row: Template Badge + Menu */}
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

                    {/* Resume Title */}
                    <h3 className="font-display font-bold text-base leading-snug truncate group-hover:text-primary transition-colors">
                      {resume.title}
                    </h3>

                    {/* Last edited */}
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="size-3.5" />
                      <span>Last edited {formatTimeAgo(resume.updatedAt)}</span>
                    </div>

                    {/* Completion bar */}
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

                  {/* Actions footer */}
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
      </div>

      {/* Quick Access to AI Tools & Templates */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* AI Tools Card */}
        <div
          onClick={() => onNavigateTab("ai-tools")}
          className="group relative flex flex-col justify-between rounded-3xl border border-border bg-gradient-to-br from-card to-card/60 p-6 transition-all hover:border-primary/50 hover:shadow-md cursor-pointer"
        >
          <div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
              <Bot className="size-5" />
            </div>
            <h3 className="font-display text-base font-bold group-hover:text-primary transition-colors">
              AI Career Tools
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Enhance bullet points with action verbs, generate targeted executive summaries, and
              match keywords with job descriptions.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-primary gap-1">
            <span>Explore AI Tools</span>{" "}
            <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Browse Templates Card */}
        <div
          onClick={() => onNavigateTab("templates")}
          className="group relative flex flex-col justify-between rounded-3xl border border-border bg-gradient-to-br from-card to-card/60 p-6 transition-all hover:border-primary/50 hover:shadow-md cursor-pointer"
        >
          <div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-gold/10 text-gold mb-3">
              <Zap className="size-5" />
            </div>
            <h3 className="font-display text-base font-bold group-hover:text-primary transition-colors">
              20+ ATS-Ready Templates
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Explore styles for Harvard ATS, McKinsey Consulting, Wall Street Finance, Full-Stack
              Developers, and more.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-primary gap-1">
            <span>Browse Templates</span>{" "}
            <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Real Activity List */}
      {resumes.length > 0 && (
        <div className="rounded-3xl border border-border bg-card p-6 space-y-3">
          <h3 className="font-display text-sm font-bold">Recent Workspace Activity</h3>
          <div className="divide-y divide-border/60">
            {resumes.slice(0, 4).map((r) => (
              <div key={r.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="size-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground">
                    Edited{" "}
                    <strong className="font-medium text-foreground">&ldquo;{r.title}&rdquo;</strong>
                  </span>
                </div>
                <span className="text-muted-foreground text-[11px]">
                  {formatTimeAgo(r.updatedAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Resume</DialogTitle>
            <DialogDescription>Enter a new name for your resume.</DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-1.5">
            <Label htmlFor="resume-name" className="text-xs">
              Resume Name
            </Label>
            <Input
              id="resume-name"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Developer"
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
              Are you sure you want to delete &ldquo;{selectedResume?.title}&rdquo;? This action
              cannot be undone.
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
