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
      {/* Filter Trigger Button - On mobile: compact text-only 'Filter'; on desktop: with icon 'Filter by Category' */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl backdrop-blur-md shadow-md border text-[11px] sm:text-xs font-semibold transition-all duration-200 ease-out active:scale-95 cursor-pointer select-none",
            hasFilter
              ? "bg-blue-600 text-white border-blue-500 shadow-blue-600/30 ring-2 ring-blue-400/40"
              : "bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-200 border-slate-200/90 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:shadow-lg"
          )}
          aria-expanded={isOpen}
          aria-label="Filter water sources by category"
        >
          {/* Icon hidden on mobile for clean text-only display, shown on desktop */}
          <Filter className={cn("h-3.5 w-3.5 hidden sm:inline-block transition-transform duration-200", isOpen && "rotate-12", hasFilter ? "text-white" : "text-blue-500")} />
          
          {/* Mobile: compact 'Filter' or selectedCategory; Desktop: full 'Filter by Category' or selectedCategory */}
          <span className="sm:hidden">{hasFilter ? selectedCategory : "Filter"}</span>
          <span className="hidden sm:inline">{hasFilter ? selectedCategory : "Filter by Category"}</span>
        </button>

        {hasFilter && (
          <button
            onClick={() => onSelectCategory("All")}
            className="p-1.5 sm:p-2 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md border border-slate-200/90 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all duration-200 active:scale-90 active:rotate-180 cursor-pointer"
            title="Reset category filter"
            aria-label="Reset category filter"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filter Dropdown Popover - Compact on mobile (w-48), smooth buttery popover animation */}
      {isOpen && (
        <div className="absolute top-9 sm:top-11 right-0 w-48 sm:w-56 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 p-2 sm:p-2.5 shadow-2xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-200 ease-out origin-top-right">
          <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-slate-100 dark:border-slate-800/80 px-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Filter Category
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 active:scale-90 transition-transform cursor-pointer"
              aria-label="Close filter menu"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-0.5 max-h-48 sm:max-h-56 overflow-y-auto pr-0.5 scrollbar-thin">
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
                    "w-full flex items-center justify-between px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-[11px] sm:text-xs transition-all duration-150 ease-out active:scale-[0.97] cursor-pointer text-left select-none",
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold shadow-2xs"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 active:bg-slate-100 dark:active:bg-slate-800"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: markerColor }}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {isSelected && (
                    <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
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
