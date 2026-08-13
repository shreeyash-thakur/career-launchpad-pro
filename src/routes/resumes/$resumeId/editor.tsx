import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/contexts/AuthContext";
import { getResume, saveResumeContent } from "@/lib/resume-service";
import type { ResumeData, ResumeStyle } from "@/features/resume-builder/types";
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
import { Loader2, Check, AlertTriangle, Pencil, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/resumes/$resumeId/editor")({
  head: () => ({
    meta: [{ title: "Resume Editor — CareerGPT" }],
  }),
  component: ResumeEditorPage,
});

function ResumeEditorPage() {
  return (
    <ProtectedRoute>
      <ResumeEditorContent />
    </ProtectedRoute>
  );
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

function ResumeEditorContent() {
  const { resumeId } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState<ResumeData | null>(null);
  const [style, setStyleState] = useState<ResumeStyle | null>(null);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [checking, setChecking] = useState(true);
  // Below `lg` the form and the preview no longer sit side by side — the
  // person switches between them instead of scrolling past a full résumé
  // preview to reach the next form field (or vice versa).
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");

  const undoStack = useRef<ResumeData[]>([]);
  const redoStack = useRef<ResumeData[]>([]);
  const skipHistory = useRef(false);
  const [, forceRender] = useState(0);

  // Load resume from Firestore
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
        setData(doc.resumeData);
        setStyleState(doc.style);
        setChecking(false);
      })
      .catch((err) => {
        console.error("Failed to load resume:", err);
        if (!cancelled) {
          toast.error("Couldn't load your resume.");
          setChecking(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [resumeId, user, loading, navigate]);

  const setDataState = useCallback((updater: ResumeData | ((prev: ResumeData) => ResumeData)) => {
    setData((prev) => {
      if (!prev) return prev;
      const next =
        typeof updater === "function" ? (updater as (p: ResumeData) => ResumeData)(prev) : updater;
      if (!skipHistory.current) {
        undoStack.current.push(prev);
        if (undoStack.current.length > 40) undoStack.current.shift();
        redoStack.current = [];
      }
      skipHistory.current = false;
      forceRender((n) => n + 1);
      return next;
    });
  }, []);

  const setStyle = useCallback((updater: ResumeStyle | ((prev: ResumeStyle) => ResumeStyle)) => {
    setStyleState((prev) => {
      if (!prev) return prev;
      return typeof updater === "function"
        ? (updater as (p: ResumeStyle) => ResumeStyle)(prev)
        : updater;
    });
  }, []);

  const undo = useCallback(() => {
    setData((prev) => {
      if (!prev) return prev;
      const last = undoStack.current.pop();
      if (!last) return prev;
      redoStack.current.push(prev);
      skipHistory.current = true;
      forceRender((n) => n + 1);
      return last;
    });
  }, []);

  const redo = useCallback(() => {
    setData((prev) => {
      if (!prev) return prev;
      const next = redoStack.current.pop();
      if (!next) return prev;
      undoStack.current.push(prev);
      skipHistory.current = true;
      forceRender((n) => n + 1);
      return next;
    });
  }, []);

  // Debounced Firestore persistence
  useEffect(() => {
    if (!user || !data || !style || checking) return;
    setStatus("saving");
    const t = setTimeout(() => {
      void saveResumeContent(resumeId, user.uid, data, style)
        .then(() => setStatus("saved"))
        .catch((err) => {
          console.error("Failed to save resume to Firestore:", err);
          setStatus("error");
        });
    }, 800);
    return () => clearTimeout(t);
  }, [data, style, user, resumeId, checking]);

  if (loading || checking || !data || !style) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-svh flex-col bg-secondary/30">
      <BuilderToolbar
        data={data}
        style={style}
        status={status === "saving" ? "saving" : status === "saved" ? "saved" : "idle"}
        canUndo={undoStack.current.length > 0}
        canRedo={redoStack.current.length > 0}
        onUndo={undo}
        onRedo={redo}
        onReplaceData={(next) => setDataState(next)}
        onResetBlank={() => setDataState(blankResume())}
        onResetSample={() => setDataState(sampleResume())}
      />

      {status === "error" && (
        <div className="flex items-center gap-2 border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-xs text-destructive">
          <AlertTriangle className="size-3.5" />
          Changes aren't reaching the cloud. Please check your connection.
        </div>
      )}

      {/* Edit / Preview switch — only needed once the two panels stack (below lg) */}
      <div className="no-print flex justify-center border-b border-border bg-background px-3 py-2 lg:hidden">
        <div className="inline-flex rounded-lg bg-secondary p-1">
          <button
            type="button"
            onClick={() => setMobileView("edit")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-medium transition-colors",
              mobileView === "edit"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
          >
            <Pencil className="size-3.5" /> Edit
          </button>
          <button
            type="button"
            onClick={() => setMobileView("preview")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-medium transition-colors",
              mobileView === "preview"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
          >
            <Eye className="size-3.5" /> Preview
          </button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[420px_1fr]">
        <div
          className={cn(
            "no-print no-print-clip order-2 min-h-0 overflow-y-auto border-r border-border bg-background lg:order-1 lg:block",
            mobileView === "preview" && "hidden",
          )}
        >
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
                    Personal & Summary
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <PersonalInfoForm
                      data={data}
                      onChange={setDataState}
                      showPhoto={style.showPhoto}
                    />
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
                    <ExperienceForm data={data} onChange={setDataState} />
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
                    <EducationForm data={data} onChange={setDataState} />
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
                    <SkillsForm data={data} onChange={setDataState} />
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
                    <ProjectsForm data={data} onChange={setDataState} />
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
                    <CertificationsForm data={data} onChange={setDataState} />
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
                    <LanguagesForm data={data} onChange={setDataState} />
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
                    <CustomSectionsForm data={data} onChange={setDataState} />
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
                    <SectionOrderForm data={data} onChange={setDataState} />
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

        <div
          className={cn(
            "order-1 min-h-0 min-w-0 overflow-hidden lg:order-2 lg:block",
            mobileView === "edit" && "hidden",
          )}
        >
          <ResumePreview data={data} style={style} onStyleChange={setStyle} />
        </div>
      </div>

      {/* Final check / download bar */}
      <div className="no-print flex items-center justify-between gap-3 border-t border-border bg-background/80 px-4 py-2.5 backdrop-blur">
        <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
          <Check className="size-3.5 text-emerald-600" />
          {status === "saving" ? "Saving…" : status === "saved" ? "Saved to cloud" : "Autosave"}
        </div>
        <Button variant="hero" size="sm" className="w-full sm:w-auto" asChild>
          <a href={`/resumes/${resumeId}/check`}>Final Resume Check</a>
        </Button>
      </div>
    </div>
  );
}
