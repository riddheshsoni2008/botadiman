"use server";

import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Expense } from "@/models/Expense";
import { getTenantId } from "@/lib/tenant";
import { auth } from "@/lib/auth";

type ActionResult<T = null> = { success: true; data?: T } | { success: false; error: string };

type DashboardPeriod = "today" | "month" | "year";

interface DashboardMetrics {
  periodLabel: string;
  periodRevenue: number;
  periodOrdersCount: number;
  periodExpenses: number;
  totalOrders: number;
  pendingEstimates: number;
  upcomingShoots: any[];
  recentOrders: any[];
}

function getPeriodRange(period: DashboardPeriod): { start: Date; end: Date; label: string } {
  const now = new Date();
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  switch (period) {
    case "month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      const monthName = now.toLocaleString("en-IN", { month: "long", year: "numeric" });
      return { start, end, label: monthName };
    }
    case "year": {
      const start = new Date(now.getFullYear(), 0, 1);
      start.setHours(0, 0, 0, 0);
      return { start, end, label: `Year ${now.getFullYear()}` };
    }
    case "today":
    default: {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      return { start, end, label: "Today" };
    }
  }
}

export async function getDashboardMetrics(
  period: DashboardPeriod = "today"
): Promise<ActionResult<DashboardMetrics>> {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    await connectDB();

    const { start, end, label } = getPeriodRange(period);
    const now = new Date();

    const [
      periodRevenueAgg,
      periodExpensesAgg,
      totalOrdersCount,
      pendingEstimatesCount,
      upcomingShoots,
      recentOrders,
    ] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            userId: tenantId,
            status: { $in: ["confirmed", "completed"] },
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
      ]),
      Expense.aggregate([
        { $match: { userId: tenantId, date: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$totalAmount" },
          },
        },
      ]),
      Order.countDocuments({ userId: tenantId }),
      Order.countDocuments({ userId: tenantId, status: "estimate" }),
      Order.find({
        userId: tenantId,
        eventDate: { $gte: now },
        status: { $in: ["confirmed", "in_progress"] },
      })
        .sort({ eventDate: 1 })
        .limit(5)
        .select("orderNumber clientName eventType eventDate venue assignedStaff")
        .lean(),
      Order.find({ userId: tenantId })
        .sort({ createdAt: -1 })
        .limit(8)
        .select("orderNumber clientName eventType totalAmount status createdAt")
        .lean(),
    ]);

    return {
      success: true,
      data: {
        periodLabel: label,
        periodRevenue: periodRevenueAgg[0]?.totalAmount || 0,
        periodOrdersCount: periodRevenueAgg[0]?.count || 0,
        periodExpenses: periodExpensesAgg[0]?.totalAmount || 0,
        totalOrders: totalOrdersCount,
        pendingEstimates: pendingEstimatesCount,
        upcomingShoots: upcomingShoots.map((s: any) => ({
          _id: s._id.toString(),
          orderNumber: s.orderNumber,
          clientName: s.clientName,
          eventType: s.eventType,
          eventDate: s.eventDate.toISOString(),
          venue: s.venue || "",
          staffCount: s.assignedStaff?.length || 0,
        })),
        recentOrders: recentOrders.map((o: any) => ({
          _id: o._id.toString(),
          orderNumber: o.orderNumber,
          clientName: o.clientName,
          eventType: o.eventType,
          totalAmount: o.totalAmount,
          status: o.status,
          createdAt: o.createdAt.toISOString(),
        })),
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    return { success: false, error: "Failed to load dashboard metrics" };
  }
}

interface ReportData {
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalOrdersCount: number;
  totalExpenses: number;
  netProfit: number;
  revenueTrend: Array<{ date: string; revenue: number; count: number }>;
  expensesByCategory: Array<{ category: string; amount: number }>;
  ordersByEventType: Array<{ eventType: string; count: number; revenue: number }>;
}

export async function getReportData(
  startDateStr?: string,
  endDateStr?: string
): Promise<ActionResult<ReportData>> {
  try {
    const session = await auth();
    const tenantId = await getTenantId();
    if (!session?.user || !tenantId) return { success: false, error: "Unauthorized" };

    await connectDB();

    const now = new Date();
    const defaultStart = new Date();
    defaultStart.setDate(now.getDate() - 30);
    defaultStart.setHours(0, 0, 0, 0);

    const startDate = startDateStr ? new Date(startDateStr) : defaultStart;
    const endDate = endDateStr ? new Date(endDateStr) : now;
    endDate.setHours(23, 59, 59, 999);

    const [revenueTrendAgg, eventTypeAgg, expensesAgg] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            userId: tenantId,
            status: { $in: ["confirmed", "completed"] },
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        {
          $match: {
            userId: tenantId,
            status: { $in: ["confirmed", "completed"] },
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: "$eventType",
            count: { $sum: 1 },
            revenue: { $sum: "$totalAmount" },
          },
        },
        { $sort: { revenue: -1 } },
      ]),
      Expense.aggregate([
        { $match: { userId: tenantId, date: { $gte: startDate, $lte: endDate } } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.category",
            amount: { $sum: "$items.amount" },
          },
        },
        { $sort: { amount: -1 } },
      ]),
    ]);

    let totalRevenue = 0;
    let totalOrdersCount = 0;
    const revenueTrend = revenueTrendAgg.map((item) => {
      totalRevenue += item.revenue;
      totalOrdersCount += item.count;
      return { date: item._id, revenue: item.revenue, count: item.count };
    });

    let totalExpenses = 0;
    const expensesByCategory = expensesAgg.map((item) => {
      totalExpenses += item.amount;
      return { category: item._id, amount: item.amount };
    });

    const ordersByEventType = eventTypeAgg.map((item) => ({
      eventType: item._id,
      count: item.count,
      revenue: item.revenue,
    }));

    return {
      success: true,
      data: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalRevenue,
        totalOrdersCount,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        revenueTrend,
        expensesByCategory,
        ordersByEventType,
      },
    };
  } catch (error) {
    console.error("Error in getReportData:", error);
    return { success: false, error: "Failed to generate report" };
  }
}
