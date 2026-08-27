import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/contexts/AuthContext";
import { getResume } from "@/lib/resume-service";
import type { ResumeData, ResumeStyle } from "@/features/resume-builder/types";
import { getTemplate } from "@/features/resume-builder/templates";
import { PAGE_DIMENSIONS } from "@/features/resume-builder/templates/resume-page";
import { useElementHeight } from "@/features/resume-builder/hooks/use-element-height";
import { useResumeExport } from "@/features/resume-builder/components/resume-export-surface";
import { DownloadMenu } from "@/features/resume-builder/components/download-menu";
import { Button } from "@/components/ui/button";
import { Loader2, Check, AlertCircle, ArrowLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { blankResume, defaultStyle } from "@/features/resume-builder/sample-data";

export const Route = createFileRoute("/resumes/$resumeId/check")({
  head: () => ({
    meta: [{ title: "Final Resume Check — CareerGPT" }],
  }),
  component: FinalCheckPage,
});

function FinalCheckPage() {
  const { resumeId } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [resume, setResume] = useState<{ data: ResumeData; style: ResumeStyle } | null>(null);
  const [checking, setChecking] = useState(true);

  // Hooks can't be called conditionally, so this is wired up with safe
  // placeholder data before the résumé loads; the download controls
  // themselves only render once `resume` is actually set below.
  const { ExportSurface, download, exporting } = useResumeExport(
    resume?.data ?? blankResume(),
    resume?.style ?? defaultStyle(),
    resume?.data.personal.fullName || "resume",
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

  const previewRef = useRef<HTMLDivElement>(null);
  const previewContentHeight = useElementHeight(previewRef, [resume?.data, resume?.style]);

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    let cancelled = false;

    void getResume(resumeId, user.uid)
      .then((doc) => {
        if (cancelled) return;
        if (!doc) {
          toast.error("Resume not found or you don't have access.");
          void navigate({ to: "/resumes" });
          return;
        }
        // If questionnaire not completed, send user to questionnaire first
        if (!doc.questionnaireCompleted) {
          void navigate({ to: "/resumes/$resumeId/questionnaire", params: { resumeId } });
          return;
        }
        setResume({ data: doc.resumeData, style: doc.style });
        setChecking(false);
      })
      .catch((err) => {
        console.error("Failed to load resume for check:", err);
        if (!cancelled) {
          toast.error("Couldn't load your resume.");
          setChecking(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [resumeId, user, loading, navigate]);

  if (loading || checking || !resume) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { data, style } = resume;
  const template = getTemplate(style.templateId);
  const dims = PAGE_DIMENSIONS[style.pageSize];
  const pageCount = Math.max(1, Math.ceil((previewContentHeight || dims.height) / dims.height));

  // Real checklist (not fake scores)
  const checks = [
    {
      label: "Contact information",
      passed: Boolean(data.personal.email),
      hint: "Add at least an email address so recruiters can reach you.",
    },
    {
      label: "Full name",
      passed: Boolean(data.personal.fullName),
      hint: "Make sure your full name is at the top.",
    },
    {
      label: "Education",
      passed: data.education.length > 0,
      hint: "Add your degree or school.",
    },
    {
      label: "Skills",
      passed: data.skills.length > 0,
      hint: "Add a few skills relevant to your target role.",
    },
    {
      label: "Experience or Projects",
      passed: data.experience.length > 0 || data.projects.length > 0,
      hint: "Add experience or projects to show what you've done.",
    },
    {
      label: "LinkedIn profile",
      passed: Boolean(data.personal.linkedin),
      hint: "Add your LinkedIn URL — it's commonly expected.",
      optional: true,
    },
  ];

  const passedCount = checks.filter((c) => c.passed).length;
  const total = checks.length;

  return (
    <ProtectedRoute>
      <div className="relative min-h-dvh bg-background">
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
          <div className="mb-10 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[color-mix(in_oklab,var(--primary)_10%,var(--background))] px-4 py-1.5 text-xs font-medium text-primary">
              <Sparkles className="size-3.5" />
              {passedCount}/{total} checks passed
            </div>
            <h1 className="font-display text-3xl font-semibold sm:text-4xl">Resume Ready!</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Review the checklist below. Missing items are suggestions — nothing blocks your free
              download.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card/60 p-6">
                <h2 className="mb-4 font-display text-lg font-semibold">Final Resume Check</h2>
                <ul className="space-y-3">
                  {checks.map((check) => (
                    <li key={check.label} className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                          check.passed
                            ? "bg-emerald-500/15 text-emerald-600"
                            : "bg-amber-500/15 text-amber-600",
                        )}
                      >
                        {check.passed ? (
                          <Check className="size-3" />
                        ) : (
                          <AlertCircle className="size-3" />
                        )}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{check.label}</p>
                        {!check.passed && (
                          <p className="mt-0.5 text-xs text-muted-foreground">{check.hint}</p>
                        )}
                        {check.optional && !check.passed && (
                          <p className="mt-0.5 text-[0.65rem] text-muted-foreground/70">Optional</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-card/60 p-6">
                <h3 className="mb-2 font-display text-base font-semibold">Next steps</h3>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" asChild className="justify-start">
                    <Link to="/resumes/$resumeId/editor" params={{ resumeId }}>
                      <ArrowLeft className="size-4" />
                      Back to editor
                    </Link>
                  </Button>
                  <DownloadMenu
                    onDownload={handleDownload}
                    exporting={exporting}
                    size="large"
                    className="w-full [&>button]:flex-1 [&>button:first-child]:justify-center"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-secondary/30 p-6">
              <div className="mx-auto max-w-[600px]">
                {pageCount > 1 && (
                  <div className="mb-3 flex justify-center">
                    <span className="rounded-full bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                      Page 1 of {pageCount} — the full {pageCount}-page résumé is in your download
                    </span>
                  </div>
                )}
                <div
                  className="relative mx-auto origin-top-left overflow-hidden rounded-lg bg-white shadow-2xl"
                  style={{ width: dims.width, height: dims.height }}
                >
                  <div
                    className="origin-top-left"
                    style={{
                      width: dims.width,
                      height: dims.height,
                      transform: `scale(${Math.min(600 / dims.width, 1)})`,
                    }}
                  >
                    <template.Component data={data} style={style} pageRef={previewRef} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ExportSurface />
    </ProtectedRoute>
  );
}
