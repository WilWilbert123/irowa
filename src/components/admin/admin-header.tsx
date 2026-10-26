// src/components/admin/admin-header.tsx
"use client";

import React from "react";
import Link from "next/link";
import { PlusCircle, Calendar, Shield } from "lucide-react";
import { ThemeToggle } from "../layout/theme-toggle";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  actionButton?: {
    href: string;
    label: string;
  };
}

export function AdminHeader({ title, subtitle, actionButton }: AdminHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800 mb-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Date display matching Mockup 3 */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <Calendar className="h-3.5 w-3.5" />
          <span>Active Operations Period</span>
        </div>

        <ThemeToggle />

        {actionButton && (
          <Link
            href={actionButton.href}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            <span>{actionButton.label}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
