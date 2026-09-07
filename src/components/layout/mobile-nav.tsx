"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  Camera,
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
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

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
      setOpen(false);
      router.push("/login");
      router.refresh();
    }
  };

  const drawerContent = (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in-0"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Solid Drawer Sidebar */}
      <div className="relative z-50 flex flex-col w-72 sm:w-80 h-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800 shadow-2xl animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/20">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <div className="overflow-hidden min-w-0">
              <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-tight truncate">
                {studioName || "Botadi"}
              </h2>
              <span className="text-[9px] text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-semibold block">
                Studio Manager
              </span>
            </div>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
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
                prefetch={true}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 font-semibold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <Icon
                  className={cn(
                    "h-[18px] w-[18px]",
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-400 dark:text-slate-500"
                  )}
                />
                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}
        </div>

        {/* User Card & Logout at Bottom */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/50 space-y-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-slate-700 text-xs">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="truncate flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {user.name || "Studio Staff"}
              </p>
              <span className="inline-block rounded bg-indigo-500/15 dark:bg-indigo-500/10 px-1.5 py-0.2 text-[9px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                {user.role}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200/60 dark:border-rose-900/40 transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 transition-colors cursor-pointer"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && mounted ? createPortal(drawerContent, document.body) : null}
    </>
  );
}
