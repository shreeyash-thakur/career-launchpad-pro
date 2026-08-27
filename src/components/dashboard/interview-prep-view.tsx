"use client";
import React, { useState } from "react";
import {
  Bot,
  Sparkles,
  Loader2,
  HelpCircle,
  Code2,
  AlertCircle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Trophy,
  Zap,
  Star,
  BookOpen,
  CheckCircle2,
  XCircle,
  Timer,
  Target,
  Brain,
  TrendingUp,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { type FirestoreResume } from "@/lib/resume-service";
import {
  generateEnhancedInterviewPrep,
  type EnhancedInterviewPrepResult,
  type EnhancedInterviewQuestion,
  type QuestionDifficulty,
} from "@/lib/ai-service";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  resumes: FirestoreResume[];
}

const DIFFICULTY_CONFIG = {
  beginner: {
    label: "Beginner",
    icon: BookOpen,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    description: "Confidence-building intro questions",
    emoji: "🟢",
  },
  intermediate: {
    label: "Intermediate",
    icon: Target,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    badge: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
    description: "Role-specific depth & scenarios",
    emoji: "🔵",
  },
  hard: {
    label: "Hard",
    icon: Brain,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    badge: "bg-red-500/15 text-red-700 dark:text-red-300",
    description: "System design, leadership & ownership",
    emoji: "🔴",
  },
  bonus: {
    label: "Bonus",
    icon: Star,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    description: "Curveball, culture & vision questions",
    emoji: "⭐",
  },
} as const;

