import { getDashboardMetrics } from "@/actions/reports";
import { DashboardView } from "./dashboard-view";

export default async function DashboardPage() {
  // Pre-render metrics directly on server for instant first paint
  const res = await getDashboardMetrics("month");
  const initialMetrics = res.success ? res.data : null;

  return <DashboardView initialMetrics={initialMetrics} />;
}
