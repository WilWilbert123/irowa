// src/components/map/map-category-filter.tsx
"use client";

import React, { useState } from "react";
import { Filter, X, Check } from "lucide-react";
import { WaterCategory } from "@/types/database.types";
import { CATEGORY_COLORS } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";

interface MapCategoryFilterProps {
  selectedCategory: WaterCategory | "All";
  onSelectCategory: (category: WaterCategory | "All") => void;
  className?: string;
}

const CATEGORY_ITEMS: Array<{ label: string; value: WaterCategory | "All" }> = [
  { label: "All Categories", value: "All" },
  { label: "Rivers", value: "River" },
  { label: "Waterfalls", value: "Waterfall" },
  { label: "Springs", value: "Spring" },
  { label: "Resorts", value: "Resort" },
  { label: "Water Refilling Stations", value: "Water Refilling Station" },
  { label: "Public Water Points", value: "Public Water Source" },
  { label: "Deep Wells", value: "Deep Well" },
  { label: "Community Water Points", value: "Community Water Point" },
  { label: "Other", value: "Other" },
];

export function MapCategoryFilter({
  selectedCategory,
  onSelectCategory,
  className,
}: MapCategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "absolute top-4 right-4 z-[1000] flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 transition-all",
          className
        )}
      >
        <Filter className="h-4 w-4 text-blue-500" />
        <span>Filter by Category</span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "absolute top-4 right-4 z-[1000] w-64 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-4 shadow-xl transition-all",
        className
      )}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-blue-500" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Filter by Category
          </h4>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          aria-label="Close filter"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="pt-2 space-y-1 max-h-64 overflow-y-auto pr-1">
        {CATEGORY_ITEMS.map((item) => {
          const isSelected = selectedCategory === item.value;
          const markerColor =
            item.value !== "All"
              ? CATEGORY_COLORS[item.value]?.marker || "#64748b"
              : "#0284c7";

          return (
            <button
              key={item.value}
              onClick={() => onSelectCategory(item.value)}
              className={cn(
                "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left",
                isSelected
                  ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: markerColor }}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {isSelected && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
