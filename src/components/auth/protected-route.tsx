"use client";

import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { ReactNode } from "react";

/**
 * Wrap any route's component with this to require a signed-in user, e.g.:
 *
 *   function BuilderPage() {
 *     return (
 *       <ProtectedRoute>
 *         <BuilderContent />
 *       </ProtectedRoute>
 *     );
 *   }
 *
 * Auth state is only known client-side (Firebase Auth SDK), so this guards
 * after mount rather than in a route `beforeLoad` — it shows a brief loading
 * state, then redirects unauthenticated visitors to /login with a `redirect`
 * back to the page they came from.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (attemptedRef.current) return;
    if (!loading && !user) {
      attemptedRef.current = true;
      void navigate({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  }, [loading, user, navigate, location.href]);

  if (loading || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}