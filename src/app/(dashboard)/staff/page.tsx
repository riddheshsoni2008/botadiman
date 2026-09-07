import { getStaffMembers } from "@/actions/staff";
import { StaffView } from "./staff-view";

export default async function StaffPage() {
  const res = await getStaffMembers();
  const initialStaff = res.success && res.data ? res.data : [];

  return <StaffView initialStaff={initialStaff} />;
}
