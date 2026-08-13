import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — CareerGPT" },
      {
        name: "description",
        content: "Log in to CareerGPT to access your saved resumes and account.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to pick up right where you left off."
      footer={
        <>
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign up for free
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
