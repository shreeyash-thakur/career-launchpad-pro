import { motion } from "motion/react";
import { Check } from "lucide-react";
import { PRICING } from "@/constants/landing";
import { fadeUp, revealOnce, stagger } from "@/animations/variants";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";
import { cn } from "@/lib/utils";

export function Pricing() {
  return (
    <section id="pricing" className="section-pad px-4">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Pricing"
          title="Free to build. Paid when it pays you back."
          description="Cancel any time. Your documents stay yours either way."
        />

        <motion.ul
          variants={stagger(0.1, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={revealOnce}
          className="mt-14 grid items-start gap-5 lg:grid-cols-3"
        >
          {PRICING.map((plan) => (
            <motion.li
              key={plan.name}
              variants={fadeUp}
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 240, damping: 20 }}
              className={cn(
                "relative flex flex-col gap-6 rounded-3xl p-8",
                plan.featured ? "glass-strong shadow-glow lg:-my-4 lg:py-12" : "glass",
              )}
            >
              {plan.featured ? (
                <span className="absolute -top-3 left-8 rounded-full bg-[image:var(--gradient-gold)] px-3 py-1 text-xs font-semibold text-gold-foreground">
                  Most chosen
                </span>
              ) : null}

              <div>
                <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <p className="flex items-baseline gap-2">
                <span className="font-display text-4xl font-semibold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </p>

              <ul className="flex flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.featured ? "hero" : "glass"}
                size="xl"
                className="mt-auto w-full"
              >
                {plan.cta}
              </Button>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
