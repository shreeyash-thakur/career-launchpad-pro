import { useRef } from "react";
import type { PointerEvent } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import { CheckCircle2, Download, Sparkles } from "lucide-react";
import heroResume from "@/assets/hero-resume.jpg";

const SPRING = { stiffness: 120, damping: 18, mass: 0.6 };

/**
 * Pointer-driven 3D scene: real depth layers on a shared perspective,
 * spring-smoothed rotation, a light sweep that tracks the cursor and
 * parallaxed satellite cards that sit in front of the document.
 */
export function HeroScene() {
  const ref = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const rotateY = useSpring(useTransform(mx, [0, 1], [16, -16]), SPRING);
  const rotateX = useSpring(useTransform(my, [0, 1], [-13, 13]), SPRING);

  const shiftX = useSpring(useTransform(mx, [0, 1], [18, -18]), SPRING);
  const shiftY = useSpring(useTransform(my, [0, 1], [14, -14]), SPRING);

  const lightX = useTransform(mx, (v) => `${v * 100}%`);
  const lightY = useTransform(my, (v) => `${v * 100}%`);
  const sheen = useMotionTemplate`radial-gradient(420px circle at ${lightX} ${lightY}, color-mix(in oklab, white 55%, transparent), transparent 65%)`;

  function handleMove(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    mx.set((event.clientX - rect.left) / rect.width);
    my.set((event.clientY - rect.top) / rect.height);
  }

  function handleLeave() {
    mx.set(0.5);
    my.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      initial={{ opacity: 0, y: 60, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      className="relative [perspective:1400px]"
    >
      {/* ambient bloom behind the stack */}
      <motion.div
        aria-hidden
        style={{ x: shiftX, y: shiftY, background: "var(--gradient-hero)" }}
        className="absolute -inset-10 rounded-[4rem] opacity-90 blur-3xl"
      />

      <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="relative">
        {/* depth plate #2 */}
        <div
          aria-hidden
          className="glass absolute inset-0 rounded-[2.25rem]"
          style={{ transform: "translateZ(-90px) translate(26px, 30px) rotate(3.5deg)" }}
        />
        {/* depth plate #1 */}
        <div
          aria-hidden
          className="glass absolute inset-0 rounded-[2.25rem]"
          style={{ transform: "translateZ(-45px) translate(13px, 15px) rotate(1.75deg)" }}
        />

        {/* the document */}
        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
          style={{ transform: "translateZ(0px)", transformStyle: "preserve-3d" }}
          className="glass-strong relative overflow-hidden rounded-[2.25rem] p-2 shadow-float"
        >
          <img
            src={heroResume}
            width={1200}
            height={1408}
            alt="A CareerGPT résumé rendered in the Vellum template, floating above stat cards for projects and experience"
            className="w-full rounded-[1.75rem] object-cover"
            fetchPriority="high"
          />
          <motion.div
            aria-hidden
            style={{ background: sheen }}
            className="pointer-events-none absolute inset-0 mix-blend-overlay"
          />
        </motion.div>

        {/* floating satellites, lifted off the page in Z */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ transform: "translateZ(90px)" }}
          className="glass-strong absolute -left-6 bottom-14 hidden rounded-2xl px-4 py-3 shadow-float sm:block"
        >
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="size-3.5 text-primary" /> ATS parse score
          </p>
          <p className="font-display text-2xl font-semibold text-primary">96%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.05, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ transform: "translateZ(130px)" }}
          className="glass-strong absolute -right-6 top-12 hidden rounded-2xl px-4 py-3 shadow-float sm:block"
        >
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-gold" /> Autosaved
          </p>
          <p className="font-display text-sm font-semibold text-gold">2 seconds ago</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ transform: "translateZ(70px)" }}
          className="glass-strong absolute -bottom-6 right-8 hidden items-center gap-2 rounded-full px-4 py-2 text-sm shadow-float md:flex"
        >
          <Download className="size-4 text-primary" />
          <span className="font-medium">Export ready</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
