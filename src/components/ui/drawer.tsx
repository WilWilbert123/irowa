// src/components/ui/drawer.tsx
"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export function Drawer({ open, onOpenChange, children, className }: DrawerProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => onOpenChange(false)}
      />

      {/* Drawer surface */}
      <div
        className={cn(
          "relative z-50 w-full rounded-t-3xl bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-5 pb-8 shadow-2xl transition-transform animate-in slide-in-from-bottom duration-200 max-h-[85vh] overflow-y-auto",
          className
        )}
      >
        <div className="mx-auto w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mb-4" />
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          aria-label="Close drawer"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
}
