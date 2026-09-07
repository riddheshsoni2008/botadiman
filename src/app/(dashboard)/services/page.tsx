import { getServiceTypes } from "@/actions/services";
import { ServicesView } from "./services-view";

export default async function ServicesPage() {
  const res = await getServiceTypes();
  const initialServices = res.success && res.data ? res.data : [];

  return <ServicesView initialServices={initialServices} />;
}
