import { useState, type ReactNode } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AiButtonProps {
  onClick: () => Promise<void>;
  children?: ReactNode;
  className?: string;
  /** "sm" uses the standard sm Button size; "xs" renders a smaller pill via className only. */
  size?: "sm" | "xs";
  variant?: "ghost" | "outline" | "secondary";
  disabled?: boolean;
}

/**
 * A small "✦ AI" button that shows a spinner while the request is in flight
 * and surfaces errors as toasts so callers don't need to handle that.
 */
export function AiButton({
  onClick,
  children = "Write with AI",
  className,
  size = "sm",
  variant = "ghost",
  disabled = false,
}: AiButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handle() {
    if (loading || disabled) return;
    setLoading(true);
    try {
      await onClick();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "AI request failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  // "xs" is not a valid Button size variant — we always pass "sm" to Button
  // and apply extra shrinking via className when the caller wants "xs".
  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      disabled={loading || disabled}
      onClick={handle}
      className={cn(
        "gap-1.5 text-xs font-medium",
        "text-violet-600 hover:text-violet-700 hover:bg-violet-50",
        "dark:text-violet-400 dark:hover:bg-violet-950/40",
        size === "xs" && "h-7 px-2 text-[11px]",
        className,
      )}
    >
      {loading ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Sparkles className="size-3.5" />
      )}
      {loading ? "Generating…" : children}
    </Button>
  );
}