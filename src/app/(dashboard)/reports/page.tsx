import { getReportData } from "@/actions/reports";
import { ReportsView } from "./reports-view";

export default async function ReportsPage() {
  const res = await getReportData();
  const initialReport = res.success ? res.data : null;

  return <ReportsView initialReport={initialReport} />;
}
