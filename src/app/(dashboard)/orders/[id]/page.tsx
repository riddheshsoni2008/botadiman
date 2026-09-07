import { getOrder } from "@/actions/orders";
import { getStudioSettings } from "@/actions/settings";
import { notFound } from "next/navigation";
import { OrderDetailView } from "./order-detail-view";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [orderRes, settingsRes] = await Promise.all([
    getOrder(id),
    getStudioSettings(),
  ]);

  if (!orderRes.success || !orderRes.data) {
    notFound();
  }

  return (
    <OrderDetailView
      id={id}
      initialOrder={orderRes.data}
      initialStudioSettings={settingsRes.success ? settingsRes.data : null}
    />
  );
}
