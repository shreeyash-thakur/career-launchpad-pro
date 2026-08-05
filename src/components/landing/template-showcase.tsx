import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "@/constants/landing";
import { fadeUp, revealOnce, stagger } from "@/animations/variants";
import { SectionHeading } from "./section-heading";
import { TiltCard } from "./tilt-card";
import { Button } from "@/components/ui/button";

export function TemplateShowcase() {
  return (
    <section id="templates" className="section-pad relative px-4">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Templates"
          title="Twenty-five originals. Not one of them generic."
          description="Each layout is drawn from scratch with its own typographic system, then stress-tested against real résumé content."
        />

        <motion.ul
          variants={stagger(0.05, 0.03)}
          initial="hidden"
          whileInView="show"
          viewport={revealOnce}
          className="mt-10 flex flex-wrap justify-center gap-2"
        >
          {TEMPLATE_CATEGORIES.map((category) => (
            <motion.li key={category} variants={fadeUp}>
              <span className="glass inline-flex rounded-full px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
                {category}
              </span>
            </motion.li>
          ))}
        </motion.ul>

        <motion.ul
          variants={stagger(0.1, 0.07)}
          initial="hidden"
          whileInView="show"
          viewport={revealOnce}
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {TEMPLATES.map((template) => (
            <motion.li key={template.name} variants={fadeUp}>
              <TiltCard className="rounded-3xl" intensity={8}>
                <article className="glass overflow-hidden rounded-3xl p-3">
                  <div className="aspect-[1/1.32] overflow-hidden rounded-2xl bg-[oklch(0.97_0.01_95)] p-4">
                    <div
                      className="h-8 w-full rounded-md"
                      style={{
                        background:
                          template.accent === "gold"
                            ? "var(--gradient-gold)"
                            : "var(--gradient-emerald)",
                      }}
                    />
                    <div className="mt-3 flex gap-3">
                      <div className="flex w-1/3 flex-col gap-1.5">
                        {Array.from({ length: 7 }).map((_, i) => (
                          <div
                            key={i}
                            className="h-1.5 rounded-full bg-[oklch(0.2_0.02_165_/_16%)]"
                          />
                        ))}
                      </div>
                      <div className="flex flex-1 flex-col gap-1.5">
                        {Array.from({ length: 11 }).map((_, i) => (
                          <div
                            key={i}
                            className="h-1.5 rounded-full bg-[oklch(0.2_0.02_165_/_12%)]"
                            style={{ width: `${70 + ((i * 13) % 30)}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-2 pb-1 pt-3">
                    <div>
                      <h3 className="font-display text-sm font-semibold">{template.name}</h3>
                      <p className="text-xs text-muted-foreground">{template.category}</p>
                    </div>
                    <ArrowUpRight className="size-4 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                </article>
              </TiltCard>
            </motion.li>
          ))}
        </motion.ul>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={revealOnce}
          className="mt-10 flex justify-center"
        >
          <Button variant="glass" size="xl">
            See all 25 templates
            <ArrowUpRight />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
