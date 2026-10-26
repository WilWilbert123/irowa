// src/components/admin/category-chart.tsx
"use client";

import React from "react";
import { CATEGORY_COLORS } from "@/lib/utils/constants";

interface CategoryChartProps {
  data?: Record<string, number>;
  breakdown?: Record<string, number>;
  totalCount?: number;
  total?: number;
}

export function CategoryChart({ data, breakdown, totalCount, total: totalProp }: CategoryChartProps) {
  const chartData = breakdown || data || {};
  const total = totalProp ?? (totalCount && totalCount > 0 ? totalCount : Object.values(chartData).reduce((a, b) => a + b, 0) || 1);

  const palette = [
    { key: "River", color: "#3b82f6" },
    { key: "Waterfall", color: "#10b981" },
    { key: "Spring", color: "#14b8a6" },
    { key: "Resort", color: "#f97316" },
    { key: "Water Refilling Station", color: "#8b5cf6" },
    { key: "Public Water Source", color: "#06b6d4" },
    { key: "Deep Well", color: "#eab308" },
    { key: "Community Water Point", color: "#ec4899" },
    { key: "Other", color: "#94a3b8" },
  ];

  // Calculate SVG arc segments
  let cumulativeAngle = 0;
  const segments = palette.map((item) => {
    const count = chartData[item.key] || 0;
    const percentage = Math.round((count / total) * 100);
    const angle = (count / total) * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    return {
      ...item,
      count,
      percentage,
      startAngle,
      angle,
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-between p-2">
      {/* SVG Donut */}
      <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {segments.map((seg, i) => {
            if (seg.count === 0) return null;
            const strokeDasharray = `${(seg.angle / 360) * 251.2} 251.2`;
            const strokeDashoffset = -((seg.startAngle / 360) * 251.2);
            return (
              <circle
                key={i}
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke={seg.color}
                strokeWidth="16"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300 hover:opacity-80"
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
            {total}
          </span>
          <span className="text-[11px] font-semibold text-slate-400 mt-0.5">Total</span>
        </div>
      </div>

      {/* Legend list matching Mockup 3 */}
      <div className="flex-1 w-full space-y-2">
        {segments
          .filter((s) => s.count > 0 || ["River", "Waterfall", "Spring", "Resort", "Water Refilling Station"].includes(s.key))
          .slice(0, 7)
          .map((item) => (
            <div key={item.key} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {item.key}s
                </span>
              </div>
              <span className="text-slate-500 dark:text-slate-400 font-semibold">
                {item.count} ({item.percentage}%)
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
