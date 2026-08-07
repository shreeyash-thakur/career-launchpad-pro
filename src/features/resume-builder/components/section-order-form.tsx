import type { ResumeData } from "../types";
import { moveItem } from "../utils/array";
import { sectionHasContent, sectionLabel } from "../templates/shared";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  data: ResumeData;
  onChange: (updater: (prev: ResumeData) => ResumeData) => void;
}

export function SectionOrderForm({ data, onChange }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Controls the order sections appear in on the résumé (the header and contact info always stay
        on top). Sections with no content yet are skipped automatically.
      </p>
      {data.sectionOrder.map((kind, index) => {
        const hasContent = sectionHasContent(data, kind);
        return (
          <div
            key={kind}
            className={cn(
              "flex items-center justify-between gap-2 rounded-lg border border-border bg-card/60 px-3 py-2",
              !hasContent && "opacity-50",
            )}
          >
            <div className="flex items-center gap-2 text-sm">
              <GripVertical className="size-3.5 text-muted-foreground/50" />
              <span className="font-medium">{sectionLabel(data, kind)}</span>
              {!hasContent ? (
                <span className="text-[0.7rem] text-muted-foreground">empty</span>
              ) : null}
            </div>
            <div className="flex items-center gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                disabled={index === 0}
                onClick={() =>
                  onChange((prev) => ({
                    ...prev,
                    sectionOrder: moveItem(prev.sectionOrder, index, -1),
                  }))
                }
                aria-label="Move up"
              >
                <ChevronUp className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                disabled={index === data.sectionOrder.length - 1}
                onClick={() =>
                  onChange((prev) => ({
                    ...prev,
                    sectionOrder: moveItem(prev.sectionOrder, index, 1),
                  }))
                }
                aria-label="Move down"
              >
                <ChevronDown className="size-3.5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
