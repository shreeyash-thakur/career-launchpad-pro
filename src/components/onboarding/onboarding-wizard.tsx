"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Option {
  value: string;
  label: string;
  icon?: string;
}

interface Step {
  id: string;
  question: string;
  subtitle: string;
  options: Option[];
}

// ─── Steps definition ────────────────────────────────────────────────────────

const STEPS: Step[] = [
  {
    id: "experience",
    question: "What best describes your experience level?",
    subtitle: "We'll recommend the best resume format for your career stage.",
    options: [
      { value: "student", label: "Student / Recent Graduate", icon: "🎓" },
      { value: "entry", label: "Entry-Level (0–2 years)", icon: "🌱" },
      { value: "mid", label: "Mid-Career Professional", icon: "💼" },
      { value: "senior", label: "Senior / Executive", icon: "🏆" },
      { value: "changer", label: "Career Changer", icon: "🔄" },
    ],
  },
  {
    id: "industry",
    question: "Which industry are you targeting?",
    subtitle: "We'll suggest templates that resonate with your field's expectations.",
    options: [
      { value: "tech", label: "Technology / Engineering", icon: "💻" },
      { value: "finance", label: "Finance / Accounting", icon: "📊" },
      { value: "marketing", label: "Marketing / Design", icon: "🎨" },
      { value: "healthcare", label: "Healthcare / Medical", icon: "🏥" },
      { value: "education", label: "Education / Research", icon: "📚" },
      { value: "other", label: "Other / General", icon: "✨" },
    ],
  },
  {
    id: "role_type",
    question: "What type of role are you applying for?",
    subtitle: "This helps us match your resume to the right opportunity.",
    options: [
      { value: "fulltime", label: "Full-time Job", icon: "🏢" },
      { value: "internship", label: "Internship / Co-op", icon: "🌟" },
      { value: "freelance", label: "Freelance / Contract", icon: "🚀" },
      { value: "academic", label: "Academic / Research", icon: "🔬" },
    ],
  },
  {
    id: "style",
    question: "How would you describe your preferred resume style?",
    subtitle: "Your style speaks before your words do.",
    options: [
      { value: "minimal", label: "Clean & Minimal", icon: "⬜" },
      { value: "bold", label: "Bold & Creative", icon: "🎭" },
      { value: "corporate", label: "Corporate & Professional", icon: "📋" },
      { value: "technical", label: "Developer / Technical", icon: "⌨️" },
    ],
  },
  {
    id: "layout",
    question: "What layout do you prefer?",
    subtitle: "We'll pre-select a template that matches your preference.",
    options: [
      { value: "single", label: "Single Column", icon: "▬" },
      { value: "two-col", label: "Two-Column Sidebar", icon: "▪▪" },
      { value: "timeline", label: "Timeline / Chronological", icon: "📅" },
      { value: "compact", label: "Compact ATS-Safe", icon: "✅" },
    ],
  },
];

// ─── Template recommendation logic ──────────────────────────────────────────

type Answers = Record<string, string>;

function recommendTemplate(answers: Answers): string {
  const { experience, industry, style, layout } = answers;

  if (industry === "tech" || style === "technical" || experience === "student") {
    if (layout === "compact") return "compact-ats";
    if (layout === "timeline") return "timeline";
    return "developer";
  }
  if (style === "bold" || industry === "marketing") {
    if (layout === "two-col") return "creative";
    return "bold-header";
  }
  if (experience === "senior" || style === "corporate") {
    if (layout === "two-col") return "elegant";
    return "executive";
  }
  if (experience === "student") {
    return "minimal";
  }
  if (layout === "timeline") return "timeline";
  if (layout === "two-col") return "elegant";
  if (layout === "compact") return "compact-ats";
  if (style === "minimal") return "minimal";
  return "modern";
}

// ─── Option Card ─────────────────────────────────────────────────────────────

