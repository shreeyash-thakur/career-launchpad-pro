import { motion } from "motion/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQS } from "@/constants/landing";
import { fadeUp, revealOnce, stagger } from "@/animations/variants";
import { SectionHeading } from "./section-heading";

export function Faq() {
  return (
    <section id="faq" className="section-pad px-4">
      <div className="mx-auto max-w-3xl">
        <SectionHeading eyebrow="Questions" title="Everything else you might be wondering." />

        <motion.div
          variants={stagger(0.1, 0.06)}
          initial="hidden"
          whileInView="show"
          viewport={revealOnce}
          className="mt-12"
        >
          <Accordion type="single" collapsible className="flex flex-col gap-3">
            {FAQS.map((faq, i) => (
              <motion.div key={faq.q} variants={fadeUp}>
                <AccordionItem
                  value={`item-${i}`}
                  className="glass rounded-2xl border-none px-5 data-[state=open]:shadow-glow"
                >
                  <AccordionTrigger className="text-left font-display text-base hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
