"use server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { getTenantId } from "@/lib/tenant";
import { orderSchema } from "@/lib/validators/order";
import { generateOrderNumber, calculatePaymentStatus } from "@/lib/utils";

type ActionResult<T = null> = { success: true; data?: T } | { success: false; error: string };

export async function createOrder(formData: any): Promise<ActionResult<{ id: string }>> {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    const validated = orderSchema.safeParse(formData);
    if (!validated.success) {
      return { success: false, error: validated.error.issues?.[0]?.message || validated.error.message };
    }

    await connectDB();

    const { services, discount, advancePayment, ...rest } = validated.data;

    const subtotal = services.reduce((sum, s) => sum + s.quantity * s.rate, 0);
    const totalAmount = Math.max(0, subtotal - (discount || 0));
    const balanceAmount = Math.max(0, totalAmount - (advancePayment || 0));
    const paymentStatus = calculatePaymentStatus(totalAmount, advancePayment || 0);

    const orderServices = services.map((s) => ({
      serviceType: s.serviceTypeId && s.serviceTypeId !== "other" && mongoose.Types.ObjectId.isValid(s.serviceTypeId)
        ? new mongoose.Types.ObjectId(s.serviceTypeId)
        : undefined,
      name: s.name,
      quantity: s.quantity,
      rate: s.rate,
      rateUnit: s.rateUnit,
      total: s.quantity * s.rate,
    }));

    const order = await Order.create({
      userId: tenantId,
      orderNumber: generateOrderNumber(),
      ...rest,
      eventDate: new Date(rest.eventDate),
      eventEndDate: rest.eventEndDate ? new Date(rest.eventEndDate) : undefined,
      services: orderServices,
      subtotal,
      discount: discount || 0,
      totalAmount,
      advancePayment: advancePayment || 0,
      balanceAmount,
      paymentStatus,
    });

    return { success: true, data: { id: order._id.toString() } };
  } catch (error) {
    console.error("Error creating order:", error);
    return { success: false, error: "Failed to create order" };
  }
}

export async function getOrders(filters?: {
  status?: string;
  paymentStatus?: string;
  eventType?: string;
  search?: string;
}): Promise<ActionResult<any[]>> {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    await connectDB();

    const query: any = { userId: tenantId };
    if (filters?.status && filters.status !== "all") {
      query.status = filters.status;
    }
    if (filters?.paymentStatus && filters.paymentStatus !== "all") {
      query.paymentStatus = filters.paymentStatus;
    }
    if (filters?.eventType && filters.eventType !== "all") {
      query.eventType = filters.eventType;
    }
    if (filters?.search) {
      query.$or = [
        { clientName: { $regex: filters.search, $options: "i" } },
        { clientPhone: { $regex: filters.search, $options: "i" } },
        { orderNumber: { $regex: filters.search, $options: "i" } },
      ];
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const serialized = orders.map((o) => {
      const paymentStatus = o.paymentStatus || calculatePaymentStatus(o.totalAmount, o.advancePayment || 0);
      return {
        _id: o._id.toString(),
        orderNumber: o.orderNumber,
        clientName: o.clientName,
        clientPhone: o.clientPhone,
        eventType: o.eventType,
        customEventType: (o as any).customEventType || "",
        eventDate: o.eventDate.toISOString(),
        status: o.status,
        totalAmount: o.totalAmount,
        advancePayment: o.advancePayment || 0,
        balanceAmount: o.balanceAmount ?? Math.max(0, o.totalAmount - (o.advancePayment || 0)),
        paymentStatus,
        servicesCount: o.services.length,
        staffCount: o.assignedStaff.length,
        createdAt: o.createdAt.toISOString(),
      };
    });

    return { success: true, data: serialized };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { success: false, error: "Failed to fetch orders" };
  }
}

export async function getOrder(id: string): Promise<ActionResult<any>> {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    await connectDB();

    const order = await Order.findOne({ _id: id, userId: tenantId }).lean();
    if (!order) return { success: false, error: "Order not found" };

    const paymentStatus = order.paymentStatus || calculatePaymentStatus(order.totalAmount, order.advancePayment || 0);

    const serialized = {
      _id: order._id.toString(),
      orderNumber: order.orderNumber,
      clientName: order.clientName,
      clientPhone: order.clientPhone,
      clientEmail: order.clientEmail || "",
      clientAddress: order.clientAddress || "",
      eventType: order.eventType,
      customEventType: (order as any).customEventType || "",
      eventDate: order.eventDate.toISOString(),
      eventEndDate: order.eventEndDate?.toISOString() || "",
      venue: order.venue || "",
      status: order.status,
      services: order.services.map((s) => ({
        serviceType: s.serviceType ? s.serviceType.toString() : "",
        name: s.name,
        quantity: s.quantity,
        rate: s.rate,
        rateUnit: s.rateUnit,
        total: s.total,
      })),
      assignedStaff: order.assignedStaff.map((a) => ({
        staff: a.staff.toString(),
        name: a.name,
        role: a.role,
        serviceSlot: a.serviceSlot || "",
      })),
      subtotal: order.subtotal,
      discount: order.discount,
      totalAmount: order.totalAmount,
      advancePayment: order.advancePayment || 0,
      balanceAmount: order.balanceAmount ?? Math.max(0, order.totalAmount - (order.advancePayment || 0)),
      paymentStatus,
      notes: order.notes || "",
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };

    return { success: true, data: serialized };
  } catch (error) {
    console.error("Error fetching order:", error);
    return { success: false, error: "Failed to fetch order" };
  }
}

