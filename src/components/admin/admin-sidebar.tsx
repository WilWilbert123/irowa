// src/components/admin/admin-sidebar.tsx
"use client";

import React from "react";
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
  ShieldCheck,
  History,
  Settings,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { logoutAdminAction } from "@/actions/admin-auth-actions";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/map", label: "Map Editor", icon: MapPin },
    { href: "/admin/water-sources", label: "Water Sources", icon: Droplets },
    { href: "/admin/submissions", label: "Submissions", icon: Inbox },
    { href: "/admin/reports", label: "Community Reports", icon: FileText },
    { href: "/admin/chat", label: "Chat Moderation", icon: MessageSquare },
    { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
    { href: "/admin/users", label: "Visitor Sessions", icon: Users },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/audit-logs", label: "Audit Logs", icon: History },
    { href: "/admin/settings", label: "System Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-900 text-white flex flex-col h-screen sticky top-0 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-800/80">
        <Link href="/admin" className="flex items-center gap-3">
          <Image
            src="/images/irowa-logo.svg"
            alt="IroWa"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <div>
            <span className="font-extrabold text-lg text-white tracking-tight">IroWa</span>
            <span className="block text-[10px] text-blue-400 font-bold uppercase tracking-widest leading-none">
              Control Center
            </span>
          </div>
        </Link>
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
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all",
                isActive
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="pt-4 border-t border-slate-800/80">
          <Link
            href="/home"
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Public Water Map</span>
          </Link>
        </div>
      </div>

      {/* User Footer matching Mockup 3 */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
            A
          </div>
          <div>
            <span className="font-bold text-xs text-white block leading-none">Admin</span>
            <span className="text-[10px] text-slate-400 leading-tight">Administrator</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Log Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
