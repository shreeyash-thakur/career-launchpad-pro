import { motion } from "motion/react";
import { fadeUp, revealOnce, stagger } from "@/animations/variants";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <motion.div
      variants={stagger(0, 0.09)}
      initial="hidden"
      whileInView="show"
      viewport={revealOnce}
      className={cn(
        "flex max-w-2xl flex-col gap-4",
        align === "center" && "mx-auto items-center text-center",
        className,
      )}
    >
      <motion.span
        variants={fadeUp}
        className="glass inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-gold"
      >
        {eyebrow}
      </motion.span>
      <motion.h2
        variants={fadeUp}
        className="text-balance text-3xl font-semibold leading-[1.1] sm:text-4xl md:text-5xl"
      >
        {title}
      </motion.h2>
      {description ? (
        <motion.p variants={fadeUp} className="text-pretty text-base text-muted-foreground">
          {description}
        </motion.p>
      ) : null}
    </motion.div>
  );
}
