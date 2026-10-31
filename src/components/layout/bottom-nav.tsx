// src/components/layout/bottom-nav.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Map,
  Droplets,
  MessageSquare,
  Menu,
  Bookmark,
  PlusCircle,
  User,
  Info,
  AlertTriangle,
  X,
  Bell,
  WifiOff,
  PhoneCall,
  ChevronRight,
  Shield,
  Lock,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useNotifications } from "@/contexts/notification-context";
import { useVisitor } from "@/contexts/visitor-context";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();
  const { visitor } = useVisitor();
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);

  // If in admin dashboard or inside a specific chat conversation, don't show public bottom nav
  if (pathname.startsWith("/admin") || (pathname.startsWith("/chat/") && pathname !== "/chat")) return null;

  const isMapActive = pathname === "/home" || pathname === "/" || pathname === "/map";
  const isWaterActive = pathname.startsWith("/water");
  const isChatActive = pathname.startsWith("/chat");
  const isMoreActive =
    moreDrawerOpen ||
    pathname.startsWith("/saved") ||
    pathname.startsWith("/submit-water") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/about");

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)] transition-colors">
        <div className="grid grid-cols-4 h-16 items-center px-1">
          {/* 1. Map */}
          <Link
            href="/home"
            className={cn(
              "flex flex-col items-center justify-center py-1 transition-all duration-150 ease-out active:scale-90 select-none",
              isMapActive
                ? "text-blue-600 dark:text-blue-400 font-semibold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            <Map className="h-5 w-5 mb-1" />
            <span className="text-[11px] leading-none">Map</span>
          </Link>

          {/* 2. Sources */}
          <Link
            href="/water"
            className={cn(
              "flex flex-col items-center justify-center py-1 transition-all duration-150 ease-out active:scale-90 select-none",
              isWaterActive
                ? "text-blue-600 dark:text-blue-400 font-semibold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            <Droplets className="h-5 w-5 mb-1" />
            <span className="text-[11px] leading-none">Sources</span>
          </Link>

          {/* 3. Chat */}
          <Link
            href="/chat"
            className={cn(
              "flex flex-col items-center justify-center py-1 transition-all duration-150 ease-out active:scale-90 select-none relative",
              isChatActive
                ? "text-blue-600 dark:text-blue-400 font-semibold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            <MessageSquare className="h-5 w-5 mb-1" />
            <span className="text-[11px] leading-none">Chat</span>
          </Link>

          {/* 4. More */}
          <button
            onClick={() => setMoreDrawerOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center py-1 transition-all duration-150 ease-out active:scale-90 select-none relative cursor-pointer",
              isMoreActive
                ? "text-blue-600 dark:text-blue-400 font-semibold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
            aria-label="More navigation options"
          >
            <Menu className="h-5 w-5 mb-1" />
            <span className="text-[11px] leading-none">More</span>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-6 h-2 w-2 rounded-full bg-rose-500" />
            )}
          </button>
        </div>
      </nav>

      {/* More Options Modal/Drawer */}
      {moreDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setMoreDrawerOpen(false)}
          />
          <div className="relative z-50 rounded-t-3xl bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-5 pb-8 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto space-y-3.5">
            {/* Drawer Drag Handle */}
            <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto -mt-1" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Menu & Community Tools
                </h3>
                <span className="text-[11px] text-slate-400">Quick settings, alerts & navigation</span>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                  onClick={() => setMoreDrawerOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 active:scale-90 transition-transform cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* User Profile Card */}
            <Link
              href="/profile"
              onClick={() => setMoreDrawerOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 active:scale-[0.98] transition-all duration-150 select-none cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-teal-500 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                  {visitor?.displayName ? visitor.displayName.slice(0, 1).toUpperCase() : "U"}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {visitor?.displayName || "Resident / Visitor"}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    {visitor?.displayName ? "Community Contributor • Settings" : "Tap to set display name"}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
            </Link>

            {/* 4 Core Features Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/submit-water"
                onClick={() => setMoreDrawerOpen(false)}
                className="flex flex-col items-start p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 border border-blue-200/70 dark:border-blue-900/50 active:scale-95 transition-all duration-150 select-none shadow-2xs"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-2 shadow-xs">
                  <PlusCircle className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold leading-tight">Submit Source</span>
                <span className="text-[10px] text-blue-600/80 dark:text-blue-300/80 mt-0.5">Report a well or spring</span>
              </Link>

              <Link
                href="/saved"
                onClick={() => setMoreDrawerOpen(false)}
                className="flex flex-col items-start p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100 border border-amber-200/70 dark:border-amber-900/50 active:scale-95 transition-all duration-150 select-none shadow-2xs"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-2 shadow-xs">
                  <Bookmark className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold leading-tight">Saved Sources</span>
                <span className="text-[10px] text-amber-600/80 dark:text-amber-300/80 mt-0.5">Bookmarked points</span>
              </Link>

              <Link
                href="/notifications"
                onClick={() => setMoreDrawerOpen(false)}
                className="flex flex-col items-start p-3 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100 border border-rose-200/70 dark:border-rose-900/50 active:scale-95 transition-all duration-150 select-none shadow-2xs relative"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center mb-2 shadow-xs relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full border-2 border-white dark:border-slate-900">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold leading-tight">Alerts & Bulletins</span>
                <span className="text-[10px] text-rose-600/80 dark:text-rose-300/80 mt-0.5">Municipal warnings</span>
              </Link>

              <Link
                href="/offline"
                onClick={() => setMoreDrawerOpen(false)}
                className="flex flex-col items-start p-3 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 text-teal-900 dark:text-teal-100 border border-teal-200/70 dark:border-teal-900/50 active:scale-95 transition-all duration-150 select-none shadow-2xs"
              >
                <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center mb-2 shadow-xs">
                  <WifiOff className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold leading-tight">Offline Mode</span>
                <span className="text-[10px] text-teal-600/80 dark:text-teal-300/80 mt-0.5">Access cached map</span>
              </Link>
            </div>

            {/* Emergency Hotline Banner */}
            <a
              href="tel:0565550192"
              className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-transparent border border-rose-200/80 dark:border-rose-900/60 active:scale-[0.98] transition-all duration-150 select-none cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <PhoneCall className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    Irosin MDRRMO Hotline
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Emergency water relief & rescue • Tap to Call
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-xl bg-rose-100/80 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60">
                Call
              </span>
            </a>

            {/* App Info, Admin & Legal Footer */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                <Link
                  href="/about"
                  onClick={() => setMoreDrawerOpen(false)}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  About IroWa
                </Link>
                <span>•</span>
                <Link
                  href="/privacy"
                  onClick={() => setMoreDrawerOpen(false)}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Privacy
                </Link>
                <span>•</span>
                <Link
                  href="/terms"
                  onClick={() => setMoreDrawerOpen(false)}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Terms
                </Link>
              </div>

              <p className="text-[10px] text-center text-slate-400 dark:text-slate-500">
                © 2026 IroWa • Municipal Water Resources Directory
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