function OptionCard({
  option,
  selected,
  onSelect,
}: {
  option: Option;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      id={`option-${option.value}`}
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_20%,transparent)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        selected
          ? "border-primary/70 bg-[color-mix(in_oklab,var(--primary)_10%,var(--card))] shadow-[0_0_32px_color-mix(in_oklab,var(--primary)_18%,transparent)]"
          : "border-border bg-card/60 glass",
      )}
    >
      {option.icon && (
        <span className="text-2xl leading-none select-none">{option.icon}</span>
      )}
      <span className="font-medium text-sm leading-snug">{option.label}</span>
      {selected && (
        <CheckCircle2 className="ml-auto size-4 shrink-0 text-primary" aria-hidden="true" />
      )}
    </button>
  );
}

// ─── Main Wizard ─────────────────────────────────────────────────────────────

export function OnboardingWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const [answers, setAnswers] = useState<Answers>({});
  const [finishing, setFinishing] = useState(false);

  const current = STEPS[step]!;
  const total = STEPS.length;
  const progress = ((step + 1) / total) * 100;
  const selectedValue = answers[current.id];
  const canProceed = Boolean(selectedValue);

  const goNext = () => {
    if (!canProceed) return;
    if (step < total - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    } else {
      // Final step — recommend + navigate
      setFinishing(true);
      const template = recommendTemplate(answers);
      // Store in sessionStorage for the template showcase recommendation badge
      try {
        sessionStorage.setItem("onboarding:answers", JSON.stringify(answers));
        sessionStorage.setItem("onboarding:recommended", template);
      } catch {}
      setTimeout(() => {
        void navigate({
          to: "/builder",
          search: { template, fromOnboarding: "1" },
        });
      }, 600);
    }
  };

  const goBack = () => {
    if (step === 0) return;
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const selectAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  };

  // Slide variants
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0,
    }),
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      {/* Logo / Brand */}
      <div className="mb-10 flex items-center gap-2 font-display text-base font-semibold">
        <span className="flex size-8 items-center justify-center rounded-xl bg-[image:var(--gradient-emerald)] text-primary-foreground">
          <Sparkles className="size-4" aria-hidden="true" />
        </span>
        CareerGPT
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xl mb-8">
        <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
          <span>Step {step + 1} of {total}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-[image:var(--gradient-emerald)]"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
      </div>

      {/* Question + options */}
      <div className="relative w-full max-w-xl overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
          >
            {/* Question */}
            <div className="mb-6 text-center">
              <h1 className="font-display text-2xl font-semibold leading-tight sm:text-3xl">
                {current.question}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">{current.subtitle}</p>
            </div>

            {/* Options grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              {current.options.map((option) => (
                <OptionCard
                  key={option.value}
                  option={option}
                  selected={selectedValue === option.value}
                  onSelect={() => selectAnswer(option.value)}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex w-full max-w-xl items-center justify-between gap-4">
        <Button
          id="onboarding-back"
          variant="ghost"
          size="default"
          onClick={goBack}
          disabled={step === 0}
          className="gap-2"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>

        <Button
          id="onboarding-next"
          disabled={!canProceed || finishing}
          onClick={goNext}
          className="gap-2 bg-[image:var(--gradient-emerald)] text-primary-foreground font-semibold shadow-[var(--shadow-glow)] hover:brightness-110 hover:-translate-y-0.5 transition-all"
        >
          {finishing ? (
            <>Building your resume…</>
          ) : step < total - 1 ? (
            <>
              Continue
              <ArrowRight className="size-4" />
            </>
          ) : (
            <>
              Find my template
              <Sparkles className="size-4" />
            </>
          )}
        </Button>
      </div>

      {/* Skip link */}
      <button
        id="onboarding-skip"
        type="button"
        onClick={() => void navigate({ to: "/builder", search: {} })}
        className="mt-6 text-xs text-muted-foreground underline-offset-4 hover:underline transition-colors"
      >
        Skip and choose a template myself
      </button>
    </div>
  );
}
