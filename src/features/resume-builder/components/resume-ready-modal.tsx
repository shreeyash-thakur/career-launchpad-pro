import React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Download,
  LayoutDashboard,
  PlusCircle,
  CheckCircle2,
  Sparkles,
  FileText,
} from "lucide-react";
import { printResume } from "../utils/export";
import type { PageSize } from "../types";

interface ResumeReadyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageSize: PageSize;
  resumeTitle?: string;
  onNewResume?: () => void;
}

export function ResumeReadyModal({
  open,
  onOpenChange,
  pageSize,
  resumeTitle,
  onNewResume,
}: ResumeReadyModalProps) {
  const navigate = useNavigate();

  const handleDownloadAgain = () => {
    printResume(pageSize);
  };

  const handleGoDashboard = () => {
    onOpenChange(false);
    void navigate({ to: "/dashboard" });
  };

  const handleCreateAnother = () => {
    onOpenChange(false);
    if (onNewResume) {
      onNewResume();
    } else {
      void navigate({ to: "/onboarding" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-card/95 backdrop-blur-xl">
        <DialogHeader className="space-y-3 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[image:var(--gradient-emerald)] text-primary-foreground shadow-[var(--shadow-glow)]">
            <Sparkles className="size-7" />
          </div>
          <DialogTitle className="font-display text-2xl font-bold tracking-tight">
            Your resume is ready 🎉
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {resumeTitle ? (
              <span className="font-medium text-foreground">&ldquo;{resumeTitle}&rdquo;</span>
            ) : (
              "Your document"
            )}{" "}
            has been compiled at print-accurate vector quality. 100% Free.
          </DialogDescription>
        </DialogHeader>

        <div className="my-2 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs text-muted-foreground space-y-1.5">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            <span>Recruiter &amp; ATS-ready formatting confirmed</span>
          </div>
          <p className="pl-6 text-[11px]">
            Clean semantic structure allows automated Applicant Tracking Systems to accurately parse
            your experience and skills.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <Button
            variant="hero"
            size="lg"
            className="w-full gap-2 font-semibold shadow-[var(--shadow-glow)]"
            onClick={handleDownloadAgain}
          >
            <Download className="size-4" />
            Download PDF
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2 text-sm font-medium"
            onClick={handleGoDashboard}
          >
            <LayoutDashboard className="size-4 text-primary" />
            Go to Dashboard
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={handleCreateAnother}
          >
            <PlusCircle className="size-3.5" />
            Create another resume
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
