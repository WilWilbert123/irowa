// src/components/layout/sidebar.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Map,
  Droplets,
  FileText,
  MessageSquare,
  Bell,
  Settings,
  PlusCircle,
  Bookmark,
  Shield,
} from "lucide-react";
import { useNotifications } from "@/contexts/notification-context";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();

  // If inside admin dashboard, the admin layout uses its own admin sidebar
  if (pathname.startsWith("/admin")) return null;

  const navItems = [
    { href: "/home", label: "Map", icon: Map, active: pathname === "/home" || pathname === "/" || pathname === "/map" },
    { href: "/water", label: "Water Sources", icon: Droplets, active: pathname.startsWith("/water") },
    { href: "/chat", label: "Chat", icon: MessageSquare, active: pathname.startsWith("/chat") },
    { href: "/notifications", label: "Notifications", icon: Bell, active: pathname.startsWith("/notifications"), badge: unreadCount },
    { href: "/saved", label: "Saved Locations", icon: Bookmark, active: pathname.startsWith("/saved") },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 h-full overflow-hidden transition-colors">
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group",
                item.active
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-semibold shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    item.active
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
          <Link
            href="/submit-water"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors"
          >
            <PlusCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span>Submit Water Point</span>
          </Link>
        </div>
      </div>

      {/* Footer in sidebar */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
            pathname.startsWith("/profile")
              ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          )}
        >
          <Settings className="h-5 w-5 text-slate-400" />
          <span>Settings & Profile</span>
        </Link>
      </div>
    </aside>
  );
}
