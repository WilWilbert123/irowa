// src/components/admin/admin-sidebar.tsx
"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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
import { getAllSubmissionsAction } from "@/actions/submission-actions";
import { getAllReportsAction } from "@/actions/report-actions";
import { getReportedMessagesAction } from "@/actions/chat-actions";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [pendingSubmissions, setPendingSubmissions] = useState<number>(0);
  const [pendingReports, setPendingReports] = useState<number>(0);
  const [flaggedMessages, setFlaggedMessages] = useState<number>(0);

  // Fetch pending badge counts and listen in realtime
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        if (isSupabaseConfigured()) {
          const supabase = createClient();
          const [{ count: subCount }, { count: repCount }, { count: chatCount }] = await Promise.all([
            supabase
              .from("water_submissions")
              .select("*", { count: "exact", head: true })
              .eq("status", "pending"),
            supabase
              .from("water_reports")
              .select("*", { count: "exact", head: true })
              .eq("status", "pending"),
            supabase
              .from("chat_messages")
              .select("*", { count: "exact", head: true })
              .eq("status", "flagged"),
          ]);

          setPendingSubmissions(subCount ?? 0);
          setPendingReports(repCount ?? 0);
          setFlaggedMessages(chatCount ?? 0);
        } else {
          const [subs, reps, flagged] = await Promise.all([
            getAllSubmissionsAction(),
            getAllReportsAction(),
            getReportedMessagesAction(),
          ]);
          setPendingSubmissions((subs || []).filter((s) => s.status === "pending").length);
          setPendingReports((reps || []).filter((r) => r.status === "pending").length);
          setFlaggedMessages((flagged || []).length);
        }
      } catch {
        try {
          const [subs, reps, flagged] = await Promise.all([
            getAllSubmissionsAction(),
            getAllReportsAction(),
            getReportedMessagesAction(),
          ]);
          setPendingSubmissions((subs || []).filter((s) => s.status === "pending").length);
          setPendingReports((reps || []).filter((r) => r.status === "pending").length);
          setFlaggedMessages((flagged || []).length);
        } catch { }
      }
    };

    fetchCounts();

    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    const channel = supabase
      .channel("sidebar_badge_counts")
      .on("postgres_changes", { event: "*", schema: "public", table: "water_submissions" }, fetchCounts)
      .on("postgres_changes", { event: "*", schema: "public", table: "water_reports" }, fetchCounts)
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_messages" }, fetchCounts)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Close drawer on path change on mobile & clear pending state
  useEffect(() => {
    setPendingHref(null);
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
      badge: pendingSubmissions,
      badgeColor: "bg-amber-500 text-white",
    },
    {
      href: "/admin/reports",
      label: "Community Reports",
      icon: FileText,
      badge: pendingReports,
      badgeColor: "bg-rose-500 text-white",
    },
    {
      href: "/admin/chat",
      label: "Chat Moderation",
      icon: MessageSquare,
      badge: flaggedMessages,
      badgeColor: "bg-purple-600 text-white",
    },
    { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
    { href: "/admin/users", label: "Visitor Sessions", icon: Users },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/audit-logs", label: "Audit Logs", icon: History },
    { href: "/admin/settings", label: "System Settings", icon: Settings },
  ];

  // Eagerly prefetch all admin routes into client memory for instant 0ms page loads
  useEffect(() => {
    navLinks.forEach((link) => {
      try {
        router.prefetch(link.href);
      } catch { }
    });
  }, [router]);

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
          "w-64 lg:w-68 shrink-0 bg-white dark:bg-slate-900 text-slate-800 dark:text-white flex flex-col border-r border-slate-200 dark:border-slate-800 transition-transform duration-200 ease-in-out",
          "fixed inset-y-0 left-0 z-50 h-dvh lg:static lg:h-full lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 pb-3 sm:pb-4 shrink-0 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80">
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
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Nav List */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isCurrent = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const isActive = pendingHref ? pendingHref === item.href : isCurrent;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onMouseEnter={() => {
                  try {
                    router.prefetch(item.href);
                  } catch { }
                }}
                onTouchStart={() => {
                  try {
                    router.prefetch(item.href);
                  } catch { }
                }}
                onClick={() => {
                  setPendingHref(item.href);
                  startTransition(() => { });
                }}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-[0.98] select-none cursor-pointer",
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
                      "min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 transition-all",
                      isActive
                        ? item.badge > 0
                          ? "bg-white text-blue-700 shadow-2xs font-extrabold"
                          : "bg-white/20 text-white"
                        : item.badge > 0
                          ? item.badgeColor || "bg-blue-500 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80">
            <Link
              href="/home?from=admin"
              prefetch={true}
              onClick={() => {
                if (typeof window !== "undefined") {
                  sessionStorage.setItem("irowa_admin_view_active", "true");
                }
              }}
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              <span className="truncate">Public Water Map</span>
            </Link>
          </div>
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                A
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs text-slate-900 dark:text-white block leading-tight truncate">
                Admin Console
              </span>

            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <ThemeToggle className="scale-85 origin-right" />
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
