import { z } from "zod";

export const serviceTypeSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  rate: z.coerce.number().min(0, "Rate must be positive"),
  rateUnit: z.enum(["per_event", "per_day"]),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export type ServiceTypeInput = z.infer<typeof serviceTypeSchema>;
