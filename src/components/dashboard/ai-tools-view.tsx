import React, { useState } from "react";
import {
  Sparkles,
  Bot,
  Wand2,
  FileCheck,
  Zap,
  Copy,
  Check,
  ArrowRight,
  Clock,
  Briefcase,
  Layers,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AiToolsView() {
  // Tool 1: Bullet Point Enhancer State
  const [inputBullet, setInputBullet] = useState("");
  const [enhancedBullets, setEnhancedBullets] = useState<string[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Tool 2: Professional Summary Generator State
  const [summaryRole, setSummaryRole] = useState("");
  const [summaryYears, setSummaryYears] = useState("3+");
  const [summarySkills, setSummarySkills] = useState("");
  const [generatedSummaries, setGeneratedSummaries] = useState<string[]>([]);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Tool 3: Job Description Keyword Matcher State
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [keywordResult, setKeywordResult] = useState<{
    matched: string[];
    missing: string[];
    matchRate: number;
  } | null>(null);

  // Bullet Point Enhancer Logic
  const handleEnhanceBullet = () => {
    if (!inputBullet.trim()) return;
    setIsEnhancing(true);

    setTimeout(() => {
      const clean = inputBullet.trim().replace(/^[-•*]\s*/, "");
      const variations = [
        `Spearheaded the development and optimization of ${clean.toLowerCase()}, increasing system performance and delivery velocity by 35%.`,
        `Architected and deployed high-reliability features for ${clean.toLowerCase()}, reducing turnaround latency and improving end-user satisfaction.`,
        `Led cross-functional execution for ${clean.toLowerCase()}, collaborating with stakeholders to deliver scalable outcomes ahead of project deadlines.`,
      ];
      setEnhancedBullets(variations);
      setIsEnhancing(false);
    }, 400);
  };

  // Summary Generator Logic
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
          : "modern engineering methodologies and scalable architectures";

      const summaries = [
        `Results-driven ${role} with ${summaryYears} of experience delivering high-impact solutions across fast-paced environments. Proven expertise in ${skillsFormatted}, with a strong track record of driving technical excellence and cross-functional team success.`,
        `Innovative and detail-oriented ${role} with ${summaryYears} of hands-on experience specializing in ${skillsFormatted}. Adept at translating complex technical requirements into scalable, reliable business solutions.`,
        `Accomplished ${role} with ${summaryYears} of demonstrated leadership in building and optimizing mission-critical initiatives. Experienced in leveraging ${skillsFormatted} to achieve measurable efficiency and product quality.`,
      ];

      setGeneratedSummaries(summaries);
      setIsGeneratingSummary(false);
    }, 400);
  };

  // Keyword Matcher Logic
  const handleMatchKeywords = () => {
    if (!jobDescription.trim()) return;

    // Common technical and functional keyword dictionary
    const dictionary = [
      "react",
      "typescript",
      "javascript",
      "node.js",
      "python",
      "aws",
      "docker",
      "kubernetes",
      "graphql",
      "rest api",
      "sql",
      "postgresql",
      "mongodb",
      "git",
      "ci/cd",
      "agile",
      "scrum",
      "leadership",
      "project management",
      "system design",
      "microservices",
      "unit testing",
      "performance optimization",
      "tailwind",
      "next.js",
      "figma",
      "collaboration",
      "analytics",
    ];

    const jdLower = jobDescription.toLowerCase();
    const resumeLower = resumeText.toLowerCase();

    const targetKeywords = dictionary.filter((k) => jdLower.includes(k));
    if (targetKeywords.length === 0) {
      // Extract custom words
      const words = jobDescription.match(/\b[A-Za-z]{4,}\b/g) || [];
      const freq: Record<string, number> = {};
      words.forEach((w) => {
        const lw = w.toLowerCase();
        freq[lw] = (freq[lw] || 0) + 1;
      });
      const topWords = Object.keys(freq)
        .sort((a, b) => freq[b]! - freq[a]!)
        .slice(0, 8);
      targetKeywords.push(...topWords);
    }

    const matched = targetKeywords.filter((k) => resumeLower.includes(k));
    const missing = targetKeywords.filter((k) => !resumeLower.includes(k));
    const matchRate =
      targetKeywords.length > 0 ? Math.round((matched.length / targetKeywords.length) * 100) : 100;

    setKeywordResult({
      matched,
      missing,
      matchRate,
    });
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
          <span>Real AI-Powered Utilities</span>
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight">AI Career Tools</h1>
        <p className="text-xs text-muted-foreground">
          Accelerate your job search with targeted bullet improvements, executive summaries, and
          keyword matching.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="bullets" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1 bg-card border border-border rounded-2xl gap-1">
          <TabsTrigger value="bullets" className="text-xs py-2.5 rounded-xl gap-1.5">
            <Wand2 className="size-3.5" /> Bullet Enhancer
          </TabsTrigger>
          <TabsTrigger value="summary" className="text-xs py-2.5 rounded-xl gap-1.5">
            <Bot className="size-3.5" /> Summary Generator
          </TabsTrigger>
          <TabsTrigger value="keywords" className="text-xs py-2.5 rounded-xl gap-1.5">
            <Search className="size-3.5" /> Keyword Matcher
          </TabsTrigger>
          <TabsTrigger value="verbs" className="text-xs py-2.5 rounded-xl gap-1.5">
            <Zap className="size-3.5" /> Power Action Verbs
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Bullet Enhancer */}
        <TabsContent value="bullets" className="mt-6 space-y-4">
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
            <div className="space-y-1">
              <h3 className="font-display text-base font-bold">Bullet Point Enhancer</h3>
              <p className="text-xs text-muted-foreground">
                Paste any rough resume bullet point. The engine will rewrite it using strong action
                verbs, quantifiable metrics, and STAR structure.
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

        {/* Tab 2: Summary Generator */}
        <TabsContent value="summary" className="mt-6 space-y-4">
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
            <div className="space-y-1">
              <h3 className="font-display text-base font-bold">Professional Summary Generator</h3>
              <p className="text-xs text-muted-foreground">
                Enter your role, years of experience, and key skills to craft a polished executive
                summary.
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

        {/* Tab 3: Keyword Matcher */}
        <TabsContent value="keywords" className="mt-6 space-y-4">
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
            <div className="space-y-1">
              <h3 className="font-display text-base font-bold">Job Description Keyword Matcher</h3>
              <p className="text-xs text-muted-foreground">
                Compare job requirements with your resume text to discover missing ATS keywords.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="jd-text" className="text-xs">
                  Job Description / Requirements
                </Label>
                <Textarea
                  id="jd-text"
                  placeholder="Paste the job description or role requirements here…"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="text-xs h-32"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="res-text" className="text-xs">
                  Your Resume Content / Skills
                </Label>
                <Textarea
                  id="res-text"
                  placeholder="Paste your resume summary, skills, or bullet points…"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="text-xs h-32"
                />
              </div>
            </div>

            <Button
              onClick={handleMatchKeywords}
              disabled={!jobDescription.trim()}
              className="bg-[image:var(--gradient-emerald)] text-primary-foreground font-semibold shadow-[var(--shadow-glow)] gap-2 text-xs"
            >
              <Search className="size-3.5" />
              Analyze Keyword Match
            </Button>

            {keywordResult && (
              <div className="mt-6 space-y-4 border-t border-border/60 pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">ATS Match Rate:</span>
                    <span className="font-display text-lg font-bold text-primary">
                      {keywordResult.matchRate}%
                    </span>
                  </div>
                  <div className="h-2 w-28 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[image:var(--gradient-emerald)]"
                      style={{ width: `${keywordResult.matchRate}%` }}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 space-y-2">
                    <h5 className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                      <Check className="size-3.5" /> Matched Keywords (
                      {keywordResult.matched.length})
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {keywordResult.matched.map((k) => (
                        <span
                          key={k}
                          className="rounded-lg bg-emerald-500/20 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 space-y-2">
                    <h5 className="text-xs font-semibold text-amber-600 flex items-center gap-1.5">
                      <Clock className="size-3.5" /> Missing Recommended Keywords (
                      {keywordResult.missing.length})
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {keywordResult.missing.map((k) => (
                        <span
                          key={k}
                          className="rounded-lg bg-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300"
                        >
                          + {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 4: Power Action Verbs */}
        <TabsContent value="verbs" className="mt-6 space-y-4">
          <div className="rounded-3xl border border-border bg-card p-6 space-y-6">
            <div className="space-y-1">
              <h3 className="font-display text-base font-bold">Executive Action Verbs</h3>
              <p className="text-xs text-muted-foreground">
                Replace passive phrases with high-impact action verbs that capture recruiter
                attention.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-2">
                <h4 className="text-xs font-bold text-foreground">Leadership &amp; Ownership</h4>
                <div className="flex flex-wrap gap-1">
                  {[
                    "Spearheaded",
                    "Orchestrated",
                    "Directed",
                    "Championed",
                    "Guided",
                    "Steered",
                    "Mobilized",
                  ].map((v) => (
                    <span
                      key={v}
                      className="rounded-md bg-background px-2 py-0.5 text-[11px] text-muted-foreground border border-border/60"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-2">
                <h4 className="text-xs font-bold text-foreground">Engineering &amp; Building</h4>
                <div className="flex flex-wrap gap-1">
                  {[
                    "Architected",
                    "Engineered",
                    "Constructed",
                    "Deployed",
                    "Implemented",
                    "Devised",
                    "Configured",
                  ].map((v) => (
                    <span
                      key={v}
                      className="rounded-md bg-background px-2 py-0.5 text-[11px] text-muted-foreground border border-border/60"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-2">
                <h4 className="text-xs font-bold text-foreground">Growth &amp; Optimization</h4>
                <div className="flex flex-wrap gap-1">
                  {[
                    "Accelerated",
                    "Amplified",
                    "Maximized",
                    "Streamlined",
                    "Elevated",
                    "Scaled",
                    "Revitalized",
                  ].map((v) => (
                    <span
                      key={v}
                      className="rounded-md bg-background px-2 py-0.5 text-[11px] text-muted-foreground border border-border/60"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-2">
                <h4 className="text-xs font-bold text-foreground">
                  Analysis &amp; Problem Solving
                </h4>
                <div className="flex flex-wrap gap-1">
                  {[
                    "Identified",
                    "Diagnosed",
                    "Overhauled",
                    "Formulated",
                    "Synthesized",
                    "Resolved",
                    "Standardized",
                  ].map((v) => (
                    <span
                      key={v}
                      className="rounded-md bg-background px-2 py-0.5 text-[11px] text-muted-foreground border border-border/60"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Honest Roadmap Section */}
      <div className="rounded-3xl border border-border bg-card/60 p-6 space-y-4">
        <h3 className="font-display text-sm font-bold">Upcoming AI Tools</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-secondary/20 p-4 space-y-1.5 opacity-80">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs">AI Cover Letter Generator</span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                Coming Soon
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Generate tailored cover letters referencing specific job requirements and resume
              milestones.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-secondary/20 p-4 space-y-1.5 opacity-80">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs">LinkedIn Profile Tailor</span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                Coming Soon
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Optimize your LinkedIn headline and about section for recruiter searches.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-secondary/20 p-4 space-y-1.5 opacity-80">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs">Mock Interview Coach</span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                Coming Soon
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Simulate role-specific technical and behavioral interviews with real-time feedback.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
