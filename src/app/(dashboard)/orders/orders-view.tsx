"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Search, CalendarDays, Camera, RefreshCw } from "lucide-react";
import { getOrders } from "@/actions/orders";

const statusVariants: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  estimate: "default",
  confirmed: "success",
  in_progress: "warning",
  completed: "success",
  cancelled: "destructive",
};

const eventLabels: Record<string, string> = {
  wedding: "Wedding",
  pre_wedding: "Pre-Wedding",
  engagement: "Engagement",
  birthday: "Birthday",
  corporate: "Corporate",
  other: "Other",
};

const statusTabs = [
  { key: "all", label: "All" },
  { key: "estimate", label: "Estimates" },
  { key: "confirmed", label: "Confirmed" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export function OrdersView({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState<any[]>(initialOrders || []);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Instant in-memory filtering: 0ms lag, no skeleton flash!
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) {
        return false;
      }
      if (paymentFilter !== "all" && order.paymentStatus !== paymentFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const nameMatch = order.clientName?.toLowerCase().includes(q);
        const phoneMatch = order.clientPhone?.toLowerCase().includes(q);
        const orderNumMatch = order.orderNumber?.toLowerCase().includes(q);
        const venueMatch = order.venue?.toLowerCase().includes(q);
        if (!nameMatch && !phoneMatch && !orderNumMatch && !venueMatch) {
          return false;
        }
      }
      return true;
    });
  }, [orders, statusFilter, paymentFilter, search]);

  async function handleRefresh() {
    setIsRefreshing(true);
    const res = await getOrders({ status: "all" });
    if (res.success && res.data) {
      setOrders(res.data);
    }
    setIsRefreshing(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Orders & Bookings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your shoot orders and estimates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh orders"
            className="rounded-xl border-slate-200 dark:border-slate-800"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-indigo-600" : "text-slate-500"}`} />
          </Button>
          <Link href="/orders/new">
            <Button className="gap-2 rounded-xl">
              <Plus className="h-4 w-4" />
              New Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by client name, phone, or order number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Payment Status</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === tab.key
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="py-16 text-center rounded-2xl">
          <CardContent className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10">
              <Camera className="h-7 w-7 text-indigo-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {orders.length === 0 ? "No orders found" : "No orders matching your filters"}
            </p>
            {orders.length === 0 ? (
              <Link href="/orders/new">
                <Button size="sm" className="mt-2 gap-2 rounded-xl">
                  <Plus className="h-4 w-4" /> Create First Order
                </Button>
              </Link>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setPaymentFilter("all");
                }}
                className="mt-2 rounded-xl"
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <Link key={order._id} href={`/orders/${order._id}`}>
              <Card className="hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-md transition-all cursor-pointer group mb-3 rounded-2xl">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors">
                        <CalendarDays className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {order.clientName}
                          </p>
                          <Badge variant={statusVariants[order.status] || "secondary"}>
                            {order.status.replace("_", " ")}
                          </Badge>
                          <Badge
                            variant={
                              order.paymentStatus === "paid"
                                ? "success"
                                : order.paymentStatus === "partial"
                                ? "warning"
                                : "destructive"
                            }
                            className="text-[10px]"
                          >
                            {order.paymentStatus === "paid"
                              ? "Paid"
                              : order.paymentStatus === "partial"
                              ? "Partial"
                              : "Unpaid"}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          {order.orderNumber} •{" "}
                          {order.eventType === "other" && order.customEventType
                            ? order.customEventType
                            : eventLabels[order.eventType] || order.eventType}{" "}
                          • {formatDate(order.eventDate)}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {order.servicesCount} service(s) • {order.staffCount} staff assigned
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      {order.balanceAmount > 0 ? (
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                          Balance: {formatCurrency(order.balanceAmount)}
                        </p>
                      ) : (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ Paid in full
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
