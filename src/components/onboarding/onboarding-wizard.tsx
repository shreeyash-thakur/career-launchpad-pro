"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Check,
  LayoutGrid,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, stripUndefined } from "@/lib/utils";
import { TEMPLATES, getTemplate } from "@/features/resume-builder/templates";
import { useAuth } from "@/context/auth-context";
import { ResumeService } from "@/lib/resume-service";
import type { TemplateMeta } from "@/features/resume-builder/types";

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
    question: "What best describes your career stage?",
    subtitle: "We'll recommend the best resume structure for your experience level.",
    options: [
      { value: "student", label: "Student / Fresh Graduate", icon: "🎓" },
      { value: "entry", label: "Entry-Level (0–2 years)", icon: "🌱" },
      { value: "mid", label: "Mid-Career Professional (3–7 years)", icon: "💼" },
      { value: "senior", label: "Senior / Executive (8+ years)", icon: "🏆" },
      { value: "changer", label: "Career Changer / Transitioning", icon: "🔄" },
    ],
  },
  {
    id: "industry",
    question: "Which industry are you targeting?",
    subtitle: "We'll suggest templates proven to stand out in your field.",
    options: [
      { value: "tech", label: "Technology & Software Engineering", icon: "💻" },
      { value: "finance", label: "Finance, Banking & Consulting", icon: "📊" },
      { value: "marketing", label: "Marketing, Product & Creative", icon: "🎨" },
      { value: "healthcare", label: "Healthcare & Life Sciences", icon: "🏥" },
      { value: "academic", label: "Academic, Science & Research", icon: "🔬" },
      { value: "business", label: "Corporate, Sales & Management", icon: "🏢" },
    ],
  },
  {
    id: "role_type",
    question: "What type of role are you seeking?",
    subtitle: "This ensures the formatting matches recruiter expectations.",
    options: [
      { value: "fulltime", label: "Full-time Employment", icon: "🏢" },
      { value: "internship", label: "Internship / Graduate Program", icon: "🌟" },
      { value: "contract", label: "Contract / Freelance / Consulting", icon: "🚀" },
      { value: "leadership", label: "Team Lead / Management", icon: "👑" },
    ],
  },
  {
    id: "style",
    question: "What visual style do you prefer?",
    subtitle: "Select the tone that matches your personal brand.",
    options: [
      { value: "ats", label: "Strict ATS-Optimized", icon: "✅" },
      { value: "modern", label: "Clean & Modern", icon: "✨" },
      { value: "minimal", label: "Minimalist & Elegant", icon: "⬜" },
      { value: "bold", label: "Bold & Distinctive", icon: "🎭" },
    ],
  },
];

// ─── Multi-Template Recommendation Logic ────────────────────────────────────

type Answers = Record<string, string>;

