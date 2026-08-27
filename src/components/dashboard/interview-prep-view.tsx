"use client";
import React, { useState } from "react";
import {
  Bot,
  Sparkles,
  Loader2,
  CheckCircle2,
  HelpCircle,
  Code2,
  AlertCircle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { type FirestoreResume } from "@/lib/resume-service";
import { generateInterviewPrep, type InterviewPrepResult } from "@/lib/ai-service";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  resumes: FirestoreResume[];
}

export function InterviewPrepView({ resumes }: Props) {
  const [selectedResumeId, setSelectedResumeId] = useState<string>(resumes[0]?.id ?? "");
  const [jobDescription, setJobDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<InterviewPrepResult | null>(null);
  const [openIndexes, setOpenIndexes] = useState<Record<string, boolean>>({ "behavioral-0": true, "technical-0": true });

  const activeResume = resumes.find((r) => r.id === selectedResumeId) || resumes[0];

  async function handleGenerate() {
    if (!activeResume) {
      toast.error("Please create or select a resume first.");
      return;
    }
    if (!jobDescription.trim()) {
      toast.error("Please paste the target job description.");
      return;
    }

    setIsGenerating(true);
    try {
      const prep = await generateInterviewPrep({
        resumeData: activeResume.resumeData,
        jdText: jobDescription,
      });
      setResult(prep);
      toast.success("Generated role-specific mock interview questions and STAR frameworks!");
    } catch {
      toast.error("Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  function toggleOpen(key: string) {
    setOpenIndexes((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1.5">
          <Bot className="size-4" />
          <span>Hiring Manager Question Predictor & STAR Framework</span>
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight">AI Mock Interview Coach</h1>
        <p className="text-xs text-muted-foreground max-w-xl">
          Anticipate behavioral, role-specific technical, and curveball interview questions with structured STAR (Situation, Task, Action, Result) answering guidelines.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-display text-sm font-bold">Interview Context</h3>

            {resumes.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs">Select Source Resume:</Label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Target Job Description:</Label>
              <Textarea
                placeholder="Paste the target job requirements, skills, and company background..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="h-44 text-xs font-mono leading-relaxed"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !jobDescription.trim()}
              className="w-full bg-[image:var(--gradient-emerald)] text-primary-foreground font-semibold shadow-[var(--shadow-glow)] gap-2 text-xs"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" /> Generating Interview Pack…
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" /> Predict Interview Questions
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              {/* Behavioral Questions */}
              {result.behavioral.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-display text-sm font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <HelpCircle className="size-4" /> Behavioral & Leadership (STAR Method)
                  </h3>
                  <div className="space-y-2.5">
                    {result.behavioral.map((q, idx) => {
                      const key = `behavioral-${idx}`;
                      const isOpen = openIndexes[key];
                      return (
                        <div key={idx} className="rounded-2xl border border-border bg-card p-4 text-xs space-y-2">
                          <button
                            type="button"
                            onClick={() => toggleOpen(key)}
                            className="w-full flex items-center justify-between gap-2 text-left font-semibold text-foreground"
                          >
                            <span>{idx + 1}. {q.question}</span>
                            {isOpen ? <ChevronUp className="size-4 shrink-0" /> : <ChevronDown className="size-4 shrink-0" />}
                          </button>
                          {isOpen && (
                            <div className="space-y-2 pt-2 border-t border-border/60">
                              <p className="text-[11px] text-muted-foreground font-medium">
                                🎯 <strong>Hiring Manager Intent:</strong> {q.context}
                              </p>
                              <div className="rounded-xl bg-secondary/50 p-3 text-[11px] text-foreground leading-relaxed whitespace-pre-line font-mono">
                                {q.suggestedAnswer}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Technical Questions */}
              {result.technical.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-display text-sm font-bold flex items-center gap-2 text-primary">
                    <Code2 className="size-4" /> Role-Specific Technical Scenarios
                  </h3>
                  <div className="space-y-2.5">
                    {result.technical.map((q, idx) => {
                      const key = `technical-${idx}`;
                      const isOpen = openIndexes[key];
                      return (
                        <div key={idx} className="rounded-2xl border border-border bg-card p-4 text-xs space-y-2">
                          <button
                            type="button"
                            onClick={() => toggleOpen(key)}
                            className="w-full flex items-center justify-between gap-2 text-left font-semibold text-foreground"
                          >
                            <span>{idx + 1}. {q.question}</span>
                            {isOpen ? <ChevronUp className="size-4 shrink-0" /> : <ChevronDown className="size-4 shrink-0" />}
                          </button>
                          {isOpen && (
                            <div className="space-y-2 pt-2 border-t border-border/60">
                              <p className="text-[11px] text-muted-foreground font-medium">
                                💡 <strong>Core Concept:</strong> {q.context}
                              </p>
                              <div className="rounded-xl bg-secondary/50 p-3 text-[11px] text-foreground leading-relaxed whitespace-pre-line">
                                {q.suggestedAnswer}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tricky Questions */}
              {result.tricky.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-display text-sm font-bold flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <AlertCircle className="size-4" /> Curveball & Situational Questions
                  </h3>
                  <div className="space-y-2.5">
                    {result.tricky.map((q, idx) => {
                      const key = `tricky-${idx}`;
                      const isOpen = openIndexes[key];
                      return (
                        <div key={idx} className="rounded-2xl border border-border bg-card p-4 text-xs space-y-2">
                          <button
                            type="button"
                            onClick={() => toggleOpen(key)}
                            className="w-full flex items-center justify-between gap-2 text-left font-semibold text-foreground"
                          >
                            <span>{idx + 1}. {q.question}</span>
                            {isOpen ? <ChevronUp className="size-4 shrink-0" /> : <ChevronDown className="size-4 shrink-0" />}
                          </button>
                          {isOpen && (
                            <div className="space-y-2 pt-2 border-t border-border/60">
                              <p className="text-[11px] text-muted-foreground font-medium">
                                ⚠️ <strong>Strategy:</strong> {q.context}
                              </p>
                              <div className="rounded-xl bg-secondary/50 p-3 text-[11px] text-foreground leading-relaxed whitespace-pre-line">
                                {q.suggestedAnswer}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground flex flex-col items-center justify-center space-y-3 min-h-[380px]">
              <Bot className="size-10 text-muted-foreground/40" />
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-foreground">No Interview Kit Generated</h3>
                <p className="text-xs max-w-sm">
                  Paste the Job Description to generate targeted STAR answer frameworks and technical interview strategies.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
