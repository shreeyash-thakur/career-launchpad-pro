"use client";
import React, { useState } from "react";
import {
  FileText,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Download,
  Send,
  Building2,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type FirestoreResume } from "@/lib/resume-service";
import { generateCoverLetter } from "@/lib/ai-service";
import { toast } from "sonner";

interface Props {
  resumes: FirestoreResume[];
}

export function CoverLetterView({ resumes }: Props) {
  const [selectedResumeId, setSelectedResumeId] = useState<string>(resumes[0]?.id ?? "");
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState<"professional" | "enthusiastic" | "concise" | "executive">("professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [copied, setCopied] = useState(false);

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
      const letter = await generateCoverLetter({
        resumeData: activeResume.resumeData,
        jobDescription,
        companyName: companyName.trim() || undefined,
        roleTitle: roleTitle.trim() || undefined,
        tone,
      });
      setGeneratedLetter(letter);
      toast.success("Tailored cover letter generated!");
    } catch {
      toast.error("Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleCopy() {
    if (!generatedLetter) return;
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    toast.success("Cover letter copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  }

  function handleDownloadTxt() {
    if (!generatedLetter) return;
    const blob = new Blob([generatedLetter], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${companyName.trim() || "Cover_Letter"}_Application.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded cover letter document!");
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1.5">
          <FileText className="size-4" />
          <span>AI Application Suite</span>
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight">AI Cover Letter Generator</h1>
        <p className="text-xs text-muted-foreground max-w-xl">
          Craft high-impact, personalized cover letters matching your actual resume accomplishments directly to the target job requirements.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-display text-sm font-bold">Target Position Details</h3>

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

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Company Name:</Label>
                <Input
                  placeholder="e.g. Stripe, Google, Airbnb"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Target Role Title:</Label>
                <Input
                  placeholder="e.g. Lead Frontend Engineer"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Writing Tone:</Label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as any)}
                className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
              >
                <option value="professional">Professional & Direct</option>
                <option value="enthusiastic">Enthusiastic & High-Energy</option>
                <option value="concise">Concise (Under 200 words)</option>
                <option value="executive">Executive & Strategic</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Job Description / Requirements:</Label>
              <Textarea
                placeholder="Paste the key responsibilities and qualifications from the job posting..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="h-36 text-xs font-mono leading-relaxed"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !jobDescription.trim()}
              className="w-full bg-[image:var(--gradient-emerald)] text-primary-foreground font-semibold shadow-[var(--shadow-glow)] gap-2 text-xs"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" /> Drafting Tailored Letter…
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" /> Generate Cover Letter
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4 flex flex-col h-full min-h-[480px]">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-sm font-bold flex items-center gap-2">
                <FileText className="size-4 text-primary" /> Generated Letter
              </h3>
              {generatedLetter && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5 text-xs h-8">
                    {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadTxt} className="gap-1.5 text-xs h-8">
                    <Download className="size-3.5" /> Download (.txt)
                  </Button>
                </div>
              )}
            </div>

            {generatedLetter ? (
              <div className="flex-1 space-y-2">
                <Textarea
                  value={generatedLetter}
                  onChange={(e) => setGeneratedLetter(e.target.value)}
                  className="w-full h-[420px] text-xs font-serif leading-relaxed p-4 bg-background/50 border border-border/80 rounded-2xl resize-none focus:outline-none"
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground space-y-2">
                <FileText className="size-10 text-muted-foreground/40" />
                <p className="text-xs max-w-sm">
                  Fill in the role details and click <strong>Generate Cover Letter</strong> to draft an application tailored to your target job.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
