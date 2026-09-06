import { z } from "zod";

export const expenseItemSchema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z.coerce.number().min(0, "Amount must be positive"),
  note: z.string().optional().default(""),
});

export const expenseSchema = z.object({
  date: z.string().min(1, "Date is required"),
  items: z.array(expenseItemSchema).min(1, "At least one expense item is required"),
  orderId: z.string().optional(),
});

export type ExpenseItemInput = z.infer<typeof expenseItemSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
