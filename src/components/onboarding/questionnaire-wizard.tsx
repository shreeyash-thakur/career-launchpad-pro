"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Plus,
  Trash2,
  Loader2,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Award,
  User,
  Target,
  FileCheck2,
  Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { markQuestionnaireCompleted, type QuestionnaireAnswers } from "@/lib/resume-service";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Option {
  value: string;
  label: string;
  icon?: string;
}

interface StepMeta {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

// ─── Step metadata ──────────────────────────────────────────────────────────

const STEPS: StepMeta[] = [
  { id: "career", title: "Career Goal", subtitle: "Tell us what you're building this resume for.", icon: <Target className="size-4" /> },
  { id: "personal", title: "Personal Information", subtitle: "How can recruiters reach you?", icon: <User className="size-4" /> },
  { id: "education", title: "Education", subtitle: "Your academic background.", icon: <GraduationCap className="size-4" /> },
  { id: "experience", title: "Experience", subtitle: "Your work history.", icon: <Briefcase className="size-4" /> },
  { id: "skills", title: "Skills", subtitle: "What you're great at.", icon: <Wrench className="size-4" /> },
  { id: "projects", title: "Projects", subtitle: "Things you've built.", icon: <FolderGit2 className="size-4" /> },
  { id: "certifications", title: "Certifications", subtitle: "Credentials that back you up.", icon: <FileCheck2 className="size-4" /> },
  { id: "achievements", title: "Achievements", subtitle: "Awards, hackathons, scholarships.", icon: <Award className="size-4" /> },
  { id: "additional", title: "Additional Information", subtitle: "Optional extras to stand out.", icon: <Languages className="size-4" /> },
];

const CAREER_GOALS: Option[] = [
  { value: "internship", label: "Internship", icon: "🌟" },
  { value: "first-job", label: "First Job", icon: "🌱" },
  { value: "experienced", label: "Experienced Job", icon: "💼" },
  { value: "career-change", label: "Career Change", icon: "🔄" },
  { value: "college", label: "College / University", icon: "🎓" },
];

const INDUSTRIES: Option[] = [
  { value: "tech", label: "Technology / Engineering", icon: "💻" },
  { value: "finance", label: "Finance / Accounting", icon: "📊" },
  { value: "marketing", label: "Marketing / Design", icon: "🎨" },
  { value: "healthcare", label: "Healthcare / Medical", icon: "🏥" },
  { value: "education", label: "Education / Research", icon: "📚" },
  { value: "other", label: "Other / General", icon: "✨" },
];

// ─── Form state types ───────────────────────────────────────────────────────

interface EducationEntry {
  degree: string;
  school: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

interface ExperienceEntry {
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string;
}

interface ProjectEntry {
  name: string;
  description: string;
  technologies: string;
  url: string;
  githubUrl: string;
}

interface CertificationEntry {
  name: string;
  issuer: string;
  date: string;
  url: string;
}

interface WizardState {
  careerGoal: string;
  targetRole: string;
  targetIndustry: string;
  personal: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    portfolio: string;
  };
  education: EducationEntry[];
  hasExperience: boolean;
  experience: ExperienceEntry[];
  skills: {
    technical: string;
    soft: string;
    tools: string;
    languages: string;
  };
  projects: ProjectEntry[];
  certifications: CertificationEntry[];
  achievements: string;
  additional: {
    languages: string;
    volunteer: string;
    publications: string;
    extracurricular: string;
    interests: string;
  };
}

const initialState: WizardState = {
  careerGoal: "",
  targetRole: "",
  targetIndustry: "",
  personal: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
  },
  education: [{ degree: "", school: "", field: "", startDate: "", endDate: "", gpa: "" }],
  hasExperience: true,
  experience: [{ company: "", position: "", location: "", startDate: "", endDate: "", current: false, bullets: "" }],
  skills: { technical: "", soft: "", tools: "", languages: "" },
  projects: [{ name: "", description: "", technologies: "", url: "", githubUrl: "" }],
  certifications: [{ name: "", issuer: "", date: "", url: "" }],
  achievements: "",
  additional: { languages: "", volunteer: "", publications: "", extracurricular: "", interests: "" },
};

