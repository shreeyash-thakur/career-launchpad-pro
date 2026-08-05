import { motion } from "motion/react";
import { Check, GripVertical, Layers, Palette, Type } from "lucide-react";
import { fadeUp, revealOnce, stagger } from "@/animations/variants";
import { SectionHeading } from "./section-heading";

const SECTIONS = ["Profile", "Experience", "Projects", "Education", "Skills", "Certificates"];
const CONTROLS = [
  { icon: Type, label: "Typeface", value: "Space Grotesk" },
  { icon: Palette, label: "Accent", value: "Emerald" },
  { icon: Layers, label: "Pages", value: "2 · A4" },
];

/** Interactive-feeling mock of the builder canvas. */
export function ResumeShowcase() {
  return (
    <section className="section-pad relative px-4">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="The builder"
          title="Edit on the left. Watch the page respond on the right."
          description="Sections snap into order, pages reflow live, and every change is saved before you finish the sentence."
        />

        <motion.div
          variants={stagger(0.1, 0.12)}
          initial="hidden"
          whileInView="show"
          viewport={revealOnce}
          className="glass-strong mt-14 grid gap-6 rounded-[2rem] p-4 shadow-float sm:p-6 lg:grid-cols-[0.85fr_1.15fr]"
        >
          {/* Editor rail */}
          <motion.div variants={fadeUp} className="flex flex-col gap-4">
            <div className="glass rounded-2xl p-4">
              <p className="mb-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Sections
              </p>
              <ul className="flex flex-col gap-2">
                {SECTIONS.map((section, i) => (
                  <motion.li
                    key={section}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={revealOnce}
                    transition={{ delay: i * 0.06, duration: 0.5 }}
                    whileHover={{ x: 4 }}
                    className="flex cursor-grab items-center gap-3 rounded-xl bg-secondary/60 px-3 py-2.5 text-sm"
                  >
                    <GripVertical className="size-4 text-muted-foreground" />
                    {section}
                    <Check className="ml-auto size-3.5 text-primary" />
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="glass grid grid-cols-1 gap-2 rounded-2xl p-4 sm:grid-cols-3 lg:grid-cols-1">
              {CONTROLS.map((control) => (
                <div key={control.label} className="flex items-center gap-3 rounded-xl px-1 py-2">
                  <control.icon className="size-4 text-gold" />
                  <span className="text-xs text-muted-foreground">{control.label}</span>
                  <span className="ml-auto text-xs font-medium">{control.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Live preview page */}
          <motion.div variants={fadeUp} className="relative">
            <div
              aria-hidden
              className="absolute -inset-6 rounded-[2.5rem] opacity-60 blur-3xl"
              style={{ background: "var(--gradient-hero)" }}
            />
            <div className="relative aspect-[1/1.32] w-full overflow-hidden rounded-2xl bg-[oklch(0.97_0.01_95)] p-7 text-[oklch(0.2_0.02_165)] shadow-float sm:p-10">
              <div className="flex items-start justify-between border-b border-[oklch(0.2_0.02_165_/_15%)] pb-5">
                <div>
                  <p className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                    Priya Nair
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] opacity-70">
                    Senior Product Engineer
                  </p>
                </div>
                <div className="size-12 rounded-full bg-[oklch(0.68_0.132_164)] sm:size-14" />
              </div>

              {[
                { title: "Experience", rows: 3 },
                { title: "Projects", rows: 2 },
                { title: "Education", rows: 1 },
              ].map((block) => (
                <div key={block.title} className="mt-5">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[oklch(0.45_0.09_164)]">
                    {block.title}
                  </p>
                  <div className="mt-2 flex flex-col gap-2">
                    {Array.from({ length: block.rows }).map((_, i) => (
                      <div key={i} className="flex flex-col gap-1.5">
                        <div className="h-2 w-1/2 rounded-full bg-[oklch(0.2_0.02_165_/_35%)]" />
                        <div className="h-1.5 w-full rounded-full bg-[oklch(0.2_0.02_165_/_14%)]" />
                        <div className="h-1.5 w-4/5 rounded-full bg-[oklch(0.2_0.02_165_/_14%)]" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <motion.div
                animate={{ opacity: [1, 0.15, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="absolute bottom-10 left-10 h-4 w-[2px] bg-[oklch(0.45_0.09_164)]"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
