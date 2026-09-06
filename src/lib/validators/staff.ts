import { z } from "zod";

export const staffSchema = z.object({
  name: z.string().min(1, "Staff name is required"),
  phone: z.string().optional().default(""),
  email: z.string().email().optional().or(z.literal("")),
  role: z.enum(["photographer", "cinematographer", "videographer", "drone_operator", "editor", "assistant", "other"]),
  specialization: z.string().optional().default(""),
  dailyRate: z.coerce.number().min(0, "Charge must be positive").optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export type StaffInput = z.infer<typeof staffSchema>;
