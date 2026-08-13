import { memo } from "react";

/**
 * Ambient animated background: drifting gradient blobs + fine grid.
 * Pure CSS animation (no JS per-frame work) so it stays cheap on scroll.
 */
export const AuroraBackground = memo(function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-background" />

      <div
        className="animate-blob absolute -left-[15%] -top-[20%] h-[70vw] w-[70vw] rounded-full opacity-35 blur-[120px]"
        style={{ background: "var(--gradient-emerald)" }}
      />
      <div
        className="animate-blob absolute -right-[20%] top-[10%] h-[55vw] w-[55vw] rounded-full opacity-25 blur-[130px] [animation-delay:-8s]"
        style={{ background: "var(--gradient-gold)" }}
      />
      <div
        className="animate-blob absolute bottom-[-25%] left-[25%] h-[60vw] w-[60vw] rounded-full opacity-20 blur-[140px] [animation-delay:-15s]"
        style={{ background: "var(--gradient-emerald)" }}
      />

      {/* fine grid */}
      <div
        className="absolute inset-0 text-primary opacity-[0.09]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "68px 68px",
          maskImage: "radial-gradient(90% 60% at 50% 0%, black, transparent 85%)",
        }}
      />

      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, transparent 35%, color-mix(in oklab, var(--background) 92%, transparent))",
        }}
      />
    </div>
  );
});
