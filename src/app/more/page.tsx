// src/app/more/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import {
  PlusCircle,
  Bookmark,
  Bell,
  WifiOff,
  PhoneCall,
  ChevronRight,
  Info,
  Shield,
  FileText,
  Heart,
  Droplets,
  ExternalLink,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useVisitor } from "@/contexts/visitor-context";
import { useNotifications } from "@/contexts/notification-context";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useSystemSettings } from "@/hooks/use-system-settings";

export default function MorePage() {
  const { visitor } = useVisitor();
  const { unreadCount } = useNotifications();
  const { settings } = useSystemSettings();

  const cleanHotline = (settings.emergencyHotline || "0917-123-4567").replace(/[^\d+]/g, "");

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Navbar showSearch={false} />

      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        <Sidebar />

        <main className="flex-1 min-w-0 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full space-y-4 pb-28 md:pb-12">
          {/* Header */}
          <div className="flex items-center justify-between pb-1">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Menu & Community Tools
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Quick navigation, emergency hotlines & community options
              </p>
            </div>
            <div className="sm:hidden">
              <ThemeToggle />
            </div>
          </div>

          {/* User Profile Card */}
          <Link
            href="/profile"
            prefetch={true}
            className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-blue-500/50 active:scale-[0.99] transition-all duration-150 group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 text-white font-black text-base flex items-center justify-center shrink-0 shadow-xs">
                {visitor?.displayName ? visitor.displayName.slice(0, 1).toUpperCase() : "W"}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {visitor?.displayName || "Resident Contributor"}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40 shrink-0">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  Community Contributor • Tap to view profile & settings
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0 transition-colors" />
          </Link>

          {/* 4 Core Features Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Submit Source */}
            <Link
              href="/submit-water"
              prefetch={true}
              className="flex flex-col items-start p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-blue-500/50 active:scale-95 transition-all duration-150 group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <PlusCircle className="h-4.5 w-4.5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Submit Source
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight line-clamp-2">
                Report a well, spring, or water point
              </span>
            </Link>

            {/* Saved Sources */}
            <Link
              href="/saved"
              prefetch={true}
              className="flex flex-col items-start p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-amber-500/50 active:scale-95 transition-all duration-150 group"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Bookmark className="h-4.5 w-4.5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Saved Sources
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight line-clamp-2">
                Bookmarked points for quick access
              </span>
            </Link>

            {/* Alerts & Bulletins */}
            <Link
              href="/notifications"
              prefetch={true}
              className="flex flex-col items-start p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-rose-500/50 active:scale-95 transition-all duration-150 group relative"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Bell className="h-4.5 w-4.5" />
              </div>
              <div className="flex items-center gap-1.5 w-full">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  Alerts & Bulletins
                </span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-rose-500 text-white shrink-0">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight line-clamp-2">
                Municipal warnings & dry spell news
              </span>
            </Link>

            {/* Offline Database */}
            <Link
              href="/offline"
              prefetch={true}
              className="flex flex-col items-start p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-emerald-500/50 active:scale-95 transition-all duration-150 group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <WifiOff className="h-4.5 w-4.5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Offline Mode
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight line-clamp-2">
                Instant directory storage & backup
              </span>
            </Link>
          </div>

          {/* Emergency Hotline Card */}
          <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <PhoneCall className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                    Irosin MDRRMO Hotline
                  </h4>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200">
                    24/7
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                  Emergency water relief, dry spell delivery & disaster rescue
                </p>
              </div>
            </div>

            <a
              href={`tel:${cleanHotline}`}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-transform cursor-pointer w-full sm:w-auto shrink-0 select-none"
            >
              <PhoneCall className="h-3.5 w-3.5" />
              <span>Call {settings.emergencyHotline || "0917-123-4567"}</span>
            </a>
          </div>

          {/* Navigation Links List */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80 shadow-2xs">
            <Link
              href="/about"
              prefetch={true}
              className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-slate-100 dark:active:bg-slate-800 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Info className="h-4 w-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  About IroWa & Municipal Mission
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              href="/privacy"
              prefetch={true}
              className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-slate-100 dark:active:bg-slate-800 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Privacy Policy & Data Transparency
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              href="/terms"
              prefetch={true}
              className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-slate-100 dark:active:bg-slate-800 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Community Terms of Service
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>
          </div>

          {/* Footer Branding */}
          <div className="text-center pt-2 space-y-1">
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              © 2026 {settings.appName || "IroWa"} • {settings.tagline || "Municipal Water Resources Directory"}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Municipality of Irosin, Sorsogon, Philippines
            </p>
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}

