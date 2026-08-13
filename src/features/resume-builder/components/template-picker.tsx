import type { ResumeData, ResumeStyle } from "../types";
import { TEMPLATES } from "../templates";
import { PAGE_DIMENSIONS } from "../templates/resume-page";
import { useContainerWidth } from "../hooks/use-container-width";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Props {
  data: ResumeData;
  style: ResumeStyle;
  onSelect: (templateId: string) => void;
}

const GRID_GAP = 12; // px, matches gap-3

export function TemplatePicker({ data, style, onSelect }: Props) {
  const { ref, width: containerWidth } = useContainerWidth<HTMLDivElement>();
  // Fluid thumbnail width: always exactly two columns, sized to whatever
  // room the sidebar actually has — fixed sidebar on desktop, full phone
  // width once the editor's mobile Edit/Preview toggle gives this panel
  // the whole screen. Falls back to a sane default before the first
  // layout measurement lands.
  const thumbWidth = containerWidth > 0 ? (containerWidth - GRID_GAP) / 2 : 168;

  return (
    <div ref={ref} id="templates" className="grid grid-cols-2 gap-3">
      {TEMPLATES.map((template) => {
        const dims = PAGE_DIMENSIONS[style.pageSize];
        const scale = thumbWidth / dims.width;
        const thumbHeight = dims.height * scale;
        const active = style.templateId === template.id;
        const previewStyle: ResumeStyle = { ...style, templateId: template.id };

        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template.id)}
            className={cn(
              "group relative overflow-hidden rounded-xl border-2 bg-secondary/40 p-2 text-left transition-all",
              active
                ? "border-primary ring-2 ring-primary/30"
                : "border-border hover:border-primary/50",
            )}
          >
            <div
              className="relative mx-auto overflow-hidden rounded-md bg-white shadow-sm"
              style={{ width: thumbWidth, height: thumbHeight }}
            >
              <div
                className="pointer-events-none origin-top-left"
                style={{ width: dims.width, height: dims.height, transform: `scale(${scale})` }}
              >
                <template.Component data={data} style={previewStyle} />
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between gap-1 px-0.5">
              <div>
                <p className="text-xs font-semibold leading-tight">{template.name}</p>
                <p className="text-[0.65rem] text-muted-foreground">{template.category}</p>
              </div>
              {active ? (
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-2.5" />
                </span>
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}
