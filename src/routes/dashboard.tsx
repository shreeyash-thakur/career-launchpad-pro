import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export const Route = createFileRoute("/dashboard")({
  validateSearch: (search: Record<string, unknown>): { tab?: string } => ({
    tab: typeof search["tab"] === "string" ? search["tab"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Dashboard — PeasiProfile" },
      {
        name: "description",
        content:
          "Manage your resumes, browse ATS templates, and access AI career tools in your PeasiProfile workspace.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const search = Route.useSearch();
  return <DashboardLayout initialTab={search.tab} />;
}
