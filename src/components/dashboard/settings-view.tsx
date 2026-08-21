import React, { useState } from "react";
import { LogOut, Download, Trash2, Shield, Moon, Sun, Laptop, FileJson, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/auth-context";
import { downloadJson } from "@/features/resume-builder/utils/export";
import type { FirestoreResume } from "@/lib/resume-service";

interface Props {
  resumes: FirestoreResume[];
}

export function SettingsView({ resumes }: Props) {
  const { user, signOut } = useAuth();
  const [exported, setExported] = useState(false);

  const handleExportAll = () => {
    downloadJson(`peasiprofile-backup-${Date.now()}.json`, {
      user: {
        uid: user?.uid,
        email: user?.email,
        displayName: user?.displayName,
      },
      exportedAt: new Date().toISOString(),
      resumes,
    });
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Account &amp; Workspace Settings
        </h1>
        <p className="text-xs text-muted-foreground">
          Manage your account preferences, export data backups, and session details.
        </p>
      </div>

      {/* Plan Card */}
      <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Current Tier
            </span>
            <h3 className="font-display text-lg font-bold text-foreground">
              PeasiProfile Free Plan
            </h3>
          </div>
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-600">
            Active
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          You have full access to unlimited resumes, 20+ ATS-optimized templates, vector PDF
          downloads, and AI utilities free forever.
        </p>
      </div>

      {/* Data Backup Card */}
      <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
        <div className="space-y-1">
          <h3 className="font-display text-base font-bold">Data Export &amp; Backup</h3>
          <p className="text-xs text-muted-foreground">
            Download all your resumes and profile information in standard JSON format.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportAll}
          className="gap-2 text-xs font-medium"
        >
          {exported ? (
            <>
              <Check className="size-3.5 text-emerald-600" /> Backup Downloaded
            </>
          ) : (
            <>
              <FileJson className="size-3.5 text-primary" /> Export All Resumes (JSON)
            </>
          )}
        </Button>
      </div>

      {/* Session Management */}
      <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
        <div className="space-y-1">
          <h3 className="font-display text-base font-bold">Session</h3>
          <p className="text-xs text-muted-foreground">
            Signed in as{" "}
            <strong className="text-foreground">
              {user?.email || user?.displayName || "Guest"}
            </strong>
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => void signOut()}
          className="gap-2 text-xs text-muted-foreground hover:text-destructive"
        >
          <LogOut className="size-3.5" /> Sign Out
        </Button>
      </div>

      {/* Danger Zone */}
      <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 space-y-4">
        <div className="space-y-1">
          <h3 className="font-display text-base font-bold text-destructive">Danger Zone</h3>
          <p className="text-xs text-muted-foreground">
            Reset or clear your local cache. This will log you out of your current session.
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="text-xs gap-2">
              <Trash2 className="size-3.5" /> Clear Local Session
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear local session?</AlertDialogTitle>
              <AlertDialogDescription>
                This will sign you out and clear your cached drafts. Cloud resumes in Firestore will
                remain safe.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  void signOut();
                }}
              >
                Proceed &amp; Sign Out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
