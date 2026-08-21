import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  Layout,
  Bot,
  User,
  Settings,
  LogOut,
  Sparkles,
  Plus,
  Menu,
  X,
  ChevronRight,
  Shield,
  Loader2,
  FileSearch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { ResumeService, type FirestoreResume } from "@/lib/resume-service";
import { DashboardOverview } from "./dashboard-overview";
import { MyResumesView } from "./my-resumes-view";
import { TemplatesView } from "./templates-view";
import { AiToolsView } from "./ai-tools-view";
import { AtsCheckerView } from "./ats-checker-view";
import { ProfileView } from "./profile-view";
import { SettingsView } from "./settings-view";
import { cn } from "@/lib/utils";

type TabKey = "overview" | "resumes" | "templates" | "ats" | "ai-tools" | "profile" | "settings";

interface Props {
  initialTab?: string;
}

export function DashboardLayout({ initialTab }: Props) {
  const { user, loading: authLoading, signOut, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabKey>((initialTab as TabKey) || "overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [resumes, setResumes] = useState<FirestoreResume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [atsPreselectId, setAtsPreselectId] = useState<string | undefined>(undefined);

  const fetchResumes = useCallback(async () => {
    if (!user?.uid) {
      setResumes([]);
      setLoadingResumes(false);
      return;
    }
    try {
      const list = await ResumeService.listUserResumes(user.uid);
      setResumes(list);
    } catch (err) {
      console.error("Failed to fetch resumes:", err);
    } finally {
      setLoadingResumes(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (!authLoading) {
      void fetchResumes();
    }
  }, [authLoading, fetchResumes]);

  // initialTab only reflects the URL at first mount; if the user is already
  // on /dashboard and clicks an in-app link to /dashboard?tab=X, React
  // Router re-renders this component without remounting it, so the
  // activeTab useState initializer won't re-run. This keeps them in sync.
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab as TabKey);
    }
  }, [initialTab]);

  const handleCreateNewResume = async () => {
    if (!user?.uid) {
      // Prompt auth modal or navigate directly to onboarding for guests
      void navigate({ to: "/onboarding" });
      return;
    }

    try {
      const created = await ResumeService.createResume(user.uid, {
        title: "Untitled Resume",
        questionnaireCompleted: false,
      });
      // Navigate to onboarding questionnaire with resumeId
      void navigate({
        to: "/onboarding",
        search: { resumeId: created.id, fromDashboard: "1" },
      });
    } catch (err) {
      console.error("Failed to create new resume:", err);
      void navigate({ to: "/onboarding" });
    }
  };

  const navItems: {
    key: TabKey;
    label: string;
    icon: typeof LayoutDashboard;
    badge?: number;
  }[] = [
    { key: "overview", label: "Dashboard", icon: LayoutDashboard },
    {
      key: "resumes",
      label: "My Resumes",
      icon: FileText,
      ...(resumes.length > 0 ? { badge: resumes.length } : {}),
    },
    { key: "templates", label: "Templates", icon: Layout },
    { key: "ats", label: "ATS Score Checker", icon: FileSearch },
    { key: "ai-tools", label: "AI Career Tools", icon: Bot },
  ];

  const secondaryNavItems = [
    { key: "profile", label: "Profile", icon: User },
    { key: "settings", label: "Settings", icon: Settings },
  ] as const;

  if (authLoading) {
    return (
      <div className="flex h-svh flex-col items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="font-display text-sm font-semibold text-muted-foreground">
            Loading your PeasiProfile workspace…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      {/* ─── Desktop Sidebar ────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-border bg-card/60 backdrop-blur-xl p-4 sticky top-0 h-dvh shrink-0">
        <div className="space-y-6">
          {/* Brand Header */}
          <Link
            to="/"
            className="flex items-center gap-2.5 px-2 py-1.5 font-display text-base font-bold text-foreground hover:opacity-90 transition-opacity"
          >
            <span className="flex size-8 items-center justify-center rounded-xl bg-[image:var(--gradient-emerald)] text-primary-foreground shadow-[var(--shadow-glow)]">
              <Sparkles className="size-4" />
            </span>
            <span>PeasiProfile</span>
          </Link>

          {/* Quick Create CTA */}
          <Button
            onClick={handleCreateNewResume}
            className="w-full justify-center gap-2 bg-[image:var(--gradient-emerald)] text-primary-foreground font-semibold shadow-[var(--shadow-glow)] hover:brightness-110 hover:-translate-y-0.5 transition-all text-xs py-2.5 rounded-xl"
          >
            <Plus className="size-4" />
            Create New Resume
          </Button>

          {/* Primary Navigation */}
          <nav className="space-y-1">
            <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Workspace
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveTab(item.key)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="size-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold",
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Secondary Navigation + User Footer */}
        <div className="space-y-4 pt-4 border-t border-border/60">
          <nav className="space-y-1">
            <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Account
            </div>
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveTab(item.key)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => void signOut()}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="size-4 shrink-0" />
              <span>Log Out</span>
            </button>
          </nav>

          {/* User Mini Profile */}
          <div className="flex items-center gap-2.5 rounded-2xl bg-secondary/40 p-2.5 border border-border/50">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold truncate leading-tight">
                {user?.displayName || "Guest User"}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                {user?.email || "Guest workspace"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main Content Area ──────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile Header */}
        <header className="flex lg:hidden items-center justify-between border-b border-border bg-card/80 backdrop-blur px-4 py-3 sticky top-0 z-30">
          <Link to="/" className="flex items-center gap-2 font-display text-sm font-bold">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[image:var(--gradient-emerald)] text-primary-foreground shadow-[var(--shadow-glow)]">
              <Sparkles className="size-3.5" />
            </span>
            PeasiProfile
          </Link>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleCreateNewResume}
              className="h-8 bg-[image:var(--gradient-emerald)] text-primary-foreground text-xs font-semibold gap-1"
            >
              <Plus className="size-3.5" /> New
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              {mobileNavOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden border-b border-border bg-card p-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-border/60">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.key);
                      setMobileNavOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded-xl p-2.5 text-xs font-medium",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/40 text-muted-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("profile");
                  setMobileNavOpen(false);
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("settings");
                  setMobileNavOpen(false);
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Settings
              </button>
              <button
                type="button"
                onClick={() => void signOut()}
                className="text-xs text-destructive hover:underline"
              >
                Log Out
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Tab Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-6xl w-full mx-auto">
          {activeTab === "overview" && (
            <DashboardOverview
              resumes={resumes}
              onRefresh={fetchResumes}
              onCreateNew={handleCreateNewResume}
              onNavigateTab={(tab) => setActiveTab(tab as TabKey)}
            />
          )}

          {activeTab === "resumes" && (
            <MyResumesView
              resumes={resumes}
              onRefresh={fetchResumes}
              onCreateNew={handleCreateNewResume}
              onNavigateToAts={(resumeId) => {
                setAtsPreselectId(resumeId);
                setActiveTab("ats");
              }}
            />
          )}

          {activeTab === "templates" && <TemplatesView onRefreshResumes={fetchResumes} />}

          {activeTab === "ats" && (
            <AtsCheckerView resumes={resumes} {...(atsPreselectId ? { preselectId: atsPreselectId } : {})} />
          )}

          {activeTab === "ai-tools" && <AiToolsView />}

          {activeTab === "profile" && <ProfileView />}

          {activeTab === "settings" && <SettingsView resumes={resumes} />}
        </main>
      </div>
    </div>
  );
}