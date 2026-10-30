// src/components/admin/admin-sidebar.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Droplets,
  MapPin,
  Inbox,
  FileText,
  Users,
  MessageSquare,
  Megaphone,
  BarChart3,
  History,
  Settings,
  LogOut,
  ArrowLeft,
  X,
} from "lucide-react";
import { logoutAdminAction } from "@/actions/admin-auth-actions";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [pendingSubmissions, setPendingSubmissions] = useState<number>(0);
  const [pendingReports, setPendingReports] = useState<number>(0);

  // Fetch pending badge counts and listen in realtime
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();

    const fetchCounts = async () => {
      try {
        const { count: subCount } = await supabase
          .from("water_submissions")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");

        const { count: repCount } = await supabase
          .from("water_reports")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");

        setPendingSubmissions(subCount || 0);
        setPendingReports(repCount || 0);
      } catch {}
    };

    fetchCounts();

    const channel = supabase
      .channel("sidebar_badge_counts")
      .on("postgres_changes", { event: "*", schema: "public", table: "water_submissions" }, fetchCounts)
      .on("postgres_changes", { event: "*", schema: "public", table: "water_reports" }, fetchCounts)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Close drawer on path change on mobile
  useEffect(() => {
    if (onClose) {
      onClose();
    }
  }, [pathname]);

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/map", label: "Map Editor", icon: MapPin },
    { href: "/admin/water-sources", label: "Water Sources", icon: Droplets },
    {
      href: "/admin/submissions",
      label: "Submissions",
      icon: Inbox,
      badge: pendingSubmissions > 0 ? pendingSubmissions : undefined,
      badgeColor: "bg-amber-500 text-amber-950",
    },
    {
      href: "/admin/reports",
      label: "Community Reports",
      icon: FileText,
      badge: pendingReports > 0 ? pendingReports : undefined,
      badgeColor: "bg-rose-500 text-white",
    },
    { href: "/admin/chat", label: "Chat Moderation", icon: MessageSquare },
    { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
    { href: "/admin/users", label: "Visitor Sessions", icon: Users },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/audit-logs", label: "Audit Logs", icon: History },
    { href: "/admin/settings", label: "System Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={cn(
          "w-64 shrink-0 bg-white dark:bg-slate-900 text-slate-800 dark:text-white flex flex-col h-screen fixed lg:sticky top-0 z-50 border-r border-slate-200 dark:border-slate-800 transition-colors duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="p-5 pb-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden">
              <Image
                src="/images/irowalogo.png"
                alt="IroWa"
                width={36}
                height={36}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">IroWa</span>
              <span className="block text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest leading-none">
                Control Center
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Nav List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all",
                  isActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0",
                      item.badgeColor || "bg-blue-500 text-white"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80">
            <Link
              href="/home"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Public Water Map</span>
            </Link>
          </div>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              A
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs text-slate-900 dark:text-white block leading-none truncate">
                Admin Console
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium leading-tight">
                ● Live Operations
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <ThemeToggle />
            <form action={logoutAdminAction}>
              <button
                type="submit"
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
