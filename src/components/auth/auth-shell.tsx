"use client";

import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { silk } from "@/animations/variants";
import type { ReactNode, SVGProps } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Ambient background blobs — matches onboarding / builder chrome */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div
          className="animate-blob absolute -left-[15%] -top-[20%] h-[70vw] w-[70vw] rounded-full opacity-25 blur-[120px]"
          style={{ background: "var(--gradient-emerald)" }}
        />
        <div
          className="animate-blob absolute -right-[20%] top-[10%] h-[55vw] w-[55vw] rounded-full opacity-15 blur-[130px] [animation-delay:-8s]"
          style={{ background: "var(--gradient-gold)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.09] text-primary"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "68px 68px",
            maskImage: "radial-gradient(90% 60% at 50% 0%, black, transparent 85%)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: silk }}
        className="w-full max-w-md"
      >
        {/* Brand */}
        <Link
          to="/"
          className="mb-8 flex items-center justify-center gap-2 font-display text-base font-semibold"
        >
          <span className="flex size-8 items-center justify-center rounded-xl bg-[image:var(--gradient-emerald)] text-primary-foreground">
            <Sparkles className="size-4" aria-hidden="true" />
          </span>
          CareerGPT
        </Link>

        {/* Card */}
        <div className="glass-strong rounded-3xl p-8 shadow-float sm:p-10">
          <div className="mb-7 text-center">
            <h1 className="font-display text-2xl font-semibold leading-tight sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {children}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
      </motion.div>
    </div>
  );
}

export function AuthDivider() {
  return (
    <div className="my-6 flex items-center gap-3">
      <span className="hairline flex-1" />
      <span className="text-xs uppercase tracking-wide text-muted-foreground">or</span>
      <span className="hairline flex-1" />
    </div>
  );
}

export function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3.02c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.11A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54v-3.1H1.26a12 12 0 0 0 0 10.75l4.01-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.26 6.63l4.01 3.1C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

/** Shown on auth pages when .env is missing Firebase keys, instead of letting every action fail. */
export function FirebaseNotConfiguredNotice() {
  return (
    <div className="mb-6 rounded-xl border border-[color-mix(in_oklab,var(--destructive)_35%,transparent)] bg-[color-mix(in_oklab,var(--destructive)_8%,transparent)] px-4 py-3 text-sm text-foreground">
      <p className="font-medium">Firebase isn't configured yet</p>
      <p className="mt-1 text-muted-foreground">
        Copy <code className="rounded bg-secondary px-1 py-0.5 text-xs">.env.example</code> to{" "}
        <code className="rounded bg-secondary px-1 py-0.5 text-xs">.env</code>, add your Firebase
        project keys, and restart the dev server. See{" "}
        <code className="rounded bg-secondary px-1 py-0.5 text-xs">FIREBASE_SETUP.md</code> for the
        full walkthrough.
      </p>
    </div>
  );
}
