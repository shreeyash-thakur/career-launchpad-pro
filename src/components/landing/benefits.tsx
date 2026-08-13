import { motion } from "motion/react";
import { BENEFITS } from "@/constants/landing";
import { fadeUp, revealOnce, stagger } from "@/animations/variants";
import { SectionHeading } from "./section-heading";

export function Benefits() {
  return (
    <section className="section-pad px-4">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <SectionHeading
          align="left"
          eyebrow="Why it works"
          title="Designed around how recruiters actually read."
          description="Ten seconds decides most applications. Every default here is tuned to win those ten seconds."
          className="max-w-lg"
        />

        <motion.ul
          variants={stagger(0.1, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={revealOnce}
          className="flex flex-col gap-4"
        >
          {BENEFITS.map((benefit) => (
            <motion.li
              key={benefit.title}
              variants={fadeUp}
              whileHover={{ x: 6 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="glass flex gap-5 rounded-3xl p-6"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-gold">
                <benefit.icon className="size-5" />
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold">{benefit.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {benefit.body}
                </p>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
