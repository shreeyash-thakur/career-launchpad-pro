import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import type { PointerEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Max rotation in degrees. */
  intensity?: number;
}

/**
 * Subtle pointer-tracked 3D tilt with a following highlight.
 * Uses springs so it never feels twitchy; disabled for coarse pointers via CSS.
 */
export function TiltCard({ children, className, intensity = 6 }: TiltCardProps) {
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const rotateX = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 });

  const glow = useMotionTemplate`radial-gradient(220px circle at ${useMotionTemplate`calc(${px} * 100%)`} ${useMotionTemplate`calc(${py} * 100%)`}, color-mix(in oklab, var(--primary) 22%, transparent), transparent 70%)`;

  function handleMove(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    px.set(x);
    py.set(y);
    rotateY.set((x - 0.5) * intensity * 2);
    rotateX.set((0.5 - y) * intensity * 2);
  }

  function handleLeave() {
    rotateX.set(0);
    rotateY.set(0);
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <motion.div
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
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
