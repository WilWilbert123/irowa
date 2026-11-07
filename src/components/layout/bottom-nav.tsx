// src/components/layout/bottom-nav.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Droplets, MessageSquare, Menu } from "lucide-react";
import { useNotifications } from "@/contexts/notification-context";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();
  const { t } = useLanguage();

  // If in admin dashboard or inside a specific chat conversation, don't show public bottom nav
  if (pathname.startsWith("/admin") || (pathname.startsWith("/chat/") && pathname !== "/chat")) return null;

  const isMapActive = pathname === "/home" || pathname === "/" || pathname === "/map";
  const isWaterActive = pathname.startsWith("/water");
  const isChatActive = pathname.startsWith("/chat");
  const isMoreActive =
    pathname.startsWith("/more") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/saved") ||
    pathname.startsWith("/submit-water") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/offline") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms");

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)] transition-colors">
      <div className="grid grid-cols-4 h-16 items-center px-1">
        {/* 1. Map */}
        <Link
          href="/home"
          prefetch={true}
          className={cn(
            "flex flex-col items-center justify-center py-1 transition-all duration-150 ease-out active:scale-90 select-none",
            isMapActive
              ? "text-blue-600 dark:text-blue-400 font-semibold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          )}
        >
          <Map className="h-5 w-5 mb-1" />
          <span className="text-[11px] leading-none">{t.nav.map}</span>
        </Link>

        {/* 2. Sources */}
        <Link
          href="/water"
          prefetch={true}
          className={cn(
            "flex flex-col items-center justify-center py-1 transition-all duration-150 ease-out active:scale-90 select-none",
            isWaterActive
              ? "text-blue-600 dark:text-blue-400 font-semibold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          )}
        >
          <Droplets className="h-5 w-5 mb-1" />
          <span className="text-[11px] leading-none">{t.nav.waterSources}</span>
        </Link>

        {/* 3. Chat */}
        <Link
          href="/chat"
          prefetch={true}
          className={cn(
            "flex flex-col items-center justify-center py-1 transition-all duration-150 ease-out active:scale-90 select-none relative",
            isChatActive
              ? "text-blue-600 dark:text-blue-400 font-semibold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          )}
        >
          <MessageSquare className="h-5 w-5 mb-1" />
          <span className="text-[11px] leading-none">{t.nav.chat}</span>
        </Link>

        {/* 4. More */}
        <Link
          href="/more"
          prefetch={true}
          className={cn(
            "flex flex-col items-center justify-center py-1 transition-all duration-150 ease-out active:scale-90 select-none relative",
            isMoreActive
              ? "text-blue-600 dark:text-blue-400 font-semibold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          )}
          aria-label={t.nav.more}
        >
          <Menu className="h-5 w-5 mb-1" />
          <span className="text-[11px] leading-none">{t.nav.more}</span>
          {unreadCount > 0 && (
            <span className="absolute top-2 right-6 h-2 w-2 rounded-full bg-rose-500" />
          )}
        </Link>
      </div>
    </nav>
  );
}
