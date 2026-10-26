// src/components/admin/metric-card.tsx
import React from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  isPositive = true,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 transition-colors",
        className
      )}
    >
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
        {title}
      </span>
      <div className="flex items-baseline justify-between">
        <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {value}
        </span>
      </div>
      {change && (
        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <ArrowUpRight className="h-3.5 w-3.5" />
          <span>{change}</span>
        </div>
      )}
    </div>
  );
}
