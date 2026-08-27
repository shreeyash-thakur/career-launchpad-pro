"use client";
import React, { useState } from "react";
import {
  Sparkles,
  Loader2,
  Copy,
  Check,
  Globe,
  Share2,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type FirestoreResume } from "@/lib/resume-service";
import { optimizeLinkedIn, type LinkedInOptimizationResult } from "@/lib/ai-service";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  resumes: FirestoreResume[];
}

export function LinkedinOptimizerView({ resumes }: Props) {
  const [selectedResumeId, setSelectedResumeId] = useState<string>(resumes[0]?.id ?? "");
  const [targetRole, setTargetRole] = useState("");
  const [currentHeadline, setCurrentHeadline] = useState("");
  const [currentAbout, setCurrentAbout] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<LinkedInOptimizationResult | null>(null);
  const [copiedHeadline, setCopiedHeadline] = useState(false);
  const [copiedAbout, setCopiedAbout] = useState(false);

  const activeResume = resumes.find((r) => r.id === selectedResumeId) || resumes[0];

  async function handleOptimize() {
    if (!activeResume) {
      toast.error("Please create or select a resume first.");
      return;
    }

    setIsOptimizing(true);
    try {
      const opt = await optimizeLinkedIn({
        resumeData: activeResume.resumeData,
        targetRole: targetRole.trim() || activeResume.resumeData.personal.title,
        currentHeadline: currentHeadline.trim(),
        currentAbout: currentAbout.trim(),
      });
      setResult(opt);
      toast.success("LinkedIn profile optimized for recruiter search algorithms!");
    } catch {
      toast.error("Optimization failed. Please try again.");
    } finally {
      setIsOptimizing(false);
    }
  }

  function handleCopy(text: string, type: "headline" | "about") {
    navigator.clipboard.writeText(text);
    if (type === "headline") {
      setCopiedHeadline(true);
      setTimeout(() => setCopiedHeadline(false), 2000);
    } else {
      setCopiedAbout(true);
      setTimeout(() => setCopiedAbout(false), 2000);
    }
    toast.success("Copied to clipboard!");
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1.5">
          <Globe className="size-4" />
          <span>Personal Brand & Recruiter Search Indexing</span>
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight">LinkedIn Profile Optimizer</h1>
        <p className="text-xs text-muted-foreground max-w-xl">
          Transform your LinkedIn presence with high-converting headlines, structured About summaries, and keyword-rich skill recommendations tailored to recruiter search filters.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Input */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-display text-sm font-bold">Profile Parameters</h3>

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
                      {r.title} ({r.resumeData.personal.title || "Resume"})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">Target Role / Industry Focus:</Label>
              <Input
                placeholder="e.g. Senior Product Designer, Cloud Architect"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Current Headline (Optional):</Label>
              <Input
                placeholder="Paste your current LinkedIn headline..."
                value={currentHeadline}
                onChange={(e) => setCurrentHeadline(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Current About Section (Optional):</Label>
              <Textarea
                placeholder="Paste your current About text to improve it..."
                value={currentAbout}
                onChange={(e) => setCurrentAbout(e.target.value)}
                className="h-24 text-xs"
              />
            </div>

            <Button
              onClick={handleOptimize}
              disabled={isOptimizing}
              className="w-full bg-[image:var(--gradient-emerald)] text-primary-foreground font-semibold shadow-[var(--shadow-glow)] gap-2 text-xs"
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" /> Optimizing Profile Copy…
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" /> Optimize LinkedIn Profile
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="space-y-4 animate-in fade-in-50 duration-300">
              {/* Headline Card */}
              <div className="rounded-3xl border border-border bg-card p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-sm font-bold">Optimized Headline</h3>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      {result.headlineCharCount} / 220 chars
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(result.headline, "headline")}
                    className="gap-1.5 text-xs h-7"
                  >
                    {copiedHeadline ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                    {copiedHeadline ? "Copied" : "Copy"}
                  </Button>
                </div>
                <div className="rounded-2xl bg-secondary/50 border border-border/80 p-3.5 text-xs font-semibold text-foreground leading-relaxed">
                  {result.headline}
                </div>
              </div>

              {/* About Section Card */}
              <div className="rounded-3xl border border-border bg-card p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-sm font-bold">Recruiter-Ready About Section</h3>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      {result.aboutCharCount} / 2600 chars
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(result.about, "about")}
                    className="gap-1.5 text-xs h-7"
                  >
                    {copiedAbout ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                    {copiedAbout ? "Copied" : "Copy"}
                  </Button>
                </div>
                <Textarea
                  value={result.about}
                  readOnly
                  className="h-44 text-xs font-serif leading-relaxed p-3 bg-secondary/30 border border-border/80 rounded-2xl resize-none"
                />
              </div>

              {/* Recommended Keywords & Tips */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                  <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5" /> High-Search Skills
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {result.recommendedSkills.map((s) => (
                      <span key={s} className="rounded-md bg-primary/15 text-primary px-2 py-0.5 text-[11px] font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Lightbulb className="size-3.5 text-gold" /> Optimization Tips
                  </h4>
                  <ul className="text-[11px] text-muted-foreground space-y-1 list-disc pl-4">
                    {result.optimizationTips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground flex flex-col items-center justify-center space-y-3 min-h-[380px]">
              <Globe className="size-10 text-muted-foreground/40" />
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-foreground">No Optimization Generated</h3>
                <p className="text-xs max-w-sm">
                  Click <strong>Optimize LinkedIn Profile</strong> to get keyword-dense headlines and recruiter-targeted About sections.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
