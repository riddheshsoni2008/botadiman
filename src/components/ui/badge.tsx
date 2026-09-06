import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300",
        secondary: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
        success: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
        warning: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300",
        destructive: "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300",
        outline: "border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
