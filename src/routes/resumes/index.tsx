import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/contexts/AuthContext";
import {
  deleteResume,
  duplicateResume,
  getUserResumes,
  type ResumeDocument,
} from "@/lib/resume-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Loader2, Plus, FileText, Pencil, Copy, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { migrateLocalResume } from "@/lib/migrate-local-resume";

export const Route = createFileRoute("/resumes/")({
  head: () => ({
    meta: [{ title: "My Resumes — CareerGPT" }],
  }),
  component: MyResumesPage,
});

function MyResumesPage() {
  return (
    <ProtectedRoute>
      <MyResumesContent />
    </ProtectedRoute>
  );
}

function formatDate(timestamp: ResumeDocument["updatedAt"]): string {
  if (!timestamp) return "Recently";
  const millis = timestamp.toMillis?.() ?? Date.now();
  const date = new Date(millis);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
}

function MyResumesContent() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<ResumeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    // First, try to migrate any existing localStorage resume
    void migrateLocalResume(user.uid)
      .then((migratedId) => {
        if (cancelled) return;
        return getUserResumes(user.uid).then((data) => {
          if (cancelled) return;
          setResumes(data);
          if (migratedId) {
            toast.success("Your previous resume was imported!");
          }
        });
      })
      .catch((err) => {
        console.error("Failed to load resumes:", err);
        toast.error("Couldn't load your resumes.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleCreate = async () => {
    if (!user) return;
    setCreating(true);
    try {
      const resume = await import("@/lib/resume-service").then((m) => m.createResume(user.uid));
      window.location.href = `/resumes/${resume.id}/questionnaire`;
    } catch (err) {
      console.error("Failed to create resume:", err);
      toast.error("Couldn't create a new resume.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!user) return;
    try {
      await deleteResume(resumeId, user.uid);
      setResumes((prev) => prev.filter((r) => r.id !== resumeId));
      toast.success("Resume deleted.");
    } catch (err) {
      console.error("Failed to delete resume:", err);
      toast.error("Couldn't delete the resume.");
    }
  };

  const handleDuplicate = async (resumeId: string) => {
    if (!user) return;
    try {
      const copy = await duplicateResume(resumeId, user.uid);
      if (copy) {
        setResumes((prev) => [copy, ...prev]);
        toast.success("Resume duplicated.");
      }
    } catch (err) {
      console.error("Failed to duplicate resume:", err);
      toast.error("Couldn't duplicate the resume.");
    }
  };

  return (
    <div className="relative min-h-dvh bg-background">
      {/* Ambient background blobs */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div
          className="animate-blob absolute -left-[15%] -top-[20%] h-[70vw] w-[70vw] rounded-full opacity-25 blur-[120px]"
          style={{ background: "var(--gradient-emerald)" }}
        />
        <div
          className="animate-blob absolute -right-[20%] top-[10%] h-[55vw] w-[55vw] rounded-full opacity-15 blur-[130px] [animation-delay:-8s]"
          style={{ background: "var(--gradient-gold)" }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Header */}
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-3xl font-semibold">My Resumes</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {user ? `Signed in as ${user.email}` : ""}
            </p>
          </div>
          <Button
            variant="hero"
            size="lg"
            onClick={() => void handleCreate()}
            disabled={creating}
            className="gap-2"
          >
            {creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Create New Resume
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : resumes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/40 px-6 py-20 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[image:var(--gradient-emerald)] text-primary-foreground">
              <FileText className="size-6" />
            </div>
            <h2 className="font-display text-xl font-semibold">No resumes yet</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Create your first resume — answer a few questions, pick a template, and download a
              free PDF.
            </p>
            <Button
              variant="hero"
              className="mt-6 gap-2"
              onClick={() => void handleCreate()}
              disabled={creating}
            >
              {creating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              Create My Resume
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => (
              <Card key={resume.id} className="group overflow-hidden transition-all hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="size-4 text-primary" />
                    <span className="truncate">{resume.title}</span>
                  </CardTitle>
                  <CardDescription>
                    Last edited: {formatDate(resume.updatedAt)}
                    {resume.questionnaireCompleted ? "" : " · Needs questionnaire"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="hero" size="sm" asChild className="flex-1 gap-1.5">
                      <Link
                        to={
                          resume.questionnaireCompleted
                            ? "/resumes/$resumeId/editor"
                            : "/resumes/$resumeId/questionnaire"
                        }
                        params={{ resumeId: resume.id }}
                      >
                        <Pencil className="size-3.5" />
                        {resume.questionnaireCompleted ? "Continue Editing" : "Complete Setup"}
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => void handleDuplicate(resume.id)}
                      aria-label="Duplicate resume"
                    >
                      <Copy className="size-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-destructive hover:text-destructive"
                          aria-label="Delete resume"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this resume?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This permanently deletes "{resume.title}". This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => void handleDelete(resume.id)}
                            className="bg-destructive text-white hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}