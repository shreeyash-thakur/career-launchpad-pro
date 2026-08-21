import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { AuroraBackground } from "@/components/landing/aurora-background";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Skeleton } from "@/components/ui/skeleton";

const ResumeShowcase = lazy(() =>
  import("@/components/landing/resume-showcase").then((m) => ({ default: m.ResumeShowcase })),
);
const TemplateShowcase = lazy(() =>
  import("@/components/landing/template-showcase").then((m) => ({ default: m.TemplateShowcase })),
);
const Stats = lazy(() => import("@/components/landing/stats").then((m) => ({ default: m.Stats })));
const Benefits = lazy(() =>
  import("@/components/landing/benefits").then((m) => ({ default: m.Benefits })),
);
const Testimonials = lazy(() =>
  import("@/components/landing/testimonials").then((m) => ({ default: m.Testimonials })),
);
const Pricing = lazy(() =>
  import("@/components/landing/pricing").then((m) => ({ default: m.Pricing })),
);
const Faq = lazy(() => import("@/components/landing/faq").then((m) => ({ default: m.Faq })));
const CtaBanner = lazy(() =>
  import("@/components/landing/cta-banner").then((m) => ({ default: m.CtaBanner })),
);
const Footer = lazy(() =>
  import("@/components/landing/footer").then((m) => ({ default: m.Footer })),
);
const CursorGlow = lazy(() =>
  import("@/components/landing/cursor-glow").then((m) => ({ default: m.CursorGlow })),
);

const TITLE = "PeasiProfile — Free ATS Resume Builder with Live Vector Preview";
const DESCRIPTION =
  "Design recruiter-ready, ATS-optimized resumes with 20+ original templates, live vector preview, debounced cloud autosave, and instant free PDF export.";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "PeasiProfile",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          description: DESCRIPTION,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", ratingCount: "1284" },
        }),
      },
    ],
  }),
});

function SectionFallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <Skeleton className="mx-auto h-8 w-64 rounded-full" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}

function Landing() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative min-h-dvh"
    >
      <AuroraBackground />
      <Suspense fallback={null}>
        <CursorGlow />
      </Suspense>
      <Navbar />

      <main>
        <Hero />
        <Features />
        <Suspense fallback={<SectionFallback />}>
          <ResumeShowcase />
          <Stats />
          <TemplateShowcase />
          <Benefits />
          <Testimonials />
          <Pricing />
          <Faq />
          <CtaBanner />
        </Suspense>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </motion.div>
  );
}
