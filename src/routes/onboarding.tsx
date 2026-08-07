import { createFileRoute } from "@tanstack/react-router";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Get Started — CareerGPT" },
      {
        name: "description",
        content:
          "Answer a few quick questions and we'll recommend the perfect resume template for your career stage and industry.",
      },
    ],
  }),
  component: OnboardingPage,
});

function OnboardingPage() {
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
        <div
          className="absolute inset-0 opacity-[0.09] text-primary"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "68px 68px",
            maskImage: "radial-gradient(90% 60% at 50% 0%, black, transparent 85%)",
          }}
        />
      </div>
      <OnboardingWizard />
    </div>
  );
}
