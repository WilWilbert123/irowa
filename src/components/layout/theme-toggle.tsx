// src/components/layout/theme-toggle.tsx
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-14 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />;
  }

  const currentTheme = resolvedTheme || theme;
  const isDark = currentTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer select-none ${
        isDark ? "bg-blue-600 border border-blue-500" : "bg-slate-200 border border-slate-300"
      } ${className || ""}`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <span className="sr-only">Toggle theme</span>
      <span
        className={`flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${
          isDark ? "translate-x-7 text-blue-600" : "translate-x-1 text-amber-500"
        }`}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5 transition-transform duration-300" />
        ) : (
          <Sun className="h-3.5 w-3.5 transition-transform duration-300" />
        )}
      </span>
    </button>
  );
}
