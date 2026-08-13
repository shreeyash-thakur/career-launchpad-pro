import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import type { PointerEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useFinePointer } from "@/hooks/use-fine-pointer";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Max rotation in degrees. */
  intensity?: number;
}

/**
 * Subtle pointer-tracked 3D tilt with a highlight that follows the cursor.
 * Springs keep it from feeling twitchy.
 */
export function TiltCard({ children, className, intensity = 6 }: TiltCardProps) {
  const isFinePointer = useFinePointer();
  const px = useMotionValue(50);
  const py = useMotionValue(50);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);

  const rotateX = useSpring(rx, { stiffness: 150, damping: 18 });
  const rotateY = useSpring(ry, { stiffness: 150, damping: 18 });

  const x = useTransform(px, (v) => `${v}%`);
  const y = useTransform(py, (v) => `${v}%`);
  const glow = useMotionTemplate`radial-gradient(240px circle at ${x} ${y}, color-mix(in oklab, var(--primary) 20%, transparent), transparent 70%)`;

  // Cursor-tracked tilt only makes sense with a mouse — skip it entirely on
  // touch so cards don't get stuck mid-tilt after a tap/scroll, and so we're
  // not paying for spring calculations that never mattered on that device.
  function handleMove(event: PointerEvent<HTMLDivElement>) {
    if (!isFinePointer) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width;
    const ny = (event.clientY - rect.top) / rect.height;
    px.set(nx * 100);
    py.set(ny * 100);
    ry.set((nx - 0.5) * intensity * 2);
    rx.set((0.5 - ny) * intensity * 2);
  }

  function handleLeave() {
    rx.set(0);
    ry.set(0);
    px.set(50);
    py.set(50);
  }

  return (
    <motion.div
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={{ rotateX, rotateY, transformPerspective: isFinePointer ? 1000 : 0 }}
      className={cn("group relative [transform-style:preserve-3d]", className)}
    >
      <motion.div
        aria-hidden
        style={{ background: glow }}
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      {children}
    </motion.div>
  );
}
