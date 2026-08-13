import { motion } from "motion/react";
import { FEATURES } from "@/constants/landing";
import { fadeUp, revealOnce, stagger } from "@/animations/variants";
import { SectionHeading } from "./section-heading";
import { TiltCard } from "./tilt-card";

export function Features() {
  return (
    <section id="features" className="section-pad relative px-4">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="The craft"
          title="Everything a serious résumé needs. Nothing it doesn't."
          description="A builder engineered like a design tool: fast, precise, and quiet enough to let you think."
        />

        <motion.ul
          variants={stagger(0.1, 0.08)}
          initial="hidden"
          whileInView="show"
          viewport={revealOnce}
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((feature) => (
            <motion.li key={feature.title} variants={fadeUp}>
              <TiltCard className="h-full rounded-3xl">
                <div className="glass relative flex h-full flex-col gap-4 rounded-3xl p-7 transition-colors duration-500 hover:border-[color-mix(in_oklab,var(--primary)_40%,transparent)]">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[image:var(--gradient-emerald)] text-primary-foreground shadow-glow">
                    <feature.icon className="size-5" />
                  </span>
                  <h3 className="font-display text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
                </div>
              </TiltCard>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
