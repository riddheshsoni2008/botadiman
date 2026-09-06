"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Camera } from "lucide-react";

interface NavbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: "admin" | "staff";
  };
  studioName?: string;
}

export function Navbar({ user, studioName }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-indigo-100/80 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl px-4 md:px-6 transition-colors duration-200">
      {/* Mobile: Brand + Hamburger */}
      <div className="flex items-center gap-3 md:hidden">
        <MobileNav user={user} studioName={studioName} />
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
            <Camera className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-sm text-indigo-900 dark:text-indigo-300">
            {studioName || "Botadi"}
          </span>
        </div>
      </div>

      {/* Desktop: Search / Welcome */}
      <div className="hidden md:flex items-center gap-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Welcome back, <span className="font-semibold text-slate-700 dark:text-slate-200">{user.name || "Admin"}</span>
        </p>
      </div>

      {/* Right: Theme Toggle */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
