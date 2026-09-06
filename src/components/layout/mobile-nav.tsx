"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  CalendarDays,
  Users,
  Wrench,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutUser } from "@/actions/auth";
import { toast } from "sonner";

interface MobileNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: "admin" | "staff";
  };
  studioName?: string;
}

export function MobileNav({ user, studioName }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Orders", href: "/orders", icon: CalendarDays },
    { title: "Staff", href: "/staff", icon: Users },
    { title: "Services", href: "/services", icon: Wrench },
    { title: "Expenses", href: "/expenses", icon: DollarSign },
    { title: "Reports", href: "/reports", icon: BarChart3 },
    { title: "Settings", href: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    const res = await logoutUser();
    if (res.success) {
      toast.success("Logged out");
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-indigo-900 dark:text-indigo-300">
                {studioName || "Botadi"}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-semibold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    {item.title}
                  </Link>
                );
              })}
            </nav>

            <div className="absolute bottom-4 left-4 right-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="h-[18px] w-[18px]" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
