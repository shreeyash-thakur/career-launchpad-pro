"use client";
import React, { useState } from "react";
import {
  Sparkles,
  Bot,
  Wand2,
  FileCheck,
  Zap,
  Copy,
  Check,
  Search,
  FileText,
  Globe,
  Award,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type FirestoreResume } from "@/lib/resume-service";
import { CoverLetterView } from "./cover-letter-view";
import { LinkedinOptimizerView } from "./linkedin-optimizer-view";
import { InterviewPrepView } from "./interview-prep-view";
import { CareerReadinessView } from "./career-readiness-view";
import { AtsCheckerView } from "./ats-checker-view";

interface Props {
  resumes?: FirestoreResume[];
}

export function AiToolsView({ resumes = [] }: Props) {
  const [activeTab, setActiveTab] = useState("cover-letter");

  // Tool 1: Bullet Point Enhancer State
  const [inputBullet, setInputBullet] = useState("");
  const [enhancedBullets, setEnhancedBullets] = useState<string[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Tool 2: Summary Generator State
  const [summaryRole, setSummaryRole] = useState("");
  const [summaryYears, setSummaryYears] = useState("3+");
  const [summarySkills, setSummarySkills] = useState("");
  const [generatedSummaries, setGeneratedSummaries] = useState<string[]>([]);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const handleEnhanceBullet = () => {
    if (!inputBullet.trim()) return;
    setIsEnhancing(true);

    setTimeout(() => {
      const clean = inputBullet.trim().replace(/^[-•*]\s*/, "");
      const variations = [
        `Spearheaded the development and performance optimization of ${clean.toLowerCase()}, reducing latency by 35% and elevating platform scalability.`,
        `Architected and deployed high-reliability workflows for ${clean.toLowerCase()}, boosting team velocity and cutting deployment cycle time by 28%.`,
        `Led cross-functional execution for ${clean.toLowerCase()}, collaborating with stakeholders to deliver critical milestones 2 weeks ahead of schedule.`,
      ];
      setEnhancedBullets(variations);
      setIsEnhancing(false);
    }, 400);
  };

  const handleGenerateSummary = () => {
    if (!summaryRole.trim()) return;
    setIsGeneratingSummary(true);

    setTimeout(() => {
      const role = summaryRole.trim();
      const skillsList = summarySkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const skillsFormatted =
        skillsList.length > 0
          ? skillsList.slice(0, 4).join(", ")
          : "modern system architecture and scalable engineering";

      const summaries = [
        `Results-driven ${role} with ${summaryYears} of experience engineering high-impact solutions across fast-paced environments. Proven expertise in ${skillsFormatted}, with a strong track record of driving technical excellence and cross-functional team success.`,
        `Innovative and detail-oriented ${role} with ${summaryYears} of hands-on experience specializing in ${skillsFormatted}. Adept at translating complex product requirements into scalable, reliable production software.`,
        `Accomplished ${role} with ${summaryYears} of demonstrated leadership in building mission-critical initiatives. Experienced in leveraging ${skillsFormatted} to achieve measurable efficiency and product quality.`,
      ];

      setGeneratedSummaries(summaries);
      setIsGeneratingSummary(false);
    }, 400);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1.5">
          <Sparkles className="size-4" />
          <span>Full AI Career Acceleration Suite</span>
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight">AI Career Tools</h1>
        <p className="text-xs text-muted-foreground">
          Everything you need to land top interviews: JD Matcher, Cover Letter Generator, LinkedIn Optimizer, Mock Interview Coach, and Career Readiness score.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto p-1 bg-card border border-border rounded-2xl gap-1">
          <TabsTrigger value="cover-letter" className="text-xs py-2.5 rounded-xl gap-1.5 font-semibold">
            <FileText className="size-3.5" /> Cover Letter
          </TabsTrigger>
          <TabsTrigger value="linkedin" className="text-xs py-2.5 rounded-xl gap-1.5 font-semibold">
            <Globe className="size-3.5" /> LinkedIn
          </TabsTrigger>
          <TabsTrigger value="interview" className="text-xs py-2.5 rounded-xl gap-1.5 font-semibold">
            <Bot className="size-3.5" /> Interview Prep
          </TabsTrigger>
          <TabsTrigger value="readiness" className="text-xs py-2.5 rounded-xl gap-1.5 font-semibold">
            <Award className="size-3.5" /> Readiness
          </TabsTrigger>
          <TabsTrigger value="bullets" className="text-xs py-2.5 rounded-xl gap-1.5 font-semibold">
            <Wand2 className="size-3.5" /> Bullet Enhancer
          </TabsTrigger>
          <TabsTrigger value="summary" className="text-xs py-2.5 rounded-xl gap-1.5 font-semibold">
            <Sparkles className="size-3.5" /> Summary Writer
          </TabsTrigger>
        </TabsList>

        {/* Tab: Cover Letter */}
        <TabsContent value="cover-letter" className="mt-6">
          <CoverLetterView resumes={resumes} />
        </TabsContent>

        {/* Tab: LinkedIn Optimizer */}
        <TabsContent value="linkedin" className="mt-6">
          <LinkedinOptimizerView resumes={resumes} />
        </TabsContent>

        {/* Tab: Interview Prep */}
        <TabsContent value="interview" className="mt-6">
          <InterviewPrepView resumes={resumes} />
        </TabsContent>

        {/* Tab: Career Readiness */}
        <TabsContent value="readiness" className="mt-6">
          <CareerReadinessView resumes={resumes} />
        </TabsContent>

        {/* Tab: Bullet Enhancer */}
        <TabsContent value="bullets" className="mt-6 space-y-4">
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
            <div className="space-y-1">
              <h3 className="font-display text-base font-bold">Bullet Point Enhancer</h3>
              <p className="text-xs text-muted-foreground">
                Paste any rough resume bullet point. The engine will rewrite it using strong action verbs, quantifiable metrics, and STAR structure.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bullet-input" className="text-xs">
                Your draft bullet point:
              </Label>
              <Textarea
                id="bullet-input"
                placeholder="e.g. Worked on frontend web app using React and made it faster."
                value={inputBullet}
                onChange={(e) => setInputBullet(e.target.value)}
                className="text-xs h-24"
              />
            </div>

            <Button
              onClick={handleEnhanceBullet}
              disabled={isEnhancing || !inputBullet.trim()}
              className="bg-[image:var(--gradient-emerald)] text-primary-foreground font-semibold shadow-[var(--shadow-glow)] gap-2 text-xs"
            >
              <Wand2 className="size-3.5" />
              {isEnhancing ? "Enhancing…" : "Generate 3 High-Impact Bullet Points"}
            </Button>

            {enhancedBullets.length > 0 && (
              <div className="mt-6 space-y-3 border-t border-border/60 pt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Recommended High-Impact Variations:
                </h4>
                <div className="space-y-2.5">
                  {enhancedBullets.map((bullet, idx) => (
                    <div
                      key={idx}
                      className="group flex items-start justify-between gap-3 rounded-2xl border border-border bg-secondary/40 p-4 transition-all hover:border-primary/40"
                    >
                      <span className="text-xs text-foreground leading-relaxed">• {bullet}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(bullet, idx)}
                        className="size-8 p-0 shrink-0 text-muted-foreground hover:text-primary"
                        title="Copy to clipboard"
                      >
                        {copiedIndex === idx ? (
                          <Check className="size-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab: Summary Generator */}
        <TabsContent value="summary" className="mt-6 space-y-4">
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
            <div className="space-y-1">
              <h3 className="font-display text-base font-bold">Professional Summary Generator</h3>
              <p className="text-xs text-muted-foreground">
                Enter your role, years of experience, and key skills to craft a polished executive summary.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="sum-role" className="text-xs">
                  Target Job Title
                </Label>
                <Input
                  id="sum-role"
                  placeholder="e.g. Senior Full-Stack Engineer"
                  value={summaryRole}
                  onChange={(e) => setSummaryRole(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sum-years" className="text-xs">
                  Experience Level
                </Label>
                <select
                  id="sum-years"
                  value={summaryYears}
                  onChange={(e) => setSummaryYears(e.target.value)}
                  className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Entry-level">Entry-level (0-2 yrs)</option>
                  <option value="3+ years">Mid-level (3-5 yrs)</option>
                  <option value="7+ years">Senior (6-10 yrs)</option>
                  <option value="10+ years">Staff / Lead (10+ yrs)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sum-skills" className="text-xs">
                Key Skills / Domains (comma-separated)
              </Label>
              <Input
                id="sum-skills"
                placeholder="e.g. React, Node.js, Cloud Architecture, CI/CD"
                value={summarySkills}
                onChange={(e) => setSummarySkills(e.target.value)}
                className="text-xs"
              />
            </div>

            <Button
              onClick={handleGenerateSummary}
              disabled={isGeneratingSummary || !summaryRole.trim()}
              className="bg-[image:var(--gradient-emerald)] text-primary-foreground font-semibold shadow-[var(--shadow-glow)] gap-2 text-xs"
            >
              <Bot className="size-3.5" />
              {isGeneratingSummary ? "Generating…" : "Generate Executive Summaries"}
            </Button>

            {generatedSummaries.length > 0 && (
              <div className="mt-6 space-y-3 border-t border-border/60 pt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Generated Professional Summaries:
                </h4>
                <div className="space-y-2.5">
                  {generatedSummaries.map((sum, idx) => (
                    <div
                      key={idx}
                      className="group flex items-start justify-between gap-3 rounded-2xl border border-border bg-secondary/40 p-4 transition-all hover:border-primary/40"
                    >
                      <p className="text-xs text-foreground leading-relaxed">{sum}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(sum, idx + 10)}
                        className="size-8 p-0 shrink-0 text-muted-foreground hover:text-primary"
                        title="Copy to clipboard"
                      >
                        {copiedIndex === idx + 10 ? (
                          <Check className="size-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
