// src/components/ui/badge.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20",
    secondary: "border-transparent bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
    destructive: "border-transparent bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20",
    outline: "text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800",
    success: "border-transparent bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20",
    warning: "border-transparent bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
