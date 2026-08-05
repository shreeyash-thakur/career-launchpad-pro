import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

/**
 * Subtle cursor companion: a soft emerald halo that trails the pointer.
 * Only mounts for fine pointers and when reduced motion is not requested.
 */
export function CursorGlow() {
  const [enabled, setEnabled] = useState(false);
  const raw = { x: useMotionValue(-200), y: useMotionValue(-200) };
  const x = useSpring(raw.x, { stiffness: 180, damping: 26, mass: 0.6 });
  const y = useSpring(raw.y, { stiffness: 180, damping: 26, mass: 0.6 });
  const frame = useRef(0);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    setEnabled(true);

    const onMove = (event: MouseEvent) => {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        raw.x.set(event.clientX);
        raw.y.set(event.clientY);
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frame.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      style={{ x, y }}
      className="pointer-events-none fixed left-0 top-0 z-[60] hidden size-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[90px] md:block"
    >
      <div
        className="size-full rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--primary) 32%, transparent), transparent 65%)",
        }}
      />
    </motion.div>
  );
}
