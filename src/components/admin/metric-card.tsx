// src/components/admin/metric-card.tsx
import React from "react";
import { ArrowUpRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  className?: string;
  badge?: string;
}

export function MetricCard({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  iconColor = "text-blue-500",
  iconBg = "bg-blue-50 dark:bg-blue-950/40",
  className,
  badge,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3 transition-all hover:border-slate-300 dark:hover:border-slate-700",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", iconBg, iconColor)}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {value}
        </span>
        {badge && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {badge}
          </span>
        )}
      </div>

      {change && (
        <div
          className={cn(
            "flex items-center gap-1 text-[11px] font-semibold",
            isPositive
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-amber-600 dark:text-amber-400"
          )}
        >
          {isPositive && <ArrowUpRight className="h-3.5 w-3.5" />}
          <span>{change}</span>
        </div>
      )}
    </div>
  );
}