// ─── Helper components ──────────────────────────────────────────────────────

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
      {selected && <CheckCircle2 className="ml-auto size-4 shrink-0 text-primary" aria-hidden="true" />}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="rounded-xl"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="rounded-xl"
      />
    </div>
  );
}

// ─── Main Wizard ────────────────────────────────────────────────────────────

export function QuestionnaireWizard({ resumeId }: { resumeId: string }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [state, setState] = useState<WizardState>(initialState);
  const [saving, setSaving] = useState(false);

  const current = STEPS[step]!;
  const total = STEPS.length;
  const progress = ((step + 1) / total) * 100;

  const update = <K extends keyof WizardState>(key: K, value: WizardState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const updatePersonal = (key: keyof WizardState["personal"], value: string) => {
    setState((prev) => ({ ...prev, personal: { ...prev.personal, [key]: value } }));
  };

  const updateEducation = (index: number, key: keyof EducationEntry, value: string) => {
    setState((prev) => {
      const education = prev.education.map((e, i) => (i === index ? { ...e, [key]: value } : e));
      return { ...prev, education };
    });
  };

  const updateExperience = (index: number, key: keyof ExperienceEntry, value: string | boolean) => {
    setState((prev) => {
      const experience = prev.experience.map((e, i) => (i === index ? { ...e, [key]: value } : e));
      return { ...prev, experience };
    });
  };

  const updateSkills = (key: keyof WizardState["skills"], value: string) => {
    setState((prev) => ({ ...prev, skills: { ...prev.skills, [key]: value } }));
  };

  const updateProject = (index: number, key: keyof ProjectEntry, value: string) => {
    setState((prev) => {
      const projects = prev.projects.map((p, i) => (i === index ? { ...p, [key]: value } : p));
      return { ...prev, projects };
    });
  };

  const updateCertification = (index: number, key: keyof CertificationEntry, value: string) => {
    setState((prev) => {
      const certifications = prev.certifications.map((c, i) => (i === index ? { ...c, [key]: value } : c));
      return { ...prev, certifications };
    });
  };

  const updateAdditional = (key: keyof WizardState["additional"], value: string) => {
    setState((prev) => ({ ...prev, additional: { ...prev.additional, [key]: value } }));
  };

  const canProceed = () => {
    switch (current.id) {
      case "career":
        return Boolean(state.careerGoal);
      case "personal":
        return Boolean(state.personal.fullName && state.personal.email);
      case "education":
        return state.education.some((e) => e.degree || e.school);
      case "experience":
        return !state.hasExperience || state.experience.some((e) => e.company || e.position);
      case "skills":
        return Boolean(state.skills.technical || state.skills.soft || state.skills.tools || state.skills.languages);
      case "projects":
        return state.projects.some((p) => p.name);
      case "certifications":
        return state.certifications.some((c) => c.name);
      case "achievements":
        return true;
      case "additional":
        return true;
      default:
        return true;
    }
  };

  const buildAnswers = (): QuestionnaireAnswers => {
    return {
      careerGoal: state.careerGoal,
      targetRole: state.targetRole,
      targetIndustry: state.targetIndustry,
      personal: {
        fullName: state.personal.fullName,
        email: state.personal.email,
        phone: state.personal.phone,
        location: state.personal.location,
        linkedin: state.personal.linkedin,
        github: state.personal.github,
        portfolio: state.personal.portfolio,
      },
      education: state.education
        .filter((e) => e.degree || e.school)
        .map((e) => ({
          degree: e.degree,
          school: e.school,
          field: e.field,
          startDate: e.startDate,
          endDate: e.endDate,
          gpa: e.gpa,
        })),
      hasExperience: state.hasExperience,
      experience: state.hasExperience
        ? state.experience
            .filter((e) => e.company || e.position)
            .map((e) => ({
              company: e.company,
              position: e.position,
              location: e.location,
              startDate: e.startDate,
              endDate: e.endDate,
              current: e.current,
              bullets: e.bullets
                .split("\n")
                .map((b) => b.trim())
                .filter(Boolean),
            }))
        : [],
      skills: {
        technical: state.skills.technical.split(",").map((s) => s.trim()).filter(Boolean),
        soft: state.skills.soft.split(",").map((s) => s.trim()).filter(Boolean),
        tools: state.skills.tools.split(",").map((s) => s.trim()).filter(Boolean),
        languages: state.skills.languages.split(",").map((s) => s.trim()).filter(Boolean),
      },
      projects: state.projects
        .filter((p) => p.name)
        .map((p) => ({
          name: p.name,
          description: p.description,
          technologies: p.technologies.split(",").map((t) => t.trim()).filter(Boolean),
          url: p.url,
          githubUrl: p.githubUrl,
        })),
      certifications: state.certifications
        .filter((c) => c.name)
        .map((c) => ({ name: c.name, issuer: c.issuer, date: c.date, url: c.url })),
      achievements: state.achievements
        .split("\n")
        .map((a) => a.trim())
        .filter(Boolean),
      additional: {
        languages: state.additional.languages
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean)
          .map((name) => ({ name, level: "" })),
        volunteer: state.additional.volunteer,
        publications: state.additional.publications,
        extracurricular: state.additional.extracurricular,
        interests: state.additional.interests,
      },
    };
  };

  const goNext = async () => {
    if (!canProceed()) return;
    if (step < total - 1) {
      setDirection(1);
      setStep((s) => s + 1);
      return;
    }

    // Final step — save to Firestore, then navigate to template selection
    if (!user) {
      toast.error("You must be logged in to save your resume.");
      return;
    }

    setSaving(true);
    try {
      const answers = buildAnswers();
      await markQuestionnaireCompleted(resumeId, user.uid, answers);
      toast.success("Questionnaire saved!");
      void navigate({ to: "/resumes/$resumeId/template", params: { resumeId } });
    } catch (error) {
      console.error("Failed to save questionnaire:", error);
      toast.error("Couldn't save your answers. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    if (step === 0) return;
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      {/* Brand */}
      <div className="mb-8 flex items-center gap-2 font-display text-base font-semibold">
        <span className="flex size-8 items-center justify-center rounded-xl bg-[image:var(--gradient-emerald)] text-primary-foreground">
          <Sparkles className="size-4" aria-hidden="true" />
        </span>
        CareerGPT
      </div>

      {/* Progress */}
      <div className="mb-8 w-full max-w-2xl">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            {current.icon}
            {current.title}
          </span>
          <span>
            Step {step + 1} of {total} · {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="h-full rounded-full bg-[image:var(--gradient-emerald)]"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="relative w-full max-w-2xl overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            className="space-y-6"
          >
            {/* Step header */}
            <div className="text-center">
              <h1 className="font-display text-2xl font-semibold leading-tight sm:text-3xl">
                {current.title}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">{current.subtitle}</p>
            </div>

            {/* ── CAREER GOAL ── */}
            {current.id === "career" && (
              <div className="space-y-6">
                <div>
                  <Label className="mb-2 block text-sm font-medium">
                    What are you creating this resume for?
                  </Label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {CAREER_GOALS.map((option) => (
                      <OptionCard
                        key={option.value}
                        option={option}
                        selected={state.careerGoal === option.value}
                        onSelect={() => update("careerGoal", option.value)}
                      />
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Target job / role"
                    value={state.targetRole}
                    onChange={(v) => update("targetRole", v)}
                    placeholder="e.g. Frontend Developer"
                  />
                  <div>
                    <Label className="mb-2 block text-sm font-medium">Target industry</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {INDUSTRIES.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => update("targetIndustry", option.value)}
                          className={cn(
                            "rounded-xl border px-3 py-2 text-left text-xs transition-all",
                            state.targetIndustry === option.value
                              ? "border-primary/70 bg-[color-mix(in_oklab,var(--primary)_10%,var(--card))]"
                              : "border-border bg-card/60 hover:border-primary/50",
                          )}
                        >
                          <span className="mr-1">{option.icon}</span>
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── PERSONAL ── */}
            {current.id === "personal" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Full name *"
                  value={state.personal.fullName}
                  onChange={(v) => updatePersonal("fullName", v)}
                  placeholder="Jordan Alvarez"
                  required
                />
                <Field
                  label="Email *"
                  type="email"
                  value={state.personal.email}
                  onChange={(v) => updatePersonal("email", v)}
                  placeholder="you@example.com"
                  required
                />
                <Field
                  label="Phone"
                  value={state.personal.phone}
                  onChange={(v) => updatePersonal("phone", v)}
                  placeholder="+1 555 000 1234"
                />
                <Field
                  label="Location"
                  value={state.personal.location}
                  onChange={(v) => updatePersonal("location", v)}
                  placeholder="City, Country"
                />
                <Field
                  label="LinkedIn"
                  value={state.personal.linkedin}
                  onChange={(v) => updatePersonal("linkedin", v)}
                  placeholder="linkedin.com/in/username"
                />
                <Field
                  label="GitHub"
                  value={state.personal.github}
                  onChange={(v) => updatePersonal("github", v)}
                  placeholder="github.com/username"
                />
                <Field
                  label="Portfolio"
                  value={state.personal.portfolio}
                  onChange={(v) => updatePersonal("portfolio", v)}
                  placeholder="yourportfolio.com"
                />
              </div>
            )}

            {/* ── EDUCATION ── */}
            {current.id === "education" && (
              <div className="space-y-4">
                {state.education.map((edu, i) => (
                  <div key={i} className="space-y-3 rounded-2xl border border-border bg-card/60 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Education {i + 1}
                      </span>
                      {state.education.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setState((prev) => ({
                              ...prev,
                              education: prev.education.filter((_, idx) => idx !== i),
                            }))
                          }
                          className="text-muted-foreground hover:text-destructive"
                          aria-label="Remove education"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field
                        label="Degree"
                        value={edu.degree}
                        onChange={(v) => updateEducation(i, "degree", v)}
                        placeholder="B.Tech in Computer Science"
                      />
                      <Field
                        label="College / University"
                        value={edu.school}
                        onChange={(v) => updateEducation(i, "school", v)}
                        placeholder="University name"
                      />
                      <Field
                        label="Field of study"
                        value={edu.field}
                        onChange={(v) => updateEducation(i, "field", v)}
                        placeholder="Computer Science"
                      />
                      <Field
                        label="CGPA / Percentage"
                        value={edu.gpa}
                        onChange={(v) => updateEducation(i, "gpa", v)}
                        placeholder="8.5 / 10"
                      />
                      <Field
                        label="Start date"
                        type="month"
                        value={edu.startDate}
                        onChange={(v) => updateEducation(i, "startDate", v)}
                      />
                      <Field
                        label="Graduation date"
                        type="month"
                        value={edu.endDate}
                        onChange={(v) => updateEducation(i, "endDate", v)}
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      education: [
                        ...prev.education,
                        { degree: "", school: "", field: "", startDate: "", endDate: "", gpa: "" },
                      ],
                    }))
                  }
                >
                  <Plus className="size-3.5" /> Add education
                </Button>
              </div>
            )}

            {/* ── EXPERIENCE ── */}
            {current.id === "experience" && (
              <div className="space-y-4">
                <label className="flex select-none items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={!state.hasExperience}
                    onChange={(e) => update("hasExperience", !e.target.checked)}
                    className="size-4 rounded border-input accent-[var(--primary)]"
                  />
                  I don't have work experience
                </label>

                {state.hasExperience && (
                  <>
                    {state.experience.map((exp, i) => (
                      <div key={i} className="space-y-3 rounded-2xl border border-border bg-card/60 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted-foreground">
                            Experience {i + 1}
                          </span>
                          {state.experience.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setState((prev) => ({
                                  ...prev,
                                  experience: prev.experience.filter((_, idx) => idx !== i),
                                }))
                              }
                              className="text-muted-foreground hover:text-destructive"
                              aria-label="Remove experience"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          )}
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field
                            label="Company"
                            value={exp.company}
                            onChange={(v) => updateExperience(i, "company", v)}
                            placeholder="Company name"
                          />
                          <Field
                            label="Position"
                            value={exp.position}
                            onChange={(v) => updateExperience(i, "position", v)}
                            placeholder="Software Engineer"
                          />
                          <Field
                            label="Location"
                            value={exp.location}
                            onChange={(v) => updateExperience(i, "location", v)}
                            placeholder="City, Country"
                          />
                          <div className="flex items-end pb-1">
                            <label className="flex select-none items-center gap-2 text-sm text-muted-foreground">
                              <input
                                type="checkbox"
                                checked={exp.current}
                                onChange={(e) => updateExperience(i, "current", e.target.checked)}
                                className="size-4 rounded border-input accent-[var(--primary)]"
                              />
                              I currently work here
                            </label>
                          </div>
                          <Field
                            label="Start date"
                            type="month"
                            value={exp.startDate}
                            onChange={(v) => updateExperience(i, "startDate", v)}
                          />
                          <Field
                            label="End date"
                            type="month"
                            value={exp.endDate}
                            onChange={(v) => updateExperience(i, "endDate", v)}
                          />
                        </div>
                        <TextAreaField
                          label="Responsibilities / achievements (one per line)"
                          value={exp.bullets}
                          onChange={(v) => updateExperience(i, "bullets", v)}
                          placeholder={"Led the redesign of the onboarding flow...\nImproved page load time by 40%..."}
                          rows={4}
                        />
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          experience: [
                            ...prev.experience,
                            { company: "", position: "", location: "", startDate: "", endDate: "", current: false, bullets: "" },
                          ],
                        }))
                      }
                    >
                      <Plus className="size-3.5" /> Add experience
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* ── SKILLS ── */}
            {current.id === "skills" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Technical skills (comma separated)"
                  value={state.skills.technical}
                  onChange={(v) => updateSkills("technical", v)}
                  placeholder="React, TypeScript, Node.js"
                />
                <Field
                  label="Soft skills (comma separated)"
                  value={state.skills.soft}
                  onChange={(v) => updateSkills("soft", v)}
                  placeholder="Leadership, Communication, Problem-solving"
                />
                <Field
                  label="Tools (comma separated)"
                  value={state.skills.tools}
                  onChange={(v) => updateSkills("tools", v)}
                  placeholder="Figma, Git, Jira"
                />
                <Field
                  label="Programming languages (comma separated)"
                  value={state.skills.languages}
                  onChange={(v) => updateSkills("languages", v)}
                  placeholder="JavaScript, Python, Java"
                />
              </div>
            )}

            {/* ── PROJECTS ── */}
            {current.id === "projects" && (
              <div className="space-y-4">
                {state.projects.map((proj, i) => (
                  <div key={i} className="space-y-3 rounded-2xl border border-border bg-card/60 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Project {i + 1}
                      </span>
                      {state.projects.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setState((prev) => ({
                              ...prev,
                              projects: prev.projects.filter((_, idx) => idx !== i),
                            }))
                          }
                          className="text-muted-foreground hover:text-destructive"
                          aria-label="Remove project"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field
                        label="Project name"
                        value={proj.name}
                        onChange={(v) => updateProject(i, "name", v)}
                        placeholder="E-commerce Platform"
                      />
                      <Field
                        label="Technologies (comma separated)"
                        value={proj.technologies}
                        onChange={(v) => updateProject(i, "technologies", v)}
                        placeholder="React, Node.js, MongoDB"
                      />
                      <Field
                        label="Project URL"
                        value={proj.url}
                        onChange={(v) => updateProject(i, "url", v)}
                        placeholder="https://..."
                      />
                      <Field
                        label="GitHub URL"
                        value={proj.githubUrl}
                        onChange={(v) => updateProject(i, "githubUrl", v)}
                        placeholder="https://github.com/..."
                      />
                    </div>
                    <TextAreaField
                      label="Description"
                      value={proj.description}
                      onChange={(v) => updateProject(i, "description", v)}
                      placeholder="What did you build and what was the impact?"
                      rows={3}
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      projects: [
                        ...prev.projects,
                        { name: "", description: "", technologies: "", url: "", githubUrl: "" },
                      ],
                    }))
                  }
                >
                  <Plus className="size-3.5" /> Add project
                </Button>
              </div>
            )}

            {/* ── CERTIFICATIONS ── */}
            {current.id === "certifications" && (
              <div className="space-y-4">
                {state.certifications.map((cert, i) => (
                  <div key={i} className="space-y-3 rounded-2xl border border-border bg-card/60 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Certification {i + 1}
                      </span>
                      {state.certifications.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setState((prev) => ({
                              ...prev,
                              certifications: prev.certifications.filter((_, idx) => idx !== i),
                            }))
                          }
                          className="text-muted-foreground hover:text-destructive"
                          aria-label="Remove certification"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field
                        label="Certificate"
                        value={cert.name}
                        onChange={(v) => updateCertification(i, "name", v)}
                        placeholder="AWS Certified Developer"
                      />
                      <Field
                        label="Issuing organization"
                        value={cert.issuer}
                        onChange={(v) => updateCertification(i, "issuer", v)}
                        placeholder="Amazon Web Services"
                      />
                      <Field
                        label="Date"
                        type="month"
                        value={cert.date}
                        onChange={(v) => updateCertification(i, "date", v)}
                      />
                      <Field
                        label="Credential URL"
                        value={cert.url}
                        onChange={(v) => updateCertification(i, "url", v)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      certifications: [
                        ...prev.certifications,
                        { name: "", issuer: "", date: "", url: "" },
                      ],
                    }))
                  }
                >
                  <Plus className="size-3.5" /> Add certification
                </Button>
              </div>
            )}

            {/* ── ACHIEVEMENTS ── */}
            {current.id === "achievements" && (
              <TextAreaField
                label="Achievements (one per line)"
                value={state.achievements}
                onChange={(v) => update("achievements", v)}
                placeholder={"Winner — Hackathon 2024\nDean's List 2023\nNational Scholarship"}
                rows={6}
              />
            )}

            {/* ── ADDITIONAL (OPTIONAL) ── */}
            {current.id === "additional" && (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  All fields are optional. Skip anything that doesn't apply.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Languages (comma separated)"
                    value={state.additional.languages}
                    onChange={(v) => updateAdditional("languages", v)}
                    placeholder="English, Hindi, Spanish"
                  />
                  <Field
                    label="Volunteer experience"
                    value={state.additional.volunteer}
                    onChange={(v) => updateAdditional("volunteer", v)}
                    placeholder="e.g. NGO tutor, 2023"
                  />
                  <Field
                    label="Publications"
                    value={state.additional.publications}
                    onChange={(v) => updateAdditional("publications", v)}
                    placeholder="e.g. Research paper title"
                  />
                  <Field
                    label="Extracurricular activities"
                    value={state.additional.extracurricular}
                    onChange={(v) => updateAdditional("extracurricular", v)}
                    placeholder="e.g. Debate club president"
                  />
                  <Field
                    label="Interests"
                    value={state.additional.interests}
                    onChange={(v) => updateAdditional("interests", v)}
                    placeholder="e.g. Photography, hiking"
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex w-full max-w-2xl items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="default"
          onClick={goBack}
          disabled={step === 0 || saving}
          className="gap-2"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>

        <Button
          disabled={!canProceed() || saving}
          onClick={() => void goNext()}
          className="gap-2 bg-[image:var(--gradient-emerald)] text-primary-foreground font-semibold shadow-[var(--shadow-glow)] hover:brightness-110 hover:-translate-y-0.5 transition-all"
        >
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving…
            </>
          ) : step < total - 1 ? (
            <>
              Continue
              <ArrowRight className="size-4" />
            </>
          ) : (
            <>
              Choose template
              <Sparkles className="size-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}