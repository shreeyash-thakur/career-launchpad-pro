import { Sparkles } from "lucide-react";

const COLUMNS = [
  {
    title: "Product",
    links: ["Templates", "Builder", "Pricing", "Changelog"],
  },
  {
    title: "Coming next",
    links: ["ATS scorer", "Interview coach", "Job tracker", "Portfolio generator"],
  },
  {
    title: "Company",
    links: ["About", "Privacy", "Terms", "Contact"],
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
              <span className="flex size-8 items-center justify-center rounded-xl bg-[image:var(--gradient-emerald)] text-primary-foreground">
                <Sparkles className="size-4" />
              </span>
              CareerGPT
            </a>
            <p className="max-w-xs text-sm text-muted-foreground">
              A résumé studio for people who care how their work is presented.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title} className="flex flex-col gap-3">
              <p className="text-xs uppercase tracking-[0.16em] text-gold">{column.title}</p>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#top"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="hairline" />
        <div className="flex flex-col items-center justify-between gap-2 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} CareerGPT. All rights reserved.</p>
          <p>Built for the ten-second scan.</p>
        </div>
      </div>
    </footer>
  );
}
