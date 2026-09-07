"use client";

import { useState } from "react";
import { getReportData } from "@/actions/reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { BarChart3, TrendingUp, DollarSign, Receipt, Loader2 } from "lucide-react";

const COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6"];

const eventLabels: Record<string, string> = {
  wedding: "Wedding",
  pre_wedding: "Pre-Wedding",
  engagement: "Engagement",
  birthday: "Birthday",
  corporate: "Corporate",
  other: "Other",
};

export function ReportsView({ initialReport }: { initialReport: any }) {
  const [report, setReport] = useState<any>(initialReport);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  async function handleApply() {
    setLoading(true);
    const res = await getReportData(startDate || undefined, endDate || undefined);
    if (res.success) setReport(res.data);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Revenue, expenses, and profit analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-36 rounded-xl"
          />
          <span className="text-slate-400 text-sm">to</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-36 rounded-xl"
          />
          <Button onClick={handleApply} disabled={loading} size="sm" className="rounded-xl">
            {loading && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
            Apply
          </Button>
        </div>
      </div>

      {report ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Revenue", value: formatCurrency(report.totalRevenue), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
              { label: "Total Expenses", value: formatCurrency(report.totalExpenses), icon: TrendingUp, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-500/10" },
              { label: "Net Profit", value: formatCurrency(report.netProfit), icon: BarChart3, color: report.netProfit >= 0 ? "text-indigo-600" : "text-rose-600", bg: report.netProfit >= 0 ? "bg-indigo-50 dark:bg-indigo-500/10" : "bg-rose-50 dark:bg-rose-500/10" },
              { label: "Total Orders", value: report.totalOrdersCount.toString(), icon: Receipt, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-500/10" },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.label} className="rounded-2xl shadow-xs">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{card.label}</p>
                        <p className="text-2xl font-bold mt-1.5 text-slate-900 dark:text-white">{card.value}</p>
                      </div>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bg}`}>
                        <Icon className={`h-5 w-5 ${card.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {report.revenueTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={report.revenueTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" fontSize={10} tickFormatter={(v) => v.slice(5)} />
                      <YAxis fontSize={10} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]} />
                      <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-12">No revenue data for this period</p>
                )}
              </CardContent>
            </Card>

            {/* Orders by Event Type */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Revenue by Event Type</CardTitle>
              </CardHeader>
              <CardContent>
                {report.ordersByEventType.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={report.ordersByEventType.map((o: any) => ({
                          name: eventLabels[o.eventType] || o.eventType,
                          value: o.revenue,
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {report.ordersByEventType.map((_: any, i: number) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-12">No order data for this period</p>
                )}
              </CardContent>
            </Card>

            {/* Expenses by Category */}
            <Card className="lg:col-span-2 rounded-2xl">
              <CardHeader>
                <CardTitle>Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {report.expensesByCategory.length > 0 ? (
                  <div className="space-y-3">
                    {report.expensesByCategory.map((cat: any, i: number) => (
                      <div key={cat.category} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-40 truncate">{cat.category}</span>
                        <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, (cat.amount / (report.totalExpenses || 1)) * 100)}%`,
                              backgroundColor: COLORS[i % COLORS.length],
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 w-24 text-right">
                          {formatCurrency(cat.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-8">No expenses recorded</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <p className="text-slate-500 text-center py-12">Failed to load report data</p>
      )}
    </div>
  );
}
