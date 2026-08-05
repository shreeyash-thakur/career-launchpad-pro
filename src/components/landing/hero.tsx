import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowRight, FileText, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeUp, revealOnce, silk, stagger } from "@/animations/variants";
import heroResume from "@/assets/hero-resume.jpg";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative overflow-hidden px-4 pb-20 pt-36 sm:pt-44 lg:pb-28"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          style={{ y: copyY, opacity: copyOpacity }}
          variants={stagger(0.1, 0.09)}
          initial="hidden"
          animate="show"
          className="flex flex-col items-start gap-6"
        >
          <motion.div
            variants={fadeUp}
            className="glass inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-xs"
          >
            <span className="rounded-full bg-[image:var(--gradient-gold)] px-2.5 py-1 font-semibold text-gold-foreground">
              New
            </span>
            <span className="text-muted-foreground">
              25 original templates, hand-set typography
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-balance text-4xl font-semibold leading-[1.05] sm:text-6xl lg:text-[4.25rem]"
          >
            The résumé builder that <span className="text-gradient-emerald">respects</span> your
            career.
          </motion.h1>

          <motion.p variants={fadeUp} className="max-w-xl text-pretty text-lg text-muted-foreground">
            Drag-and-drop sections, a live print-accurate preview, and a customization suite
            designers actually asked for. No templates that look like everyone else&apos;s.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
            <Button variant="hero" size="xl">
              Start building free
              <ArrowRight />
            </Button>
            <Button variant="glass" size="xl">
              <FileText />
              Browse templates
            </Button>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-3.5 fill-gold text-gold" />
              ))}
              4.9 average
            </span>
            <span>No credit card required</span>
            <span className="hidden sm:inline">Export in one click</span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40, rotateY: -12 }}
          animate={{ opacity: 1, y: 0, rotateY: 0 }}
          transition={{ duration: 1.1, ease: silk, delay: 0.15 }}
          viewport={revealOnce}
          style={{ y: imageY, scale: imageScale, perspective: 1200 }}
          className="relative"
        >
          <div className="animate-float-slow relative">
            <div
              aria-hidden
              className="absolute -inset-8 rounded-[3rem] opacity-70 blur-3xl"
              style={{ background: "var(--gradient-hero)" }}
            />
            <img
              src={heroResume}
              width={1200}
              height={1408}
              alt="A CareerGPT résumé rendered in the Vellum template, floating above stat cards for projects and experience"
              className="glass relative w-full rounded-[2rem] object-cover shadow-float"
              fetchPriority="high"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.7, ease: silk }}
            className="glass-strong absolute -left-3 bottom-10 hidden rounded-2xl px-4 py-3 shadow-float sm:block"
          >
            <p className="text-xs text-muted-foreground">ATS parse score</p>
            <p className="font-display text-2xl font-semibold text-primary">96%</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.05, duration: 0.7, ease: silk }}
            className="glass-strong absolute -right-3 top-14 hidden rounded-2xl px-4 py-3 shadow-float sm:block"
          >
            <p className="text-xs text-muted-foreground">Autosaved</p>
            <p className="font-display text-sm font-semibold text-gold">2 seconds ago</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
