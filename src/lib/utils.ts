import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date | number, formatStr: string = "dd MMM yyyy"): string {
  if (!date) return "";
  try {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    return format(d, formatStr);
  } catch {
    return String(date);
  }
}

export function formatDateTime(date: string | Date | number): string {
  return formatDate(date, "dd MMM yyyy, hh:mm a");
}

export function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `BTD-${year}${month}-${random}`;
}
