# CareerGPT — Résumé Builder

A fast, self-hosted résumé builder: a marketing landing page plus a fully working
`/builder` app with six original templates, a live print-accurate preview, and
one-click PDF export. Built with TanStack Start (React), Vite, and Tailwind CSS.
No third-party build platform, backend, or account required — everything runs
client-side and saves to your browser's local storage.

## Features

- **Six résumé templates** — Modern, Minimal, Executive, Creative (two-column),
  Developer/ATS, and Timeline — switchable instantly, all driven by the same data.
- **Live, print-accurate preview** that scales to fit your window.
- **Full section editor** — personal info + photo, summary, experience, education,
  skills, projects, certifications, languages, and unlimited custom sections.
- **Reordering** of sections and entries, undo/redo, and autosave to `localStorage`.
- **Customization** — accent color, font family (sans/serif/mono), text size, line
  spacing, page size (US Letter / A4), header alignment, and photo shape.
- **Export** — one-click "Download PDF" (via the browser's native print-to-PDF),
  plus JSON export/import for backups or moving between browsers.

## Getting started

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Then open http://localhost:3000. The landing page is at `/`, the résumé builder
is at `/builder`.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build (client, SSR, and Nitro server output to `.output/`)
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint (Prettier-formatted)
- `npm run format` — run Prettier

## Project structure

```
src/
  routes/                     # TanStack Router file-based routes (/, /builder)
  components/
    landing/                  # Marketing landing page sections
    ui/                       # shadcn/ui primitives (Radix + Tailwind)
  features/resume-builder/
    types.ts                  # ResumeData / ResumeStyle types
    sample-data.ts            # Seed data + factories
    hooks/                    # useResumeStore (autosave, undo/redo), etc.
    templates/                # The six résumé templates + shared render helpers
    components/                # Editor forms, toolbar, template picker, preview
```

## Tech stack

React 19, TanStack Start + TanStack Router, Vite, Tailwind CSS v4, Radix UI /
shadcn-style components, Framer Motion, Nitro (server build target).

## Deploying

`npm run build` produces a Nitro server bundle in `.output/`, deployable to any
Node host, or to Cloudflare/Vercel/Netlify/etc. by changing the Nitro preset in
`vite.config.ts`. The app has no required environment variables or external
services — it's fully self-contained.
