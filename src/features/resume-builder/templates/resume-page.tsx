import type { CSSProperties, ReactNode } from "react";
import type { ResumeStyle } from "../types";
import { cn } from "@/lib/utils";

export const PAGE_DIMENSIONS: Record<ResumeStyle["pageSize"], { width: number; height: number }> = {
  letter: { width: 816, height: 1056 },
  a4: { width: 794, height: 1123 },
};

const FONT_STACKS: Record<ResumeStyle["fontFamily"], string> = {
  sans: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
  serif: '"Lora", Georgia, "Times New Roman", serif',
  mono: '"JetBrains Mono", ui-monospace, "SFMono-Regular", monospace',
};

interface ResumePageProps {
  style: ResumeStyle;
  className?: string;
  children: ReactNode;
  /** id used for the "jump to templates/section" anchors + PDF export target */
  id?: string;
}

export function ResumePage({ style, className, children, id }: ResumePageProps) {
  const dims = PAGE_DIMENSIONS[style.pageSize];
  const cssVars = {
    "--resume-accent": style.accentColor,
    "--resume-font": FONT_STACKS[style.fontFamily],
    "--resume-scale": style.fontScale,
    "--resume-leading": style.lineHeight,
  } as CSSProperties;

  return (
    <div
      id={id}
      data-resume-page
      className={cn(
        "resume-page relative overflow-hidden bg-white text-neutral-900 shadow-2xl",
        className,
      )}
      style={{
        width: dims.width,
        minHeight: dims.height,
        fontFamily: "var(--resume-font)",
        fontSize: `calc(10.5px * var(--resume-scale))`,
        lineHeight: "var(--resume-leading)",
        color: "#1a1a1a",
        ...cssVars,
      }}
    >
      {children}
    </div>
  );
}
