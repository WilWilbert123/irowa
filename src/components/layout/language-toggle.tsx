// src/components/layout/language-toggle.tsx
"use client";

import React from "react";
import { Languages } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  className?: string;
  variant?: "pill" | "icon" | "minimal";
}

export function LanguageToggle({ className, variant = "pill" }: LanguageToggleProps) {
  const { language, toggleLanguage, isTagalog } = useLanguage();

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        className={cn(
          "relative p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer",
          className
        )}
        title={isTagalog ? "Switch to English" : "Lumipat sa Tagalog"}
        aria-label="Toggle language"
      >
        <Languages className="h-5 w-5" />
        <span className="absolute -bottom-0.5 -right-0.5 px-1 py-0.2 rounded-full text-[9px] font-black bg-blue-600 text-white leading-none">
          {language.toUpperCase()}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer select-none border backdrop-blur-md",
        isTagalog
          ? "bg-blue-50/90 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border-blue-200/80 dark:border-blue-800 text-blue-700 dark:text-blue-300"
          : "bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200",
        className
      )}
      title={isTagalog ? "Palitan sa English" : "Switch to Tagalog"}
      aria-label="Toggle language"
    >
      <Languages className="h-3.5 w-3.5" />
      <span>{isTagalog ? "Tagalog" : "English"}</span>
      <span className="text-[10px] opacity-60 font-mono">
        ({isTagalog ? "TL" : "EN"})
      </span>
    </button>
  );
}

