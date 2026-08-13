import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, FileText, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeUp, stagger } from "@/animations/variants";
import { HeroScene } from "@/components/landing/hero-scene";
import { useAuth } from "@/contexts/AuthContext";
import { createResume } from "@/lib/resume-service";
import { toast } from "sonner";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative overflow-hidden px-4 pb-14 pt-28 sm:pb-20 sm:pt-44 lg:pb-28"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
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

          <motion.p
            variants={fadeUp}
            className="max-w-xl text-pretty text-lg text-muted-foreground"
          >
            Drag-and-drop sections, a live print-accurate preview, and a customization suite
            designers actually asked for. No templates that look like everyone else&apos;s.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
            <Button
              variant="hero"
              size="xl"
              disabled={loading || creating}
              onClick={() => {
                if (loading) return;
                if (user) {
                  // Already authenticated — create a new resume and go to questionnaire
                  setCreating(true);
                  void createResume(user.uid)
                    .then((resume) => {
                      void navigate({
                        to: "/resumes/$resumeId/questionnaire",
                        params: { resumeId: resume.id },
                      });
                    })
                    .catch((err) => {
                      console.error("Failed to create resume:", err);
                      toast.error("Couldn't create a new resume. Please try again.");
                      setCreating(false);
                    });
                } else {
                  // Not authenticated — go to login with redirect back to create flow
                  void navigate({
                    to: "/login",
                    search: { redirect: "/resumes" },
                  });
                }
              }}
            >
              {creating ? <Loader2 className="size-4 animate-spin" /> : null}
              {creating ? "Creating…" : "Create My Resume"}
              {!creating && <ArrowRight />}
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
              4.9 average
            </span>
            <span>No credit card required</span>
            <span className="hidden sm:inline">Export in one click</span>
          </motion.div>
        </motion.div>

        <motion.div style={{ y: imageY, scale: imageScale }} className="relative">
          <HeroScene />
        </motion.div>
      </div>
    </section>
  );
}
