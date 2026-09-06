import { z } from "zod";

export const orderServiceSchema = z.object({
  serviceTypeId: z.string().optional().default(""),
  name: z.string().min(1, "Service name is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  rate: z.coerce.number().min(0, "Rate must be positive"),
  rateUnit: z.enum(["per_event", "per_day"]).default("per_event"),
  total: z.coerce.number().min(0),
});

export const orderSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  clientPhone: z.string().min(1, "Phone number is required"),
  clientEmail: z.string().email().optional().or(z.literal("")),
  clientAddress: z.string().optional().default(""),
  eventType: z.enum(["wedding", "pre_wedding", "engagement", "birthday", "corporate", "other"]),
  customEventType: z.string().optional().default(""),
  eventDate: z.string().min(1, "Event date is required"),
  eventEndDate: z.string().optional().default(""),
  venue: z.string().optional().default(""),
  services: z.array(orderServiceSchema).min(1, "At least one service is required"),
  discount: z.coerce.number().min(0).optional().default(0),
  advancePayment: z.coerce.number().min(0).optional().default(0),
  notes: z.string().optional().default(""),
  status: z.enum(["estimate", "confirmed", "in_progress", "completed", "cancelled"]).optional().default("estimate"),
});

export const assignStaffSchema = z.object({
  orderId: z.string().min(1),
  assignments: z.array(z.object({
    staffId: z.string().min(1),
    name: z.string().min(1),
    role: z.string().min(1),
    serviceSlot: z.string().optional().default(""),
  })),
});

export type OrderServiceInput = z.infer<typeof orderServiceSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type AssignStaffInput = z.infer<typeof assignStaffSchema>;
