import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "motion/react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Menu,
  Sparkles,
  X,
  User,
  LayoutDashboard,
  FileText,
  Bot,
  LogOut,
  Plus,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NAV_LINKS } from "@/constants/landing";
import { silk } from "@/animations/variants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

export function Navbar() {
  const { user, openAuthModal, signOut } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleStartBuilding = () => {
    if (!user) {
      openAuthModal(() => {
        void navigate({ to: "/onboarding" });
      });
    } else {
      void navigate({ to: "/onboarding" });
    }
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: silk }}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4"
    >
      <nav
        aria-label="Main"
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-3 transition-all duration-500",
          scrolled ? "glass-strong shadow-float" : "border border-transparent",
        )}
      >
        <Link to="/" className="flex items-center gap-2 font-display text-base font-semibold">
          <span className="flex size-8 items-center justify-center rounded-xl bg-[image:var(--gradient-emerald)] text-primary-foreground shadow-[var(--shadow-glow)]">
            <Sparkles className="size-4" />
          </span>
          <span className="font-bold">PeasiProfile</span>
        </Link>

        {/* Desktop Links */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
          {user && (
            <li>
              <Link
                to="/dashboard"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80 flex items-center gap-1.5"
              >
                <LayoutDashboard className="size-4" />
                My Dashboard
              </Link>
            </li>
          )}
        </ul>

        {/* Right Actions */}
        <div className="hidden items-center gap-2 md:flex">
          {!user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-semibold"
                onClick={() => openAuthModal()}
              >
                Log In
              </Button>
              <Button
                variant="hero"
                size="sm"
                className="rounded-xl shadow-[var(--shadow-glow)] text-xs font-semibold gap-1.5"
                onClick={handleStartBuilding}
              >
                <Sparkles className="size-3.5" />
                Create My Resume
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="hero"
                size="sm"
                className="rounded-xl shadow-[var(--shadow-glow)] text-xs font-semibold gap-1.5"
                asChild
              >
                <Link to="/onboarding">
                  <Plus className="size-3.5" />
                  Create Resume
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl gap-2 text-xs font-medium pl-2 pr-3"
                  >
                    <div className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-[11px]">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
                    </div>
                    <span className="max-w-[90px] truncate">{user.displayName || "Account"}</span>
                    <ChevronDown className="size-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild className="gap-2 text-xs">
                    <Link to="/dashboard">
                      <LayoutDashboard className="size-3.5" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="gap-2 text-xs">
                    <Link to="/dashboard" search={{ tab: "resumes" }}>
                      <FileText className="size-3.5" /> My Resumes
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="gap-2 text-xs">
                    <Link to="/dashboard" search={{ tab: "ai-tools" }}>
                      <Bot className="size-3.5" /> AI Career Tools
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="gap-2 text-xs">
                    <Link to="/dashboard" search={{ tab: "profile" }}>
                      <User className="size-3.5" /> Profile &amp; Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => void signOut()}
                    className="gap-2 text-xs text-destructive focus:text-destructive"
                  >
                    <LogOut className="size-3.5" /> Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <Button
          variant="glass"
          size="icon"
          className="rounded-xl md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: silk }}
            className="glass-strong mx-auto mt-2 max-w-6xl rounded-2xl p-4 md:hidden"
          >
            <ul className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              {user && (
                <li>
                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-primary hover:bg-secondary"
                  >
                    <LayoutDashboard className="size-4" />
                    My Dashboard
                  </Link>
                </li>
              )}
            </ul>

            <div className="mt-4 flex flex-col gap-2 pt-3 border-t border-border/60">
              {!user ? (
                <>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl text-xs font-semibold"
                    onClick={() => {
                      setOpen(false);
                      openAuthModal();
                    }}
                  >
                    Log In
                  </Button>
                  <Button
                    variant="hero"
                    className="w-full rounded-xl text-xs font-semibold shadow-[var(--shadow-glow)]"
                    onClick={() => {
                      setOpen(false);
                      handleStartBuilding();
                    }}
                  >
                    Create My Resume
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="hero"
                    className="w-full rounded-xl text-xs font-semibold"
                    asChild
                  >
                    <Link to="/onboarding" onClick={() => setOpen(false)}>
                      <Plus className="size-3.5 mr-1.5" />
                      Create New Resume
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full rounded-xl text-xs text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setOpen(false);
                      void signOut();
                    }}
                  >
                    Log Out
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
