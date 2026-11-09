// src/components/admin/circle-icon-picker.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  CIRCLE_ICON_PRESETS,
  CIRCLE_COLOR_SWATCHES,
  CircleIconPreset,
  getDefaultCircleIconForCategory,
  getCircleIconPreset,
} from "@/lib/map/circle-icons";
import { Sparkles, Search, Check, RefreshCw, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface CircleIconPickerProps {
  selectedIconId?: string;
  selectedColor?: string;
  category?: string;
  resourceName?: string;
  onChange: (iconId: string, color: string) => void;
  className?: string;
}

export function CircleIconPicker({
  selectedIconId,
  selectedColor,
  category,
  resourceName,
  onChange,
  className,
}: CircleIconPickerProps) {
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState<string>("all");

  // Determine current active preset
  const activePreset = useMemo(() => {
    return getCircleIconPreset(selectedIconId, category, resourceName);
  }, [selectedIconId, category, resourceName]);

  const currentColor = selectedColor || activePreset.defaultColor || "#2563eb";

  // Filter presets by group and search query
  const filteredPresets = useMemo(() => {
    return CIRCLE_ICON_PRESETS.filter((preset) => {
      if (activeGroup !== "all" && preset.group !== activeGroup) {
        return false;
      }
      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      return (
        preset.label.toLowerCase().includes(q) ||
        preset.description.toLowerCase().includes(q) ||
        preset.category.toLowerCase().includes(q) ||
        preset.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [activeGroup, search]);

  const handleSelectIcon = (preset: CircleIconPreset) => {
    // If user hasn't manually picked a custom color yet, adopt preset's natural color
    const nextColor = selectedColor || preset.defaultColor;
    onChange(preset.id, nextColor);
  };

  const handleSelectColor = (colorHex: string) => {
    onChange(activePreset.id, colorHex);
  };

  const handleResetToDefault = () => {
    const def = getDefaultCircleIconForCategory(category, resourceName);
    onChange(def.iconId, def.color);
  };

  return (
    <div className={cn("space-y-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 p-4 sm:p-5 border border-border/80 shadow-2xs", className)}>
      {/* Top Header & Live Preview */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">Map Circle Marker Icon</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-900/60">
              26 Custom Styles
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Customise the circular pin displayed on the citizen and admin satellite maps.
          </p>
        </div>

        {/* Live Marker Preview Card */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-950 px-3.5 py-2 rounded-xl border border-border shadow-xs">
          <div className="relative flex flex-col items-center">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-slate-800 ring-2 ring-black/10 transition-colors duration-200"
              style={{ backgroundColor: currentColor }}
            >
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                dangerouslySetInnerHTML={{ __html: activePreset.svgPath }}
              />
            </div>
            <div
              className="w-2 h-2 rounded-full -mt-0.5 border border-white/70 shadow-2xs"
              style={{ backgroundColor: currentColor }}
            />
          </div>

          <div className="text-left">
            <div className="text-xs font-bold text-foreground leading-tight">{activePreset.label}</div>
            <div className="text-[10px] text-muted-foreground font-mono">{currentColor}</div>
          </div>

          <button
            type="button"
            onClick={handleResetToDefault}
            title="Auto-match with Category and Name"
            className="ml-1 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1 text-[11px] font-medium"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden md:inline">Auto</span>
          </button>
        </div>
      </div>

      {/* Dedicated Color Customizer Panel */}
      <div className="space-y-3 p-3.5 rounded-xl bg-white/80 dark:bg-slate-950/70 border border-border/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-foreground">Customize Circle Color</div>
              <div className="text-[11px] text-muted-foreground">
                Select a preset swatch or enter any custom hex code
              </div>
            </div>
          </div>

          {/* Custom Hex Code Input & Color Spectrum Picker */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center rounded-lg border border-input bg-background px-2.5 py-1 shadow-2xs">
              <span className="text-xs text-muted-foreground font-mono mr-1">#</span>
              <input
                type="text"
                value={currentColor.replace(/^#/, "")}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  if (/^[0-9A-Fa-f]{0,6}$/.test(val)) {
                    handleSelectColor(`#${val}`);
                  }
                }}
                maxLength={6}
                placeholder="2563EB"
                className="w-18 bg-transparent text-xs font-mono font-bold uppercase focus:outline-none text-foreground"
                title="Enter Hex Color Code"
              />
            </div>

            <div className="relative flex items-center">
              <input
                type="color"
                value={currentColor.length === 7 ? currentColor : "#2563eb"}
                onChange={(e) => handleSelectColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border border-border bg-transparent p-0.5 shadow-2xs hover:scale-105 transition-transform"
                title="Open Color Wheel / Spectrum"
              />
            </div>
          </div>
        </div>

        {/* 18 Swatch Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {CIRCLE_COLOR_SWATCHES.map((swatch) => {
            const isChosen = currentColor.toLowerCase() === swatch.value.toLowerCase();
            return (
              <button
                key={swatch.value}
                type="button"
                onClick={() => handleSelectColor(swatch.value)}
                title={`${swatch.label} (${swatch.value})`}
                className={cn(
                  "group relative w-7 h-7 rounded-full border-2 border-white dark:border-slate-800 shadow-xs transition-transform hover:scale-120 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary",
                  isChosen && "ring-2 ring-blue-600 scale-110 shadow-md"
                )}
                style={{ backgroundColor: swatch.value }}
              >
                {isChosen && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-[11px]">
          {[
            { id: "all", label: "All (26)" },
            { id: "nature", label: "Nature & Springs" },
            { id: "rivers", label: "Rivers & Lakes" },
            { id: "recreation", label: "Resorts & Pools" },
            { id: "infrastructure", label: "Pumps & Wells" },
            { id: "drinking", label: "Drinking Water" },
            { id: "advisory", label: "Pins & Alerts" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveGroup(tab.id)}
              className={cn(
                "px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors",
                activeGroup === tab.id
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-background/80 hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[140px] sm:w-44">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search icon..."
            className="w-full h-8 pl-8 pr-2.5 rounded-lg border border-input bg-background text-xs focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid of 26 Circle Icon Presets */}
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2 max-h-[290px] overflow-y-auto p-1 rounded-xl bg-background/50 border border-border/60">
        {filteredPresets.map((preset) => {
          const isSelected = activePreset.id === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectIcon(preset)}
              className={cn(
                "group relative flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all duration-150 hover:bg-card/90",
                isSelected
                  ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 shadow-xs ring-2 ring-blue-500/30"
                  : "border-border/60 hover:border-border hover:shadow-2xs"
              )}
            >
              {/* Circle Marker Icon */}
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center shadow-sm border border-white dark:border-slate-800 transition-transform group-hover:scale-110",
                  isSelected ? "ring-2 ring-blue-500" : ""
                )}
                style={{ backgroundColor: isSelected ? currentColor : preset.defaultColor }}
              >
                <svg
                  className="w-4.5 h-4.5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  dangerouslySetInnerHTML={{ __html: preset.svgPath }}
                />
              </div>

              {/* Label */}
              <span className="text-[11px] font-semibold text-foreground mt-1.5 line-clamp-1 w-full leading-tight">
                {preset.label}
              </span>

              {/* Active Indicator Checkmark */}
              {isSelected && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}
            </button>
          );
        })}

        {filteredPresets.length === 0 && (
          <div className="col-span-full py-8 text-center text-xs text-muted-foreground">
            No marker icon found matching &quot;{search}&quot;. Try another search term.
          </div>
        )}
      </div>
    </div>
  );
}
