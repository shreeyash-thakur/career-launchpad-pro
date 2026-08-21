import { Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Templates", href: "#templates" },
      { label: "Builder", href: "/onboarding" },
      { label: "Features", href: "#features" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "AI Career Tools",
    links: [
      { label: "Bullet Point Enhancer", href: "/dashboard" },
      { label: "Summary Generator", href: "/dashboard" },
      { label: "Keyword Matcher", href: "/dashboard" },
      { label: "Action Verbs", href: "/dashboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#top" },
      { label: "Privacy Policy", href: "#top" },
      { label: "Terms of Service", href: "#top" },
      { label: "Contact", href: "#top" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="px-4 pb-10">
      <div className="mx-auto max-w-6xl">
        <div className="hairline" />
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="flex flex-col gap-3">
            <a href="#top" className="flex items-center gap-2 font-display font-semibold">
              <span className="flex size-8 items-center justify-center rounded-xl bg-[image:var(--gradient-emerald)] text-primary-foreground shadow-[var(--shadow-glow)]">
                <Sparkles className="size-4" />
              </span>
              <span className="font-bold">PeasiProfile</span>
            </a>
            <p className="max-w-xs text-sm text-muted-foreground">
              A modern resume workspace and ATS studio designed for clean presentation and fast
              hiring results.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title} className="flex flex-col gap-3">
              <p className="text-xs uppercase tracking-[0.16em] text-gold">{column.title}</p>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="hairline" />
        <div className="flex flex-col items-center justify-between gap-2 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} PeasiProfile. All rights reserved.</p>
          <p>Free ATS Resume Builder &amp; Career Workspace.</p>
        </div>
      </div>
    </footer>
  );
}
