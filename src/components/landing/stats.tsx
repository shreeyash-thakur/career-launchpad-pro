import { motion } from "motion/react";
import { STATS } from "@/constants/landing";
import { useCountUp } from "@/hooks/use-count-up";
import { fadeUp, revealOnce, stagger } from "@/animations/variants";

function formatValue(value: number, decimals?: number) {
  if (decimals) return value.toFixed(decimals);
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return Math.round(value).toString();
}

function Stat({
  value,
  suffix,
  label,
  decimals,
}: {
  value: number;
  suffix: string;
  label: string;
  decimals?: number;
}) {
  const { ref, value: current } = useCountUp({ to: value });

  return (
    <motion.li variants={fadeUp} className="glass rounded-3xl px-6 py-8 text-center">
      <p className="font-display text-4xl font-semibold text-gradient-emerald sm:text-5xl">
        <span ref={ref}>{formatValue(current, decimals)}</span>
        {suffix}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </motion.li>
  );
}

export function Stats() {
  return (
    <section className="relative px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="hairline mb-14" />
        <motion.ul
          variants={stagger(0, 0.09)}
          initial="hidden"
          whileInView="show"
          viewport={revealOnce}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {STATS.map((stat) => (
            <Stat
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              {...("decimals" in stat ? { decimals: stat.decimals as number } : {})}
            />
          ))}
        </motion.ul>
        <div className="hairline mt-14" />
      </div>
    </section>
  );
}
