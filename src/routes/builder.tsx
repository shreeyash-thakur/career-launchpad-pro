import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useResumeStore } from "@/features/resume-builder/hooks/use-resume-store";
import { blankResume, sampleResume } from "@/features/resume-builder/sample-data";
import { BuilderToolbar } from "@/features/resume-builder/components/builder-toolbar";
import { PersonalInfoForm } from "@/features/resume-builder/components/personal-info-form";
import { ExperienceForm } from "@/features/resume-builder/components/experience-form";
import { EducationForm } from "@/features/resume-builder/components/education-form";
import { SkillsForm } from "@/features/resume-builder/components/skills-form";
import { ProjectsForm } from "@/features/resume-builder/components/projects-form";
import {
  CertificationsForm,
  LanguagesForm,
} from "@/features/resume-builder/components/simple-list-forms";
import { CustomSectionsForm } from "@/features/resume-builder/components/custom-sections-form";
import { SectionOrderForm } from "@/features/resume-builder/components/section-order-form";
import { TemplatePicker } from "@/features/resume-builder/components/template-picker";
import { CustomizePanel } from "@/features/resume-builder/components/customize-panel";
import { ResumePreview } from "@/features/resume-builder/components/resume-preview";
import { getTemplate } from "@/features/resume-builder/templates";
import { Sparkles, X, AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { ResumeService, type FirestoreResume } from "@/lib/resume-service";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/builder")({
  head: () => ({
    meta: [
      { title: "Resume Builder — PeasiProfile" },
      {
        name: "description",
        content:
          "Build a recruiter-ready resume with a live preview, 25 original templates, and one-click PDF export.",
      },
    ],
  }),
  validateSearch: (
    search: Record<string, unknown>,
  ): { template?: string; fromOnboarding?: string; resumeId?: string } => ({
    template: typeof search["template"] === "string" ? search["template"] : undefined,
    fromOnboarding:
      typeof search["fromOnboarding"] === "string" ? search["fromOnboarding"] : undefined,
    resumeId: typeof search["resumeId"] === "string" ? search["resumeId"] : undefined,
  }),
  component: BuilderPage,
});

function BuilderPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [loadingDoc, setLoadingDoc] = useState(Boolean(search.resumeId));
  const [docError, setDocError] = useState<string | null>(null);
  const [loadedResume, setLoadedResume] = useState<FirestoreResume | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const appliedRef = useRef(false);

  // Fetch Firestore resume if resumeId provided
  useEffect(() => {
    let active = true;
    async function loadResume() {
      if (!search.resumeId) {
        setLoadingDoc(false);
        return;
      }
      setLoadingDoc(true);
      setDocError(null);

      try {
        const res = await ResumeService.getResume(search.resumeId, user?.uid || "guest");
        if (!active) return;
        if (!res) {
          setDocError("Resume not found or was deleted.");
        } else if (user?.uid && res.uid && res.uid !== user.uid) {
          setDocError("You do not have permission to view or edit this resume.");
        } else {
          setLoadedResume(res);
        }
      } catch (err: unknown) {
        if (!active) return;
        if (err instanceof Error && err.message === "UNAUTHORIZED_RESUME_ACCESS") {
          setDocError("You do not have permission to access this resume.");
        } else {
          setDocError("Could not load resume data. Please try again.");
        }
      } finally {
        if (active) setLoadingDoc(false);
      }
    }

    if (!authLoading) {
      void loadResume();
    }

    return () => {
      active = false;
    };
  }, [search.resumeId, user?.uid, authLoading]);

  const store = useResumeStore({
    resumeId: search.resumeId,
    userId: user?.uid,
    initialResume: loadedResume,
  });

  const { title, setTitle, data, setData, style, setStyle } = store;

  // Apply template from URL search param (from onboarding or landing page)
  useEffect(() => {
    if (appliedRef.current) return;
    const templateId = search.template;
    if (templateId) {
      const found = getTemplate(templateId);
      if (found) {
        setStyle((prev) => ({ ...prev, templateId: found.id }));
        if (search.fromOnboarding === "1") {
          setShowBanner(true);
        }
      }
      appliedRef.current = true;
    }
  }, [search.template, search.fromOnboarding, setStyle]);

  // Auto-dismiss banner after 5 seconds
  useEffect(() => {
    if (!showBanner) return;
    const t = setTimeout(() => setShowBanner(false), 5000);
    return () => clearTimeout(t);
  }, [showBanner]);

  if (loadingDoc || authLoading) {
    return (
      <div className="flex h-svh flex-col items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="size-8 animate-spin text-primary" />
          <h2 className="font-display text-lg font-semibold">Opening your resume…</h2>
          <p className="text-xs text-muted-foreground">Preparing live editor and print styles</p>
        </div>
      </div>
    );
  }

  if (docError) {
    return (
      <div className="flex h-svh flex-col items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-lg">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="size-6" />
          </div>
          <h1 className="font-display text-xl font-bold">{docError}</h1>
          <p className="mt-2 text-xs text-muted-foreground">
            The resume you tried to access cannot be found or belongs to another user account.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button variant="hero" size="sm" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="size-4" /> Go to Dashboard
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void navigate({ to: "/builder", search: {} });
              }}
            >
              Start New Draft
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const recommendedName = search.template
    ? (getTemplate(search.template)?.name ?? "template")
    : "template";

  return (
    <div className="flex h-svh flex-col bg-secondary/30">
      {/* Onboarding recommendation banner */}
      {showBanner && (
        <div className="no-print relative flex items-center justify-between gap-3 bg-[color-mix(in_oklab,var(--primary)_12%,var(--background))] border-b border-primary/20 px-4 py-2.5 text-sm">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="size-4 shrink-0" aria-hidden="true" />
            <span>
              Based on your answers, we selected the{" "}
              <strong className="font-semibold">{recommendedName}</strong> template for you. Switch
              anytime in the Design tab.
            </span>
          </div>
          <button
            id="dismiss-onboarding-banner"
            type="button"
            onClick={() => setShowBanner(false)}
            className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <BuilderToolbar
        title={title}
        onTitleChange={setTitle}
        data={data}
        style={style}
        status={store.status}
        canUndo={store.canUndo}
        canRedo={store.canRedo}
        onUndo={store.undo}
        onRedo={store.redo}
        onReplaceData={(next) => setData(next)}
        onResetBlank={() => store.resetToBlank(blankResume())}
        onResetSample={() => setData(sampleResume())}
        isCloudSynced={Boolean(search.resumeId && user?.uid)}
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[420px_1fr]">
        <div className="no-print no-print-clip order-2 min-h-0 overflow-y-auto border-r border-border bg-background lg:order-1">
          <Tabs defaultValue="content" className="flex h-full flex-col">
            <div className="border-b border-border px-4 pt-3">
              <TabsList className="w-full">
                <TabsTrigger value="content" className="flex-1">
                  Content
                </TabsTrigger>
                <TabsTrigger value="design" className="flex-1">
                  Design
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="content" className="mt-0 flex-1 overflow-y-auto p-4">
              <Accordion
                type="multiple"
                defaultValue={["personal", "experience"]}
                className="space-y-2"
              >
                <AccordionItem
                  value="personal"
                  className="rounded-xl border border-border bg-card px-3"
                >
                  <AccordionTrigger className="text-sm font-semibold">
                    Personal &amp; Summary
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <PersonalInfoForm data={data} onChange={setData} showPhoto={style.showPhoto} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="experience"
                  className="rounded-xl border border-border bg-card px-3"
                >
                  <AccordionTrigger className="text-sm font-semibold">
                    Experience {data.experience.length > 0 ? `(${data.experience.length})` : ""}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <ExperienceForm data={data} onChange={setData} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="education"
                  className="rounded-xl border border-border bg-card px-3"
                >
                  <AccordionTrigger className="text-sm font-semibold">
                    Education {data.education.length > 0 ? `(${data.education.length})` : ""}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <EducationForm data={data} onChange={setData} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="skills"
                  className="rounded-xl border border-border bg-card px-3"
                >
                  <AccordionTrigger className="text-sm font-semibold">
                    Skills {data.skills.length > 0 ? `(${data.skills.length})` : ""}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <SkillsForm data={data} onChange={setData} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="projects"
                  className="rounded-xl border border-border bg-card px-3"
                >
                  <AccordionTrigger className="text-sm font-semibold">
                    Projects {data.projects.length > 0 ? `(${data.projects.length})` : ""}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <ProjectsForm data={data} onChange={setData} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="certifications"
                  className="rounded-xl border border-border bg-card px-3"
                >
                  <AccordionTrigger className="text-sm font-semibold">
                    Certifications{" "}
                    {data.certifications.length > 0 ? `(${data.certifications.length})` : ""}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <CertificationsForm data={data} onChange={setData} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="languages"
                  className="rounded-xl border border-border bg-card px-3"
                >
                  <AccordionTrigger className="text-sm font-semibold">
                    Languages {data.languages.length > 0 ? `(${data.languages.length})` : ""}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <LanguagesForm data={data} onChange={setData} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="custom"
                  className="rounded-xl border border-border bg-card px-3"
                >
                  <AccordionTrigger className="text-sm font-semibold">
                    Custom sections{" "}
                    {data.customSections.length > 0 ? `(${data.customSections.length})` : ""}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <CustomSectionsForm data={data} onChange={setData} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="order"
                  className="rounded-xl border border-border bg-card px-3"
                >
                  <AccordionTrigger className="text-sm font-semibold">
                    Section order
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <SectionOrderForm data={data} onChange={setData} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            <TabsContent value="design" className="mt-0 flex-1 overflow-y-auto p-4">
              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Template</h3>
                  <TemplatePicker
                    data={data}
                    style={style}
                    onSelect={(templateId) => setStyle((prev) => ({ ...prev, templateId }))}
                  />
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Customize</h3>
                  <CustomizePanel style={style} onChange={setStyle} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="order-1 min-h-0 overflow-hidden lg:order-2">
          <ResumePreview data={data} style={style} onStyleChange={setStyle} />
        </div>
      </div>
    </div>
  );
}
