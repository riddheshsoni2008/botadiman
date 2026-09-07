import { getOrders } from "@/actions/orders";
import { OrdersView } from "./orders-view";

export default async function OrdersPage() {
  // Pre-render data directly on server: 0ms client fetch lag, instant HTML with UI & data together!
  const res = await getOrders({ status: "all" });
  const initialOrders = res.success && res.data ? res.data : [];

  return <OrdersView initialOrders={initialOrders} />;
}
