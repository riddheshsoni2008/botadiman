import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200 dark:shadow-indigo-900/30",
        destructive: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
        outline: "border-2 border-indigo-200 dark:border-slate-700 bg-transparent text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800",
        secondary: "bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-slate-700",
        ghost: "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100",
        link: "text-indigo-600 dark:text-indigo-400 underline-offset-4 hover:underline",
        success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3.5 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
