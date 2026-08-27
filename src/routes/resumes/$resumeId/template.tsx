import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/contexts/AuthContext";
import { getResume, updateResume } from "@/lib/resume-service";
import { TEMPLATES } from "@/features/resume-builder/templates";
import { PAGE_DIMENSIONS } from "@/features/resume-builder/templates/resume-page";
import type { ResumeData, ResumeStyle } from "@/features/resume-builder/types";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/resumes/$resumeId/template")({
  head: () => ({
    meta: [{ title: "Choose Template — CareerGPT" }],
  }),
  component: TemplateSelectionPage,
});

const THUMB_WIDTH = 200;

function TemplateSelectionPage() {
  const { resumeId } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [resume, setResume] = useState<{ resumeData: ResumeData; style: ResumeStyle } | null>(null);
  const [checking, setChecking] = useState(true);
  const [selected, setSelected] = useState<string>("modern");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    let cancelled = false;

    void getResume(resumeId, user.uid)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          void navigate({ to: "/resumes" });
          return;
        }
        setResume({ resumeData: data.resumeData, style: data.style });
        setSelected(data.style.templateId || "modern");
        setChecking(false);
      })
      .catch((err) => {
        console.error("Failed to load resume for template selection:", err);
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [resumeId, user, loading, navigate]);

  const handleSelect = async () => {
    if (!user || !resume) return;
    setSaving(true);
    try {
      await updateResume(resumeId, user.uid, {
        style: { ...resume.style, templateId: selected },
        templateId: selected,
      });
      toast.success("Template selected!");
      void navigate({ to: "/resumes/$resumeId/editor", params: { resumeId } });
    } catch (err) {
      console.error("Failed to save template:", err);
      toast.error("Couldn't save the template. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || checking || !resume) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
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
          <div className="mb-10 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[color-mix(in_oklab,var(--primary)_10%,var(--background))] px-4 py-1.5 text-xs font-medium text-primary">
              <Sparkles className="size-3.5" />
              Recommended for your profile
            </div>
            <h1 className="font-display text-3xl font-semibold sm:text-4xl">
              Choose Your Resume Template
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Browse all templates below. You can switch anytime in the editor's Design tab.
            </p>
          </div>

          {/* Template grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATES.map((template) => {
              const dims = PAGE_DIMENSIONS[resume.style.pageSize];
              const scale = THUMB_WIDTH / dims.width;
              const thumbHeight = dims.height * scale;
              const active = selected === template.id;
              const previewStyle: ResumeStyle = { ...resume.style, templateId: template.id };

              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelected(template.id)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border-2 bg-secondary/40 p-3 text-left transition-all",
                    active
                      ? "border-primary ring-2 ring-primary/30 shadow-[0_0_32px_color-mix(in_oklab,var(--primary)_18%,transparent)]"
                      : "border-border hover:border-primary/50 hover:-translate-y-0.5",
                  )}
                >
                  <div
                    className="relative mx-auto overflow-hidden rounded-lg bg-white shadow-sm"
                    style={{ width: THUMB_WIDTH, height: thumbHeight }}
                  >
                    <div
                      className="pointer-events-none origin-top-left"
                      style={{
                        width: dims.width,
                        height: dims.height,
                        transform: `scale(${scale})`,
                      }}
                    >
                      <template.Component data={resume.resumeData} style={previewStyle} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 px-0.5">
                    <div>
                      <p className="text-sm font-semibold leading-tight">{template.name}</p>
                      <p className="text-xs text-muted-foreground">{template.category}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {template.category.toLowerCase().includes("ats") && (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.6rem] font-semibold text-emerald-600">
                          ATS
                        </span>
                      )}
                      {active ? (
                        <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-3" />
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer actions */}
          <div className="mt-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Button variant="ghost" onClick={() => void navigate({ to: "/resumes" })}>
              Back to My Resumes
            </Button>
            <Button
              variant="hero"
              size="lg"
              className="gap-2"
              onClick={() => void handleSelect()}
              disabled={saving}
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              {saving ? "Saving…" : "Use this template"}
              {!saving && <ArrowRight className="size-4" />}
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}