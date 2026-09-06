"use server";

import { connectDB } from "@/lib/db";
import { Staff } from "@/models/Staff";
import { Order } from "@/models/Order";
import { getTenantId } from "@/lib/tenant";
import { staffSchema } from "@/lib/validators/staff";

type ActionResult<T = null> = { success: true; data?: T } | { success: false; error: string };

export async function getStaffMembers(): Promise<ActionResult<any[]>> {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    await connectDB();

    const staff = await Staff.find({ userId: tenantId })
      .sort({ createdAt: -1 })
      .lean();

    const serialized = staff.map((s) => ({
      _id: s._id.toString(),
      name: s.name,
      phone: s.phone || "",
      email: s.email || "",
      role: s.role,
      specialization: s.specialization || "",
      dailyRate: s.dailyRate || 0,
      isActive: s.isActive,
    }));

    return { success: true, data: serialized };
  } catch (error) {
    console.error("Error fetching staff:", error);
    return { success: false, error: "Failed to fetch staff" };
  }
}

export async function createStaff(formData: any): Promise<ActionResult> {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    const validated = staffSchema.safeParse(formData);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    await connectDB();

    await Staff.create({
      userId: tenantId,
      ...validated.data,
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating staff:", error);
    return { success: false, error: "Failed to create staff member" };
  }
}

export async function updateStaff(id: string, formData: any): Promise<ActionResult> {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    const validated = staffSchema.safeParse(formData);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    await connectDB();

    await Staff.findOneAndUpdate(
      { _id: id, userId: tenantId },
      validated.data
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating staff:", error);
    return { success: false, error: "Failed to update staff member" };
  }
}

export async function deleteStaff(id: string): Promise<ActionResult> {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    await connectDB();

    await Staff.findOneAndDelete({ _id: id, userId: tenantId });

    return { success: true };
  } catch (error) {
    console.error("Error deleting staff:", error);
    return { success: false, error: "Failed to delete staff member" };
  }
}

export async function getStaffAvailability(dateStr: string): Promise<ActionResult<any[]>> {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    await connectDB();

    const date = new Date(dateStr);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Find all orders on this date that have assigned staff
    const ordersOnDate = await Order.find({
      userId: tenantId,
      eventDate: { $lte: endOfDay },
      $or: [
        { eventEndDate: { $gte: startOfDay } },
        { eventEndDate: { $exists: false } },
        { eventEndDate: null },
      ],
      status: { $in: ["confirmed", "in_progress"] },
      "assignedStaff.0": { $exists: true },
    }).select("assignedStaff orderNumber eventType").lean();

    const busyStaffIds = new Set<string>();
    const assignments: Record<string, { orderNumber: string; eventType: string }> = {};

    ordersOnDate.forEach((order) => {
      order.assignedStaff.forEach((as: any) => {
        const staffId = as.staff.toString();
        busyStaffIds.add(staffId);
        assignments[staffId] = {
          orderNumber: order.orderNumber,
          eventType: order.eventType,
        };
      });
    });

    const allStaff = await Staff.find({ userId: tenantId, isActive: true }).lean();

    const availability = allStaff.map((s) => ({
      _id: s._id.toString(),
      name: s.name,
      role: s.role,
      dailyRate: s.dailyRate || 0,
      isAvailable: !busyStaffIds.has(s._id.toString()),
      assignedTo: assignments[s._id.toString()] || null,
    }));

    return { success: true, data: availability };
  } catch (error) {
    console.error("Error checking staff availability:", error);
    return { success: false, error: "Failed to check availability" };
  }
}
