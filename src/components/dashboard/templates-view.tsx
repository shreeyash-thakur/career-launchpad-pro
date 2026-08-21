import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Layout, Sparkles, Check, ArrowRight, Layers, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TEMPLATES } from "@/features/resume-builder/templates";
import { useAuth } from "@/context/auth-context";
import { ResumeService } from "@/lib/resume-service";
import { cn } from "@/lib/utils";

interface Props {
  onRefreshResumes?: () => void;
}

export function TemplatesView({ onRefreshResumes }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [creatingForTemplate, setCreatingForTemplate] = useState<string | null>(null);

  const categories = [
    "All",
    "Popular",
    "ATS-friendly",
    "Corporate",
    "Finance",
    "Developer",
    "Engineering",
    "Two column",
    "Bold",
    "Student",
    "Creative",
    "Academic / CV",
  ];

  const filteredTemplates = TEMPLATES.filter((tpl) => {
    if (activeCategory === "All") return true;
    if (activeCategory === "ATS-friendly") {
      return (
        tpl.category === "ATS-friendly" ||
        tpl.id.includes("ats") ||
        tpl.id === "developer" ||
        tpl.id === "modern"
      );
    }
    return tpl.category.toLowerCase().includes(activeCategory.toLowerCase());
  });

  const handleUseTemplate = async (templateId: string) => {
    setCreatingForTemplate(templateId);
    const tpl = TEMPLATES.find((t) => t.id === templateId);
    const title = `${tpl?.name || "Professional"} Resume`;

    if (user?.uid) {
      try {
        const created = await ResumeService.createResume(user.uid, {
          title,
          templateId,
          questionnaireCompleted: true,
        });
        if (onRefreshResumes) onRefreshResumes();
        void navigate({
          to: "/builder",
          search: { resumeId: created.id, template: templateId },
        });
        return;
      } catch (err) {
        console.error("Failed to create resume from template:", err);
      }
    }

    // Guest navigation
    void navigate({
      to: "/builder",
      search: { template: templateId },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Resume Templates</h1>
        <p className="text-xs text-muted-foreground">
          Browse 20+ recruiter-approved, print-accurate, and ATS-friendly templates.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all",
              activeCategory === cat
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-secondary",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((tpl) => {
          const isBusy = creatingForTemplate === tpl.id;

          return (
            <div
              key={tpl.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                    <Layout className="size-3 text-primary" />
                    {tpl.category}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    {tpl.columns === 1 ? "1 Column" : "2 Columns"}
                  </span>
                </div>

                <h3 className="font-display font-bold text-base text-foreground group-hover:text-primary transition-colors">
                  {tpl.name}
                </h3>

                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {tpl.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-border/60">
                <Button
                  variant="hero"
                  size="sm"
                  disabled={isBusy}
                  onClick={() => handleUseTemplate(tpl.id)}
                  className="w-full text-xs font-semibold gap-1.5 shadow-[var(--shadow-glow)]"
                >
                  {isBusy ? (
                    "Opening Editor…"
                  ) : (
                    <>
                      Use Template <ArrowRight className="size-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
