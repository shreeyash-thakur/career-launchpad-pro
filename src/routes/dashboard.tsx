import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { stripUndefined } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  validateSearch: (search: Record<string, unknown>): { tab?: string } =>
    stripUndefined({
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
  return <DashboardLayout {...(search.tab ? { initialTab: search.tab } : {})} />;
}