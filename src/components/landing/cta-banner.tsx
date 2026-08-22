import { motion } from "motion/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Loader2, LayoutDashboard, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeUp, revealOnce, stagger } from "@/animations/variants";
import { useAuth } from "@/contexts/AuthContext";
import { createResume } from "@/lib/resume-service";
import { useState } from "react";
import { toast } from "sonner";

export function CtaBanner() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  function handleCreateNew() {
    if (loading || !user) return;
    setCreating(true);
    void createResume(user.uid)
      .then((resume) => {
        void navigate({
          to: "/onboarding",
          search: { resumeId: resume.id },
        });
      })
      .catch((err) => {
        console.error("Failed to create resume:", err);
        toast.error("Couldn't create a new resume. Please try again.");
        setCreating(false);
      });
  }

  return (
    <section className="px-4 pb-10">
      <motion.div
        variants={stagger(0, 0.1)}
        initial="hidden"
        whileInView="show"
        viewport={revealOnce}
        className="glass-strong relative mx-auto flex max-w-6xl flex-col items-center gap-6 overflow-hidden rounded-[2rem] px-6 py-16 text-center shadow-float sm:px-14"
      >
        <div
          aria-hidden
          className="animate-blob absolute -bottom-1/2 left-1/4 h-[60%] w-[60%] rounded-full opacity-40 blur-[100px]"
          style={{ background: "var(--gradient-emerald)" }}
        />
        <motion.h2
          variants={fadeUp}
          className="relative text-balance text-3xl font-semibold sm:text-5xl"
        >
          {user ? "Ready to keep building?" : "Your next role deserves a better first impression."}
        </motion.h2>
        <motion.p variants={fadeUp} className="relative max-w-xl text-muted-foreground">
          {user
            ? "Jump back into your resumes, or start a fresh one for your next application."
            : "Start with a template, make it yours, export in a click. Free to begin, no card needed."}
        </motion.p>
        <motion.div variants={fadeUp} className="relative flex flex-wrap justify-center gap-3">
          {user ? (
            <>
              <Button variant="hero" size="xl" className="gap-2" asChild>
                <Link to="/dashboard">
                  <LayoutDashboard className="size-4" />
                  Go to My Dashboard
                  <ArrowRight />
                </Link>
              </Button>
              <Button
                variant="glass"
                size="xl"
                className="gap-2"
                disabled={creating}
                onClick={handleCreateNew}
              >
                {creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                {creating ? "Creating…" : "Create New Resume"}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="hero"
                size="xl"
                asChild
              >
                <Link to="/onboarding">
                  Create My Resume
                  <ArrowRight />
                </Link>
              </Button>
              <Button variant="glass" size="xl">
                Talk to us
              </Button>
            </>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}