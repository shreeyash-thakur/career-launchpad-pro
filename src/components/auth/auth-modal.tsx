import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { Sparkles, Loader2, Mail, Lock, User, AlertCircle, ArrowRight } from "lucide-react";

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInGuest,
  } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, name.trim() || undefined);
      } else {
        await signInWithEmail(email, password);
      }
      setEmail("");
      setPassword("");
      setName("");
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Authentication failed. Please check your credentials.";
      setError(msg.replace("Firebase: ", ""));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in could not be completed.";
      setError(msg.replace("Firebase: ", ""));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuest = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signInGuest();
    } catch {
      setError("Could not initialize guest session.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="sm:max-w-md border-border bg-card/95 backdrop-blur-xl">
        <DialogHeader className="space-y-2">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[image:var(--gradient-emerald)] text-primary-foreground shadow-[var(--shadow-glow)]">
            <Sparkles className="size-6" />
          </div>
          <DialogTitle className="text-center font-display text-2xl font-bold tracking-tight">
            {isSignUp ? "Create your PeasiProfile account" : "Welcome back to PeasiProfile"}
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            {isSignUp
              ? "Save your resumes to the cloud, access them from anywhere, and download anytime for free."
              : "Sign in to access your resumes and continue editing."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          {isSignUp && (
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g. Alex Taylor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-[image:var(--gradient-emerald)] text-primary-foreground font-semibold shadow-[var(--shadow-glow)] hover:brightness-110 hover:-translate-y-0.5 transition-all gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Please wait…
              </>
            ) : isSignUp ? (
              <>
                Create Free Account <ArrowRight className="size-4" />
              </>
            ) : (
              <>
                Sign In <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-card px-2 text-muted-foreground font-medium">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={handleGoogle}
            className="w-full text-xs font-medium"
          >
            <svg className="mr-2 size-3.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Google
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={handleGuest}
            className="w-full text-xs font-medium"
          >
            <Sparkles className="mr-1.5 size-3.5 text-primary" />
            Quick Demo
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          {isSignUp ? (
            <span>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setError(null);
                }}
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setError(null);
                }}
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                Sign Up Free
              </button>
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
