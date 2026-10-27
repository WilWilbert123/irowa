// src/components/map/map-category-filter.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Filter, X, Check, RotateCcw } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const hasFilter = selectedCategory !== "All";

  return (
    <div ref={containerRef} className={cn("absolute top-3 sm:top-4 right-3 sm:right-4 z-[1000]", className)}>
      {/* Filter Trigger Button */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-2 px-3.5 py-2 rounded-xl backdrop-blur-md shadow-lg border text-xs font-semibold transition-all cursor-pointer",
            hasFilter
              ? "bg-blue-600 text-white border-blue-500 shadow-blue-600/20"
              : "bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80"
          )}
          aria-expanded={isOpen}
          aria-label="Filter water sources by category"
        >
          <Filter className={cn("h-3.5 w-3.5", hasFilter ? "text-white" : "text-blue-500")} />
          <span>{hasFilter ? selectedCategory : "Filter by Category"}</span>
        </button>

        {hasFilter && (
          <button
            onClick={() => onSelectCategory("All")}
            className="p-2 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border border-slate-200/80 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title="Reset category filter"
            aria-label="Reset category filter"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filter Dropdown Popover */}
      {isOpen && (
        <div className="absolute top-11 right-0 w-64 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-100 dark:border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Filter by Category
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              aria-label="Close filter menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-0.5 max-h-60 overflow-y-auto pr-1">
            {CATEGORY_ITEMS.map((item) => {
              const isSelected = selectedCategory === item.value;
              const markerColor =
                item.value !== "All"
                  ? CATEGORY_COLORS[item.value]?.marker || "#64748b"
                  : "#0284c7";

              return (
                <button
                  key={item.value}
                  onClick={() => {
                    onSelectCategory(item.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left",
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: markerColor }}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
