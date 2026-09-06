"use server";

import { connectDB } from "@/lib/db";
import { Expense } from "@/models/Expense";
import { getTenantId } from "@/lib/tenant";
import { auth } from "@/lib/auth";
import { expenseSchema } from "@/lib/validators/expense";

type ActionResult<T = null> = { success: true; data?: T } | { success: false; error: string };

export async function getExpenses(filters?: {
  startDate?: string;
  endDate?: string;
}): Promise<ActionResult<any[]>> {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    await connectDB();

    const query: any = { userId: tenantId };
    if (filters?.startDate || filters?.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = new Date(filters.startDate);
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const expenses = await Expense.find(query)
      .sort({ date: -1 })
      .lean();

    const serialized = expenses.map((e) => ({
      _id: e._id.toString(),
      date: e.date.toISOString(),
      totalAmount: e.totalAmount,
      orderId: e.orderId?.toString() || null,
      items: e.items.map((item) => ({
        _id: item._id.toString(),
        category: item.category,
        amount: item.amount,
        note: item.note || "",
      })),
      createdAt: e.createdAt.toISOString(),
    }));

    return { success: true, data: serialized };
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return { success: false, error: "Failed to fetch expenses" };
  }
}

export async function addExpense(formData: any): Promise<ActionResult> {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const validated = expenseSchema.safeParse(formData);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    await connectDB();

    const items = validated.data.items.map((item) => ({
      ...item,
      addedBy: session.user.id,
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

    await Expense.create({
      userId: tenantId,
      date: new Date(validated.data.date),
      totalAmount,
      items,
      orderId: validated.data.orderId || undefined,
    });

    return { success: true };
  } catch (error) {
    console.error("Error adding expense:", error);
    return { success: false, error: "Failed to add expense" };
  }
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    await connectDB();

    await Expense.findOneAndDelete({ _id: id, userId: tenantId });

    return { success: true };
  } catch (error) {
    console.error("Error deleting expense:", error);
    return { success: false, error: "Failed to delete expense" };
  }
}