export async function updateOrder(id: string, formData: any): Promise<ActionResult> {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    const validated = orderSchema.safeParse(formData);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    await connectDB();

    const { services, discount, advancePayment, ...rest } = validated.data;

    const subtotal = services.reduce((sum, s) => sum + s.quantity * s.rate, 0);
    const totalAmount = Math.max(0, subtotal - (discount || 0));
    const balanceAmount = Math.max(0, totalAmount - (advancePayment || 0));
    const paymentStatus = calculatePaymentStatus(totalAmount, advancePayment || 0);

    const orderServices = services.map((s) => ({
      serviceType: s.serviceTypeId && s.serviceTypeId !== "other" && mongoose.Types.ObjectId.isValid(s.serviceTypeId)
        ? new mongoose.Types.ObjectId(s.serviceTypeId)
        : undefined,
      name: s.name,
      quantity: s.quantity,
      rate: s.rate,
      rateUnit: s.rateUnit,
      total: s.quantity * s.rate,
    }));

    await Order.findOneAndUpdate(
      { _id: id, userId: tenantId },
      {
        ...rest,
        eventDate: new Date(rest.eventDate),
        eventEndDate: rest.eventEndDate ? new Date(rest.eventEndDate) : undefined,
        services: orderServices,
        subtotal,
        discount: discount || 0,
        totalAmount,
        advancePayment: advancePayment || 0,
        balanceAmount,
        paymentStatus,
      }
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating order:", error);
    return { success: false, error: "Failed to update order" };
  }
}

export async function updateOrderPayment(id: string, advancePayment: number): Promise<ActionResult> {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    await connectDB();
    const order = await Order.findOne({ _id: id, userId: tenantId });
    if (!order) return { success: false, error: "Order not found" };

    const safePayment = Math.max(0, Number(advancePayment) || 0);
    const balanceAmount = Math.max(0, order.totalAmount - safePayment);
    const paymentStatus = calculatePaymentStatus(order.totalAmount, safePayment);

    order.advancePayment = safePayment;
    order.balanceAmount = balanceAmount;
    order.paymentStatus = paymentStatus;
    await order.save();

    return { success: true };
  } catch (error) {
    console.error("Error updating order payment:", error);
    return { success: false, error: "Failed to update payment" };
  }
}

export async function updateOrderStatus(id: string, status: string): Promise<ActionResult> {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    await connectDB();

    const order = await Order.findOne({ _id: id, userId: tenantId });
    if (!order) return { success: false, error: "Order not found" };

    if (status === "in_progress") {
      const totalRequired = order.services.reduce((sum, s) => sum + (s.quantity || 1), 0);
      const assigned = order.assignedStaff?.length || 0;
      if (assigned < totalRequired) {
        const remaining = totalRequired - assigned;
        return {
          success: false,
          error: `Cannot start work: ${remaining} more staff member(s) must be assigned to fulfill all ${totalRequired} booked services.`,
        };
      }
    }

    order.status = status as any;
    await order.save();

    return { success: true };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, error: "Failed to update status" };
  }
}

export async function assignStaffToOrder(
  orderId: string,
  assignments: { staffId: string; name: string; role: string; serviceSlot?: string }[]
): Promise<ActionResult> {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    await connectDB();

    const assignedStaff = assignments.map((a) => ({
      staff: a.staffId,
      name: a.name,
      role: a.role,
      serviceSlot: a.serviceSlot || "",
    }));

    await Order.findOneAndUpdate(
      { _id: orderId, userId: tenantId },
      { assignedStaff }
    );

    return { success: true };
  } catch (error) {
    console.error("Error assigning staff:", error);
    return { success: false, error: "Failed to assign staff" };
  }
}

export async function deleteOrder(id: string): Promise<ActionResult> {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    await connectDB();

    await Order.findOneAndDelete({ _id: id, userId: tenantId });

    return { success: true };
  } catch (error) {
    console.error("Error deleting order:", error);
    return { success: false, error: "Failed to delete order" };
  }
}