function getRecommendedTemplates(answers: Answers): (TemplateMeta & { reason: string })[] {
  const { experience, industry, style } = answers;
  const list: { id: string; reason: string }[] = [];

  if (industry === "finance") {
    list.push({
      id: "wall-street-finance",
      reason: "Preferred by investment banking & private equity recruiters",
    });
    list.push({
      id: "mckinsey-consulting",
      reason: "High-density layout tailored for management consulting",
    });
    list.push({ id: "harvard-ats", reason: "Standard Ivy League single-column ATS format" });
    list.push({ id: "executive", reason: "Formal serif presentation for senior finance leaders" });
  } else if (industry === "tech" || style === "ats") {
    list.push({ id: "developer", reason: "Monospace, high-contrast & ATS-parser friendly" });
    list.push({
      id: "react-developer",
      reason: "Two-column design highlighting GitHub & tech stack",
    });
    list.push({ id: "ai-research", reason: "Optimized for data science and engineering metrics" });
    list.push({
      id: "compact-ats",
      reason: "Dense single-column layout for strict corporate ATS systems",
    });
    list.push({
      id: "tech-grid",
      reason: "Structured skill matrix format for technical contributors",
    });
  } else if (experience === "student" || experience === "entry") {
    list.push({
      id: "campus-graduate",
      reason: "Emphasizes education, projects & coursework for grads",
    });
    list.push({
      id: "teal-sidebar",
      reason: "Contemporary two-column format with fresh visual balance",
    });
    list.push({
      id: "modern",
      reason: "Clean single-column standard suitable for all entry roles",
    });
    list.push({
      id: "minimal",
      reason: "Refined typography-first layout with generous whitespace",
    });
  } else if (style === "bold" || industry === "marketing") {
    list.push({ id: "creative", reason: "Eye-catching two-column layout with sidebar" });
    list.push({
      id: "editorial-slate",
      reason: "Magazine-style editorial typography for creative leads",
    });
    list.push({
      id: "bold-header",
      reason: "Distinctive header banner to grab recruiter attention",
    });
    list.push({
      id: "startup",
      reason: "Dynamic gradient styling favored by high-growth startups",
    });
  } else if (experience === "senior") {
    list.push({
      id: "executive",
      reason: "Commanding executive layout with refined serif headers",
    });
    list.push({
      id: "mckinsey-consulting",
      reason: "Crisp, metric-driven layout for senior directors",
    });
    list.push({ id: "harvard-ats", reason: "Timeless academic and corporate leadership standard" });
    list.push({ id: "elegant", reason: "Polished multi-column layout for seasoned professionals" });
  } else {
    list.push({ id: "modern", reason: "Top all-around choice for recruiter readability" });
    list.push({ id: "minimal", reason: "Timeless minimalism that puts your content first" });
    list.push({
      id: "compact-ats",
      reason: "High-parsing reliability across all recruitment software",
    });
    list.push({
      id: "teal-sidebar",
      reason: "Modern two-column layout with crisp section headers",
    });
  }

  // Map to full template meta
  return list.map((item) => {
    const meta = getTemplate(item.id);
    return {
      ...meta,
      reason: item.reason,
    };
  });
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
      {option.icon && <span className="text-2xl leading-none select-none">{option.icon}</span>}
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
  const search = useSearch({ from: "/onboarding" }) as {
    resumeId?: string;
    fromDashboard?: string;
  };
  const resumeId = search?.resumeId;
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  const [showTemplatesSelection, setShowTemplatesSelection] = useState(false);
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("modern");
  const [finishing, setFinishing] = useState(false);

  // Check if existing resume already completed questionnaire
  useEffect(() => {
    async function checkExisting() {
      if (resumeId && user?.uid) {
        try {
          const res = await ResumeService.getResume(resumeId, user.uid);
          if (res && res.questionnaireCompleted) {
            void navigate({
              to: "/builder",
              search: { resumeId: res.id, template: res.templateId },
            });
          }
        } catch {}
      }
    }
    void checkExisting();
  }, [resumeId, user?.uid, navigate]);

  const total = STEPS.length;
  const current = STEPS[step];
  const progress = showTemplatesSelection ? 100 : ((step + 1) / (total + 1)) * 100;
  const selectedValue = current ? answers[current.id] : undefined;
  const canProceed = Boolean(selectedValue);

  const goNext = () => {
    if (!canProceed) return;
    if (step < total - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    } else {
      // Show templates recommendation screen
      setShowTemplatesSelection(true);
      const recommended = getRecommendedTemplates(answers);
      if (recommended.length > 0) {
        setSelectedTemplateId(recommended[0]!.id);
      }
    }
  };

  const goBack = () => {
    if (showTemplatesSelection) {
      setShowTemplatesSelection(false);
      return;
    }
    if (step === 0) return;
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const selectAnswer = (value: string) => {
    if (current) {
      setAnswers((prev) => ({ ...prev, [current.id]: value }));
    }
  };

  const handleApplyTemplateAndContinue = async (templateId: string) => {
    setFinishing(true);
    try {
      sessionStorage.setItem("onboarding:answers", JSON.stringify(answers));
      sessionStorage.setItem("onboarding:recommended", templateId);
    } catch {}

    let targetResumeId = resumeId;

    if (user?.uid) {
      if (resumeId) {
        // Update existing resume
        try {
          await ResumeService.updateResume(resumeId, user.uid, {
            templateId,
            questionnaireCompleted: true,
            questionnaireAnswers: answers,
          });
        } catch (err) {
          console.warn("Failed to update resume questionnaire:", err);
        }
      } else {
        // Create new resume in Firestore for authenticated user
        try {
          const created = await ResumeService.createResume(user.uid, {
            templateId,
            title: `${answers["industry"] ? answers["industry"].charAt(0).toUpperCase() + answers["industry"].slice(1) : "Professional"} Resume`,
            questionnaireCompleted: true,
            questionnaireAnswers: answers,
          });
          targetResumeId = created.id;
        } catch (err) {
          console.warn("Failed to create resume in Firestore:", err);
        }
      }
    }

    setTimeout(() => {
      void navigate({
        to: "/builder",
        search: stripUndefined({
          resumeId: targetResumeId,
          template: templateId,
          fromOnboarding: "1",
        }),
      });
    }, 400);
  };

  const recommendedList = getRecommendedTemplates(answers);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      {/* Brand Header */}
      <div className="mb-8 flex items-center gap-2 font-display text-base font-semibold">
        <span className="flex size-8 items-center justify-center rounded-xl bg-[image:var(--gradient-emerald)] text-primary-foreground shadow-[var(--shadow-glow)]">
          <Sparkles className="size-4" aria-hidden="true" />
        </span>
        PeasiProfile
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xl mb-8">
        <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
          <span>
            {showTemplatesSelection
              ? "Step 5 of 5: Select Template"
              : `Step ${step + 1} of ${total + 1}`}
          </span>
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

      {/* Questionnaire or Template Selection */}
      {!showTemplatesSelection && current ? (
        <div className="relative w-full max-w-xl overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ x: direction > 0 ? 50 : -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? -50 : 50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
            >
              <div className="mb-6 text-center">
                <h1 className="font-display text-2xl font-semibold leading-tight sm:text-3xl">
                  {current.question}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">{current.subtitle}</p>
              </div>

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

          <div className="mt-8 flex w-full items-center justify-between gap-4">
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
              disabled={!canProceed}
              onClick={goNext}
              className="gap-2 bg-[image:var(--gradient-emerald)] text-primary-foreground font-semibold shadow-[var(--shadow-glow)] hover:brightness-110 hover:-translate-y-0.5 transition-all"
            >
              Continue
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        /* Recommended Templates Step */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl"
        >
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
              <Sparkles className="size-3.5" />
              Tailored to your background
            </div>
            <h1 className="font-display text-2xl font-semibold leading-tight sm:text-3xl">
              Templates recommended for you
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Based on your answers, these templates will best highlight your strengths.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(showAllTemplates ? TEMPLATES : recommendedList).map((tpl) => {
              const isRecommended = recommendedList.some((r) => r.id === tpl.id);
              const reason = "reason" in tpl ? (tpl as { reason?: string }).reason : undefined;
              const isSelected = selectedTemplateId === tpl.id;

              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={cn(
                    "group relative flex flex-col rounded-2xl border p-4 transition-all duration-200 cursor-pointer text-left",
                    isSelected
                      ? "border-primary bg-[color-mix(in_oklab,var(--primary)_10%,var(--card))] shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_20%,transparent)]"
                      : "border-border bg-card hover:border-primary/50 hover:-translate-y-1",
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{tpl.name}</span>
                      <span className="text-[11px] text-muted-foreground">{tpl.category}</span>
                    </div>
                    {isSelected ? (
                      <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3.5" />
                      </span>
                    ) : isRecommended ? (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-gold bg-gold/10 px-2 py-0.5 rounded-full">
                        <Award className="size-3" /> Top Pick
                      </span>
                    ) : null}
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
                    {tpl.description}
                  </p>

                  {reason && (
                    <div className="rounded-lg bg-secondary/50 p-2 text-[11px] text-muted-foreground mb-3">
                      💡 {reason}
                    </div>
                  )}

                  <Button
                    size="sm"
                    variant={isSelected ? "hero" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleApplyTemplateAndContinue(tpl.id);
                    }}
                    disabled={finishing}
                    className="w-full text-xs gap-1.5"
                  >
                    {finishing && selectedTemplateId === tpl.id ? (
                      "Opening Editor…"
                    ) : (
                      <>
                        Use This Template <ArrowRight className="size-3" />
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Switch between Recommended and All Templates */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="gap-1.5 text-xs text-muted-foreground"
            >
              <ArrowLeft className="size-3.5" /> Change answers
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllTemplates(!showAllTemplates)}
              className="gap-1.5 text-xs"
            >
              <LayoutGrid className="size-3.5" />
              {showAllTemplates
                ? "Show Recommended Only"
                : `Browse All ${TEMPLATES.length} Templates`}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Direct Skip button */}
      <button
        id="onboarding-skip"
        type="button"
        onClick={() => void handleApplyTemplateAndContinue("modern")}
        className="mt-6 text-xs text-muted-foreground underline-offset-4 hover:underline transition-colors"
      >
        Skip and open default template in editor
      </button>
    </div>
  );
}