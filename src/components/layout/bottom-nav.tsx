// src/components/layout/bottom-nav.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Droplets, MessageSquare, Menu, Bookmark, PlusCircle, User, Info, AlertTriangle, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useNotifications } from "@/contexts/notification-context";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);

  // If in admin dashboard, don't show public bottom nav
  if (pathname.startsWith("/admin")) return null;

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
              "flex flex-col items-center justify-center py-1 transition-colors",
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
              "flex flex-col items-center justify-center py-1 transition-colors",
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
              "flex flex-col items-center justify-center py-1 transition-colors relative",
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
              "flex flex-col items-center justify-center py-1 transition-colors relative cursor-pointer",
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
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setMoreDrawerOpen(false)}
          />
          <div className="relative z-50 rounded-t-3xl bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-6 pb-10 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-semibold text-base text-slate-900 dark:text-white">Community & Tools</h3>
                <span className="text-[11px] text-slate-400">Quick settings & navigation</span>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <button
                  onClick={() => setMoreDrawerOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4">
              <Link
                href="/submit-water"
                onClick={() => setMoreDrawerOpen(false)}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30 gap-2 text-center"
              >
                <PlusCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold">Submit Water Source</span>
              </Link>

              <Link
                href="/saved"
                onClick={() => setMoreDrawerOpen(false)}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-800 gap-2 text-center"
              >
                <Bookmark className="h-6 w-6 text-amber-500" />
                <span className="text-xs font-semibold">Saved Sources</span>
              </Link>

              <Link
                href="/notifications"
                onClick={() => setMoreDrawerOpen(false)}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-800 gap-2 text-center relative"
              >
                <div className="relative">
                  <span className="text-rose-500 font-bold text-lg">🔔</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[10px] px-1 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold">Notifications</span>
              </Link>

              <Link
                href="/profile"
                onClick={() => setMoreDrawerOpen(false)}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-800 gap-2 text-center"
              >
                <User className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                <span className="text-xs font-semibold">Display Profile</span>
              </Link>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-around text-xs text-slate-500 dark:text-slate-400">
              <Link href="/about" onClick={() => setMoreDrawerOpen(false)} className="hover:underline">
                About IroWa
              </Link>
              <span>•</span>
              <Link href="/privacy" onClick={() => setMoreDrawerOpen(false)} className="hover:underline">
                Privacy
              </Link>
              <span>•</span>
              <Link href="/terms" onClick={() => setMoreDrawerOpen(false)} className="hover:underline">
                Community Terms
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
