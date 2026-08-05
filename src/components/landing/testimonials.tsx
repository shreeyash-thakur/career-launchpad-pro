import { motion } from "motion/react";
import { Quote } from "lucide-react";
import { TESTIMONIALS } from "@/constants/landing";
import { fadeUp, revealOnce, stagger } from "@/animations/variants";
import { SectionHeading } from "./section-heading";

export function Testimonials() {
  return (
    <section className="section-pad px-4">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Field notes"
          title="People who stopped fighting their word processor."
        />

        <motion.ul
          variants={stagger(0.1, 0.09)}
          initial="hidden"
          whileInView="show"
          viewport={revealOnce}
          className="mt-14 grid gap-4 md:grid-cols-2"
        >
          {TESTIMONIALS.map((testimonial) => (
            <motion.li
              key={testimonial.name}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 240, damping: 20 }}
              className="glass flex flex-col gap-5 rounded-3xl p-7"
            >
              <Quote className="size-5 text-gold" />
              <blockquote className="text-pretty text-base leading-relaxed">
                “{testimonial.quote}”
              </blockquote>
              <div className="mt-auto flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-[image:var(--gradient-emerald)] font-display text-sm font-semibold text-primary-foreground">
                  {testimonial.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-medium">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
