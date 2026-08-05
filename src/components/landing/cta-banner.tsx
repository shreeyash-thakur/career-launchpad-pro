import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeUp, revealOnce, stagger } from "@/animations/variants";

export function CtaBanner() {
  return (
    <section className="px-4 pb-10">
      <motion.div
        variants={stagger(0, 0.1)}
        initial="hidden"
        whileInView="show"
        viewport={revealOnce}
        className="glass-strong relative mx-auto flex max-w-6xl flex-col items-center gap-6 overflow-hidden rounded-[2rem] px-6 py-16 text-center shadow-float sm:px-14"
      >
        <div
          aria-hidden
          className="animate-blob absolute -bottom-1/2 left-1/4 h-[60%] w-[60%] rounded-full opacity-40 blur-[100px]"
          style={{ background: "var(--gradient-emerald)" }}
        />
        <motion.h2
          variants={fadeUp}
          className="relative text-balance text-3xl font-semibold sm:text-5xl"
        >
          Your next role deserves a better first impression.
        </motion.h2>
        <motion.p variants={fadeUp} className="relative max-w-xl text-muted-foreground">
          Start with a template, make it yours, export in a click. Free to begin, no card needed.
        </motion.p>
        <motion.div variants={fadeUp} className="relative flex flex-wrap justify-center gap-3">
          <Button variant="hero" size="xl">
            Build my résumé
            <ArrowRight />
          </Button>
          <Button variant="glass" size="xl">
            Talk to us
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
