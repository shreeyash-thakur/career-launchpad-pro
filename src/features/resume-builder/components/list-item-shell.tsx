import type { ReactNode } from "react";
import { ChevronDown, ChevronUp, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ListItemShell({
  title,
  children,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  title: string;
  children: ReactNode;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-3.5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <GripVertical className="size-3.5 shrink-0 text-muted-foreground/50" />
          <span className="truncate">{title}</span>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {onMoveUp ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              disabled={!canMoveUp}
              onClick={onMoveUp}
              aria-label="Move up"
            >
              <ChevronUp className="size-3.5" />
            </Button>
          ) : null}
          {onMoveDown ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              disabled={!canMoveDown}
              onClick={onMoveDown}
              aria-label="Move down"
            >
              <ChevronDown className="size-3.5" />
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 text-destructive hover:text-destructive"
            onClick={onRemove}
            aria-label="Remove"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}
