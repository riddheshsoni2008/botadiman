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
    <header className="sticky top-0 z-30 flex h-15 items-center justify-between border-b border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 sm:px-4 md:px-6 shadow-xs transition-colors duration-200">
      {/* Mobile: Hamburger & Studio Brand */}
      <div className="flex items-center gap-2.5 md:hidden">
        <MobileNav user={user} studioName={studioName} />
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm shadow-indigo-500/20">
            <Camera className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-none truncate max-w-[150px] sm:max-w-[200px]">
              {studioName || "Botadi"}
            </span>
            <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-semibold tracking-wider uppercase mt-0.5">
              Studio
            </span>
          </div>
        </div>
      </div>

      {/* Desktop: Greeting & Studio Info */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Active Studio:{" "}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {studioName || "Botadi Studio"}
            </span>
          </p>
        </div>
        <span className="text-slate-300 dark:text-slate-700">|</span>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Welcome back,{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {user.name || "Admin"}
          </span>
        </p>
      </div>

      {/* Right Actions: Theme Toggle & Quick Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        
        {/* User Pill Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold text-xs shadow-xs">
            {user.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
              {user.name || "Admin"}
            </span>
            <span className="text-[9px] text-slate-400 uppercase font-medium">
              {user.role || "admin"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
