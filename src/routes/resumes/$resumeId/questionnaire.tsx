import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/contexts/AuthContext";
import { getResume } from "@/lib/resume-service";
import { QuestionnaireWizard } from "@/components/onboarding/questionnaire-wizard";
import { Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/resumes/$resumeId/questionnaire")({
  head: () => ({
    meta: [{ title: "Resume Questionnaire — CareerGPT" }],
  }),
  component: ResumeQuestionnairePage,
});

function ResumeQuestionnairePage() {
  const { resumeId } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  // Verify ownership and questionnaire state
  useEffect(() => {
    if (loading) return;
    if (!user) return;
    let cancelled = false;

    void getResume(resumeId, user.uid)
      .then((resume) => {
        if (cancelled) return;
        if (!resume) {
          // Not found or not owned — redirect to dashboard
          void navigate({ to: "/resumes" });
          return;
        }
        if (resume.questionnaireCompleted) {
          // Already completed — skip to template selection
          void navigate({ to: "/resumes/$resumeId/template", params: { resumeId } });
          return;
        }
        setChecking(false);
      })
      .catch((err) => {
        console.error("Failed to load resume for questionnaire:", err);
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [resumeId, user, loading, navigate]);

  if (loading || checking) {
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
        <QuestionnaireWizard resumeId={resumeId} />
      </div>
    </ProtectedRoute>
  );
}