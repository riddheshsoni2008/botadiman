"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className="rounded-xl p-2.5 text-slate-500 opacity-60"
        aria-label="Theme toggle"
      >
        <Sun className="h-5 w-5 text-amber-400" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-xl p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 cursor-pointer"
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5 text-indigo-600" />
      ) : (
        <Sun className="h-5 w-5 text-amber-400" />
      )}
    </button>
  );
}
