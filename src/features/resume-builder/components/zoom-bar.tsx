import { Minus, Plus, Maximize2, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const PRESETS = [50, 75, 90, 100, 125, 150, 175, 200];

interface Props {
  zoomPercent: number;
  isFit: boolean;
  onZoomChange: (percent: number) => void;
  onFitToWidth: () => void;
  pageCount: number;
  onShrinkToFit: () => void;
  shrinking: boolean;
}

export function ZoomBar({
  zoomPercent,
  isFit,
  onZoomChange,
  onFitToWidth,
  pageCount,
  onShrinkToFit,
  shrinking,
}: Props) {
  return (
    <div className="no-print sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-border bg-background/90 px-4 py-2 backdrop-blur">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => onZoomChange(Math.max(40, Math.round(zoomPercent / 5) * 5 - 10))}
          aria-label="Zoom out"
        >
          <Minus className="size-3.5" />
        </Button>

        <Select
          value={String(Math.round(zoomPercent))}
          onValueChange={(v) => onZoomChange(Number(v))}
        >
          <SelectTrigger className="h-7 w-[84px] px-2 text-xs">
            <SelectValue>{isFit ? "Fit" : `${Math.round(zoomPercent)}%`}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {PRESETS.map((p) => (
              <SelectItem key={p} value={String(p)} className="text-xs">
                {p}%
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => onZoomChange(Math.min(200, Math.round(zoomPercent / 5) * 5 + 10))}
          aria-label="Zoom in"
        >
          <Plus className="size-3.5" />
        </Button>

        <Button
          variant={isFit ? "secondary" : "ghost"}
          size="sm"
          className="ml-1 h-7 gap-1 px-2 text-xs"
          onClick={onFitToWidth}
        >
          <Maximize2 className="size-3.5" /> Fit width
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium",
            pageCount > 1 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800",
          )}
        >
          {pageCount} {pageCount === 1 ? "page" : "pages"}
        </span>
        {pageCount > 1 ? (
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
            onClick={onShrinkToFit}
            disabled={shrinking}
          >
            <ScanLine className="size-3.5" /> {shrinking ? "Shrinking…" : "Shrink to 1 page"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
