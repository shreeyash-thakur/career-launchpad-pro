import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "motion/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu, Sparkles, User as UserIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NAV_LINKS } from "@/constants/landing";
import { silk } from "@/animations/variants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

function initialsFor(name: string | null, email: string | null): string {
  if (name?.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }
  return email?.[0]?.toUpperCase() ?? "U";
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const { user, loading, logOut } = useAuth();
  const navigate = useNavigate();

  const handleLogOut = async () => {
    try {
      await logOut();
      toast.success("Logged out");
      setOpen(false);
      void navigate({ to: "/" });
    } catch {
      toast.error("Couldn't log out. Please try again.");
    }
  };

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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
          <span className="flex size-8 items-center justify-center rounded-xl bg-[image:var(--gradient-emerald)] text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          CareerGPT
        </Link>

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
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          {!loading && user ? (
            <>
              <Button variant="hero" size="sm" className="rounded-lg" asChild>
                <Link to="/resumes">My Resumes</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="ml-1 rounded-full transition-opacity hover:opacity-80"
                    aria-label="Account menu"
                  >
                    <Avatar className="size-9 border border-border">
                      <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? ""} />
                      <AvatarFallback className="bg-[image:var(--gradient-emerald)] text-xs font-semibold text-primary-foreground">
                        {initialsFor(user.displayName, user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                  <DropdownMenuLabel className="truncate">
                    {user.displayName || user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => void handleLogOut()} className="gap-2">
                    <LogOut className="size-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="rounded-lg" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button variant="hero" size="sm" className="rounded-lg" asChild>
                <Link to="/signup">Sign up free</Link>
              </Button>
            </>
          )}
        </div>

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
                    className="block rounded-lg px-3 py-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-col gap-2">
              {user ? (
                <Button variant="hero" className="w-full rounded-xl" asChild>
                  <Link to="/resumes" onClick={() => setOpen(false)}>
                    My Resumes
                  </Link>
                </Button>
              ) : (
                <Button variant="hero" className="w-full rounded-xl" asChild>
                  <Link to="/login" onClick={() => setOpen(false)}>
                    Build my resume
                  </Link>
                </Button>
              )}
              {!loading && user ? (
                <Button
                  variant="glass"
                  className="w-full gap-2 rounded-xl"
                  onClick={() => void handleLogOut()}
                >
                  <LogOut className="size-4" />
                  Log out ({user.displayName || user.email})
                </Button>
              ) : (
                <>
                  <Button variant="glass" className="w-full rounded-xl" asChild>
                    <Link to="/login" onClick={() => setOpen(false)}>
                      <UserIcon className="size-4" />
                      Log in
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full rounded-xl" asChild>
                    <Link to="/signup" onClick={() => setOpen(false)}>
                      Sign up free
                    </Link>
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
