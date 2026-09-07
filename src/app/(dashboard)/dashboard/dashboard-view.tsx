"use client";

import { useState } from "react";
import Link from "next/link";
import { getDashboardMetrics } from "@/actions/reports";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  DollarSign,
  CalendarDays,
  FileText,
  TrendingUp,
  Camera,
  ArrowRight,
  Clock,
  MapPin,
  Users,
  Loader2,
} from "lucide-react";

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

export function DashboardView({ initialMetrics }: { initialMetrics: any }) {
  const [metrics, setMetrics] = useState<any>(initialMetrics);
  const [period, setPeriod] = useState<"today" | "month" | "year">("month");
  const [isUpdating, setIsUpdating] = useState(false);

  async function handlePeriodChange(p: "today" | "month" | "year") {
    if (p === period || isUpdating) return;
    setPeriod(p);
    setIsUpdating(true);
    const res = await getDashboardMetrics(p);
    if (res.success && res.data) {
      setMetrics(res.data);
    }
    setIsUpdating(false);
  }

  const kpis = metrics
    ? [
        {
          label: "Revenue",
          value: formatCurrency(metrics.periodRevenue ?? 0),
          sub: `${metrics.periodOrdersCount ?? 0} orders`,
          icon: DollarSign,
          color: "text-emerald-600 dark:text-emerald-400",
          bg: "bg-emerald-50 dark:bg-emerald-500/10",
        },
        {
          label: "Expenses",
          value: formatCurrency(metrics.periodExpenses ?? 0),
          sub: period === "month" ? "This month" : period === "today" ? "Today" : "This year",
          icon: TrendingUp,
          color: "text-rose-600 dark:text-rose-400",
          bg: "bg-rose-50 dark:bg-rose-500/10",
        },
        {
          label: "Net Profit",
          value: formatCurrency(metrics.periodProfit ?? 0),
          sub: `${metrics.periodMargin ?? 0}% margin`,
          icon: DollarSign,
          color: "text-indigo-600 dark:text-indigo-400",
          bg: "bg-indigo-50 dark:bg-indigo-500/10",
        },
        {
          label: "Pending Estimates",
          value: `${metrics.estimatesCount ?? metrics.pendingEstimates ?? 0}`,
          sub: formatCurrency(metrics.estimatesValue ?? 0),
          icon: FileText,
          color: "text-amber-600 dark:text-amber-400",
          bg: "bg-amber-50 dark:bg-amber-500/10",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header with period toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Studio overview and key metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(["today", "month", "year"] as const).map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              disabled={isUpdating}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                period === p
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {isUpdating && period === p ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              {p === "today" ? "Today" : p === "month" ? "This Month" : "This Year"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="relative overflow-hidden rounded-2xl shadow-xs">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {kpi.label}
                    </p>
                    <p className="text-2xl font-bold mt-1.5 text-slate-900 dark:text-white">
                      {kpi.value}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{kpi.sub}</p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.bg}`}>
                    <Icon className={`h-5 w-5 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Shoots */}
          <Card className="rounded-2xl">
            <div className="p-5 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-indigo-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">Upcoming Shoots</h3>
              </div>
              <Link href="/orders?status=confirmed">
                <Button variant="ghost" size="sm" className="text-xs rounded-lg">
                  View All <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
            <CardContent className="space-y-3">
              {metrics.upcomingShoots.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">
                  No upcoming shoots scheduled
                </p>
              ) : (
                metrics.upcomingShoots.map((shoot: any) => (
                  <Link
                    key={shoot._id}
                    href={`/orders/${shoot._id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50/50 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/10">
                        <Camera className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                          {shoot.clientName}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                          <Badge variant="secondary" className="text-[10px]">
                            {eventLabels[shoot.eventType] || shoot.eventType}
                          </Badge>
                          {shoot.venue && (
                            <span className="flex items-center gap-0.5">
                              <MapPin className="h-3 w-3" />
                              {shoot.venue}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {formatDate(shoot.eventDate)}
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
                        <Users className="h-3 w-3" /> {shoot.staffCount} assigned
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="rounded-2xl">
            <div className="p-5 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-violet-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">Recent Orders</h3>
              </div>
              <Link href="/orders">
                <Button variant="ghost" size="sm" className="text-xs rounded-lg">
                  View All <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
            <CardContent className="space-y-2">
              {metrics.recentOrders.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">
                  No orders yet
                </p>
              ) : (
                metrics.recentOrders.map((order: any) => (
                  <Link
                    key={order._id}
                    href={`/orders/${order._id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {order.clientName}
                        </p>
                        <Badge variant={statusVariants[order.status] || "secondary"} className="text-[10px]">
                          {order.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {order.orderNumber} • {eventLabels[order.eventType] || order.eventType}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/orders/new">
          <Button className="gap-2 rounded-xl">
            <CalendarDays className="h-4 w-4" />
            New Order / Estimate
          </Button>
        </Link>
        <Link href="/staff">
          <Button variant="outline" className="gap-2 rounded-xl">
            <Users className="h-4 w-4" />
            Manage Staff
          </Button>
        </Link>
        <Link href="/reports">
          <Button variant="secondary" className="gap-2 rounded-xl">
            <TrendingUp className="h-4 w-4" />
            View Reports
          </Button>
        </Link>
      </div>
    </div>
  );
}