function QuestionCard({ q, index, isOpen, onToggle }: {
  q: EnhancedInterviewQuestion;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const diff = DIFFICULTY_CONFIG[q.difficulty];
  const Icon = diff.icon;

  return (
    <div className={cn(
      "rounded-2xl border bg-card text-xs transition-all duration-200",
      isOpen ? `${diff.border} shadow-sm` : "border-border",
    )}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-start gap-3 p-4 text-left"
      >
        <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white",
          q.difficulty === "beginner" ? "bg-emerald-500" :
          q.difficulty === "intermediate" ? "bg-blue-500" :
          q.difficulty === "hard" ? "bg-red-500" : "bg-amber-500"
        )}>
          {index + 1}
        </span>
        <div className="flex-1 space-y-1 min-w-0">
          <p className="font-semibold text-foreground leading-snug">{q.question}</p>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-semibold", diff.badge)}>
              {diff.emoji} {diff.label}
            </span>
            <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground capitalize">
              {q.category}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Timer className="size-3" /> {q.timeToAnswer}
            </span>
          </div>
        </div>
        {isOpen ? <ChevronUp className="size-4 shrink-0 text-muted-foreground mt-0.5" /> : <ChevronDown className="size-4 shrink-0 text-muted-foreground mt-0.5" />}
      </button>

      {isOpen && (
        <div className="border-t border-border/60 p-4 space-y-4 animate-in fade-in-50 duration-200">
          {/* Why they ask this */}
          <div className="rounded-xl bg-secondary/40 p-3 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">🎯 Why Interviewers Ask This</p>
            <p className="text-[11px] text-foreground leading-relaxed">{q.context}</p>
          </div>

          {/* Suggested Answer */}
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">💡 Suggested Answer Framework</p>
            <p className="text-[11px] text-foreground leading-relaxed whitespace-pre-line">{q.suggestedAnswer}</p>
          </div>

          {/* Key Points & Red Flags */}
          <div className="grid gap-3 sm:grid-cols-2">
            {q.keyPointsToCover?.length > 0 && (
              <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3 space-y-1.5">
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="size-3" /> Cover These Points
                </p>
                <ul className="space-y-1">
                  {q.keyPointsToCover.map((pt, i) => (
                    <li key={i} className="text-[11px] text-foreground flex items-start gap-1.5">
                      <span className="text-emerald-500 mt-0.5">•</span> {pt}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {q.redFlags?.length > 0 && (
              <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-3 space-y-1.5">
                <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1">
                  <XCircle className="size-3" /> Common Mistakes
                </p>
                <ul className="space-y-1">
                  {q.redFlags.map((rf, i) => (
                    <li key={i} className="text-[11px] text-foreground flex items-start gap-1.5">
                      <span className="text-red-500 mt-0.5">•</span> {rf}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function InterviewPrepView({ resumes }: Props) {
  const [selectedResumeId, setSelectedResumeId] = useState<string>(resumes[0]?.id ?? "");
  const [jobDescription, setJobDescription] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<EnhancedInterviewPrepResult | null>(null);
  const [activeTab, setActiveTab] = useState<QuestionDifficulty>("beginner");
  const [openIndexes, setOpenIndexes] = useState<Record<string, boolean>>({});

  const activeResume = resumes.find((r) => r.id === selectedResumeId) || resumes[0];

  const totalQuestions = result
    ? result.beginner.length + result.intermediate.length + result.hard.length + result.bonus.length
    : 0;

  async function handleGenerate() {
    if (!activeResume && !roleTitle.trim()) {
      toast.error("Please select a resume or enter a role title.");
      return;
    }

    setIsGenerating(true);
    setOpenIndexes({});
    try {
      const prep = await generateEnhancedInterviewPrep({
        resumeData: activeResume?.resumeData!,
        jdText: jobDescription.trim() || undefined,
        roleTitle: roleTitle.trim() || undefined,
      });
      setResult(prep);
      setActiveTab("beginner");
      toast.success(`Generated ${prep.beginner.length + prep.intermediate.length + prep.hard.length + prep.bonus.length} personalized interview questions!`);
    } catch {
      toast.error("Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  function toggleOpen(key: string) {
    setOpenIndexes((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const activeQuestions = result ? result[activeTab] : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1.5">
          <Bot className="size-4" />
          <span>AI Mock Interview Coach · 4-Level Difficulty System</span>
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Interview Preparation Suite</h1>
        <p className="text-xs text-muted-foreground max-w-xl">
          Personalized interview questions across 4 difficulty levels — from confidence-building basics to FAANG-style system design — with STAR answer frameworks, red flag warnings, and hiring manager insights.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Form */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4 sticky top-4">
            <h3 className="font-display text-sm font-bold flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> Setup Interview Kit
            </h3>

            {resumes.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs">Source Resume:</Label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">Target Role <span className="text-muted-foreground">(optional override)</span></Label>
              <Input
                placeholder="e.g. Senior Frontend Engineer"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Job Description</Label>
                <span className="text-[10px] text-muted-foreground rounded-full bg-secondary px-2 py-0.5">Optional</span>
              </div>
              <Textarea
                placeholder="Paste the job description to get highly targeted questions. Leave blank for general role-based questions..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="h-36 text-xs font-mono leading-relaxed"
              />
              <p className="text-[10px] text-muted-foreground">
                💡 Adding a JD generates role-specific technical questions and more accurate behavioral prompts.
              </p>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || (!activeResume && !roleTitle.trim())}
              className="w-full bg-[image:var(--gradient-emerald)] text-primary-foreground font-semibold shadow-[var(--shadow-glow)] gap-2 text-xs"
            >
              {isGenerating ? (
                <><Loader2 className="size-3.5 animate-spin" /> Generating {jobDescription ? "Targeted" : "General"} Questions…</>
              ) : (
                <><Sparkles className="size-3.5" /> Generate Interview Kit</>
              )}
            </Button>

            {/* Difficulty Legend */}
            <div className="pt-3 border-t border-border/60 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Difficulty Levels</p>
              <div className="space-y-1.5">
                {(["beginner", "intermediate", "hard", "bonus"] as QuestionDifficulty[]).map((d) => {
                  const cfg = DIFFICULTY_CONFIG[d];
                  const Icon = cfg.icon;
                  return (
                    <div key={d} className="flex items-center gap-2 text-[11px]">
                      <Icon className={cn("size-3.5", cfg.color)} />
                      <span className="font-semibold text-foreground">{cfg.label}:</span>
                      <span className="text-muted-foreground">{cfg.description}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-8 space-y-4">
          {result ? (
            <div className="space-y-5 animate-in fade-in-50 duration-300">
              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(["beginner", "intermediate", "hard", "bonus"] as QuestionDifficulty[]).map((d) => {
                  const cfg = DIFFICULTY_CONFIG[d];
                  const count = result[d].length;
                  return (
                    <div key={d} className={cn("rounded-2xl border p-3 text-center space-y-1 cursor-pointer transition-all", cfg.border, cfg.bg, activeTab === d ? "ring-2 ring-primary" : "opacity-75 hover:opacity-100")}
                      onClick={() => setActiveTab(d)}>
                      <div className="text-xl font-bold text-foreground">{count}</div>
                      <div className={cn("text-[10px] font-semibold", cfg.color)}>{cfg.emoji} {cfg.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* Role Insights Banner */}
              {result.roleInsights && (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex gap-3">
                  <Brain className="size-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-primary mb-1">Role Intelligence</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{result.roleInsights}</p>
                  </div>
                </div>
              )}

              {/* Difficulty Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-border pb-3">
                {(["beginner", "intermediate", "hard", "bonus"] as QuestionDifficulty[]).map((d) => {
                  const cfg = DIFFICULTY_CONFIG[d];
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setActiveTab(d)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all",
                        activeTab === d
                          ? cn(cfg.bg, cfg.color, "ring-1", cfg.border)
                          : "text-muted-foreground hover:bg-secondary",
                      )}
                    >
                      <Icon className="size-3.5" />
                      {cfg.label}
                      <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px]">{result[d].length}</span>
                    </button>
                  );
                })}
              </div>

              {/* Question List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className={cn("font-display text-sm font-bold flex items-center gap-2", DIFFICULTY_CONFIG[activeTab].color)}>
                    {DIFFICULTY_CONFIG[activeTab].emoji} {DIFFICULTY_CONFIG[activeTab].label} Questions ({activeQuestions.length})
                  </h3>
                  <button
                    type="button"
                    className="text-[11px] text-primary hover:underline"
                    onClick={() => {
                      const allOpen: Record<string, boolean> = {};
                      activeQuestions.forEach((_, i) => { allOpen[`${activeTab}-${i}`] = true; });
                      setOpenIndexes(prev => ({ ...prev, ...allOpen }));
                    }}
                  >
                    Expand all
                  </button>
                </div>

                {activeQuestions.length > 0 ? (
                  activeQuestions.map((q, idx) => (
                    <QuestionCard
                      key={`${activeTab}-${idx}`}
                      q={q}
                      index={idx}
                      isOpen={!!openIndexes[`${activeTab}-${idx}`]}
                      onToggle={() => toggleOpen(`${activeTab}-${idx}`)}
                    />
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground text-xs">
                    No questions in this category.
                  </div>
                )}
              </div>

              {/* Overall Tips */}
              {result.overallTips.length > 0 && (
                <div className="rounded-3xl border border-border bg-card p-5 space-y-3">
                  <h4 className="font-display text-sm font-bold flex items-center gap-2">
                    <TrendingUp className="size-4 text-primary" /> Expert Interview Tips
                  </h4>
                  <div className="space-y-2">
                    {result.overallTips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-[11px] text-foreground">
                        <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[9px] font-bold mt-0.5">{i + 1}</span>
                        <span className="leading-relaxed">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border p-16 text-center text-muted-foreground flex flex-col items-center justify-center space-y-4 min-h-[500px]">
              <div className="flex items-center gap-2 text-4xl">🟢🔵🔴⭐</div>
              <div className="space-y-1.5">
                <h3 className="font-semibold text-base text-foreground">No Interview Kit Generated Yet</h3>
                <p className="text-xs max-w-sm">
                  Select your resume, optionally paste a job description, and click <strong>Generate Interview Kit</strong> to get{" "}
                  <strong>15 categorized questions</strong> across Beginner, Intermediate, Hard, and Bonus difficulty levels.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] max-w-xs">
                {(["beginner", "intermediate", "hard", "bonus"] as QuestionDifficulty[]).map((d) => {
                  const cfg = DIFFICULTY_CONFIG[d];
                  const Icon = cfg.icon;
                  return (
                    <div key={d} className={cn("flex items-center gap-1.5 rounded-xl border p-2", cfg.border, cfg.bg)}>
                      <Icon className={cn("size-3.5", cfg.color)} />
                      <span className={cn("font-semibold", cfg.color)}>{cfg.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
