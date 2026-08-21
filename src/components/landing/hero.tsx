import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, FileText, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeUp, stagger } from "@/animations/variants";
import { HeroScene } from "@/components/landing/hero-scene";
import { useAuth } from "@/context/auth-context";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const handleCreateMyResume = () => {
    if (!user) {
      openAuthModal(() => {
        void navigate({ to: "/onboarding" });
      });
    } else {
      void navigate({ to: "/onboarding" });
    }
  };

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
              Free &amp; ATS-Ready
            </span>
            <span className="text-muted-foreground">
              20+ original templates, print-accurate vector PDF
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-balance text-4xl font-semibold leading-[1.05] sm:text-6xl lg:text-[4.25rem]"
          >
            The resume builder that <span className="text-gradient-emerald">accelerates</span> your
            career.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="max-w-xl text-pretty text-lg text-muted-foreground"
          >
            Build ATS-compliant resumes with real-time vector preview, customizable sections, and
            instant free PDF download. No hidden subscription traps.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
            <Button
              variant="hero"
              size="xl"
              onClick={handleCreateMyResume}
              className="gap-2 font-semibold shadow-[var(--shadow-glow)]"
            >
              Create My Resume
              <ArrowRight />
            </Button>
            <Button variant="glass" size="xl" asChild>
              <a href="#templates">
                <FileText />
                Browse templates
              </a>
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
              4.9/5 satisfaction
            </span>
            <span>100% Free PDF export</span>
            <span className="hidden sm:inline">No credit card needed</span>
          </motion.div>
        </motion.div>

        <motion.div style={{ y: imageY, scale: imageScale }} className="relative">
          <HeroScene />
        </motion.div>
      </div>
    </section>
  );
}
