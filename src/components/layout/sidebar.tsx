"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Wrench,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutUser } from "@/actions/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: "admin" | "staff";
  };
  studioName?: string;
}

export function Sidebar({ user, studioName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Orders / Bookings", href: "/orders", icon: CalendarDays },
    { title: "Staff / Team", href: "/staff", icon: Users },
    { title: "Services & Rates", href: "/services", icon: Wrench },
    { title: "Expenses", href: "/expenses", icon: DollarSign },
    { title: "Reports & Analytics", href: "/reports", icon: BarChart3 },
    { title: "Studio Settings", href: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    const res = await logoutUser();
    if (res.success) {
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r border-indigo-100/80 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 text-slate-900 dark:text-slate-100 backdrop-blur-xl sticky top-0 shadow-xs transition-colors duration-200">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-indigo-50 dark:border-slate-800/80">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
          <Camera className="h-5 w-5 text-white" />
        </div>
        <div className="overflow-hidden min-w-0">
          <h1 className="font-bold text-sm text-indigo-900 dark:text-indigo-300 leading-tight truncate">
            {studioName || "Botadi"}
          </h1>
          <span className="text-[9px] text-indigo-500/70 dark:text-slate-500 uppercase tracking-widest font-semibold block">
            Studio Manager
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all group",
                isActive
                  ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 font-semibold shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-indigo-50/80 dark:hover:bg-slate-800/80 hover:text-indigo-700 dark:hover:text-slate-200"
              )}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px] transition-transform group-hover:scale-110",
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-slate-300"
                )}
              />
              {item.title}
            </Link>
          );
        })}
      </div>

      {/* User / Logout */}
      <div className="p-4 border-t border-indigo-50 dark:border-slate-800/80 bg-indigo-50/30 dark:bg-slate-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-slate-700">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {user.name || "Studio Staff"}
              </p>
              <span className="inline-block rounded bg-indigo-500/15 dark:bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                {user.role}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Logout"
            className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
