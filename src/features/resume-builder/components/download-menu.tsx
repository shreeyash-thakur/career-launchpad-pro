import { ChevronDown, Download, FileImage, FileType, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ExportFormat } from "../utils/export";

interface DownloadMenuProps {
  onDownload: (format: ExportFormat) => void;
  exporting: ExportFormat | null;
  /** "compact" fits a toolbar; "large" is the big CTA on the final-check page. */
  size?: "compact" | "large";
  className?: string;
}

const FORMAT_META: Record<ExportFormat, { label: string; hint: string; icon: typeof FileType }> = {
  pdf: { label: "PDF", hint: "Best for applications", icon: FileType },
  png: { label: "PNG image", hint: "Sharp text, larger file", icon: FileImage },
  jpg: { label: "JPG image", hint: "Smaller file size", icon: FileImage },
};

/**
 * A direct-download split button: the main action downloads a PDF right
 * away (no browser print dialog, no intermediate page — the file just
 * lands in Downloads), and the chevron opens a menu for PNG/JPG instead.
 * Behaves identically on mobile and desktop since it's plain click handlers,
 * not the OS/browser print sheet.
 */
export function DownloadMenu({
  onDownload,
  exporting,
  size = "compact",
  className,
}: DownloadMenuProps) {
  const isExporting = exporting !== null;
  const large = size === "large";

  return (
    <div className={cn("inline-flex", className)}>
      <Button
        variant="hero"
        size={large ? "lg" : "sm"}
        disabled={isExporting}
        onClick={() => onDownload("pdf")}
        className={cn("gap-1.5 rounded-r-none", large ? "px-5" : "px-2.5 sm:px-4")}
      >
        {isExporting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Download className={large ? "size-4" : "size-3.5"} />
        )}
        <span className={large ? "" : "hidden sm:inline"}>
          {isExporting ? "Preparing…" : large ? "Download Resume (PDF)" : "Download PDF"}
        </span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="hero"
            size={large ? "lg" : "sm"}
            disabled={isExporting}
            aria-label="Choose download format"
            className={cn(
              "rounded-l-none border-l border-primary-foreground/20 px-2",
              large && "px-3",
            )}
          >
            <ChevronDown className={large ? "size-4" : "size-3.5"} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {(Object.keys(FORMAT_META) as ExportFormat[]).map((format) => {
            const meta = FORMAT_META[format];
            const Icon = meta.icon;
            return (
              <DropdownMenuItem
                key={format}
                disabled={isExporting}
                onClick={() => onDownload(format)}
                className="flex items-center gap-2.5 py-2"
              >
                <Icon className="size-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Download as {meta.label}</span>
                  <span className="text-xs text-muted-foreground">{meta.hint}</span>
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
