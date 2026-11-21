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
  Flame,
  Siren,
  HeartPulse,
  Radio,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useVisitor } from "@/contexts/visitor-context";
import { useNotifications } from "@/contexts/notification-context";
import { useSystemSettings, DEFAULT_EMERGENCY_CONTACTS } from "@/hooks/use-system-settings";
import { useLanguage } from "@/contexts/language-context";

export default function MorePage() {
  const { visitor } = useVisitor();
  const { unreadCount } = useNotifications();
  const { settings } = useSystemSettings();
  const { t } = useLanguage();

  const cleanHotline = (settings.emergencyHotline || "0917-123-4567").replace(/[^\d+]/g, "");

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Navbar showSearch={false} />

      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        <Sidebar />

        <main className="flex-1 min-w-0 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full space-y-4 pb-28 md:pb-12">
          {/* Header */}
          <div className="pb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t.more.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.more.subtitle}
            </p>
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
                    {t.more.activeBadge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {t.more.contributorSubtitle}
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
                {t.more.submitSourceTitle}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight line-clamp-2">
                {t.more.submitSourceDesc}
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
                {t.more.savedSourcesTitle}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight line-clamp-2">
                {t.more.savedSourcesDesc}
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
                  {t.more.alertsTitle}
                </span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-rose-500 text-white shrink-0">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight line-clamp-2">
                {t.more.alertsDesc}
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
                {t.more.offlineTitle}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight line-clamp-2">
                {t.more.offlineDesc}
              </span>
            </Link>
          </div>

          {/* Emergency Hotlines Directory Card */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
            {/* Directory Header */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-center shrink-0">
                  <PhoneCall className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                      Irosin Emergency Hotlines
                    </h4>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {t.more.hotlineBadge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Tap any number to call directly for water relief &amp; emergency response
                  </p>
                </div>
              </div>
            </div>

            {/* Balanced 3-Column Grid (2 rows x 3 columns) */}
            <div className="p-2.5 sm:p-3.5 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 bg-slate-50/40 dark:bg-slate-950/20">
              {(settings.emergencyContacts && settings.emergencyContacts.length > 0
                ? settings.emergencyContacts
                : DEFAULT_EMERGENCY_CONTACTS
              ).map((contact, idx) => {
                const nameUpper = contact.agency.toUpperCase();
                const isNational = nameUpper.includes("911") || nameUpper.includes("NATIONAL");
                const isBfp = nameUpper.includes("BFP") || nameUpper.includes("FIRE");
                const isPnp = nameUpper.includes("PNP") || nameUpper.includes("POLICE");
                const isRhu = nameUpper.includes("RHU") || nameUpper.includes("HEALTH");

                const iconConfig = isNational
                  ? {
                      icon: <Siren className="h-3.5 w-3.5" />,
                      style: "bg-rose-50 text-rose-600 border-rose-200/60 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-900/40",
                      shortLabel: "National 911",
                      subtitle: "Emergency Hotline",
                    }
                  : isBfp
                  ? {
                      icon: <Flame className="h-3.5 w-3.5" />,
                      style: "bg-orange-50 text-orange-600 border-orange-200/60 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-900/40",
                      shortLabel: contact.agency,
                      subtitle: "Fire Protection",
                    }
                  : isPnp
                  ? {
                      icon: <Shield className="h-3.5 w-3.5" />,
                      style: "bg-blue-50 text-blue-600 border-blue-200/60 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900/40",
                      shortLabel: contact.agency,
                      subtitle: "Police Station",
                    }
                  : isRhu
                  ? {
                      icon: <HeartPulse className="h-3.5 w-3.5" />,
                      style: "bg-emerald-50 text-emerald-600 border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900/40",
                      shortLabel: contact.agency,
                      subtitle: "Rural Health Unit",
                    }
                  : {
                      icon: <Radio className="h-3.5 w-3.5" />,
                      style: "bg-amber-50 text-amber-600 border-amber-200/60 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900/40",
                      shortLabel: nameUpper.includes("SPDRRMO") ? "SPDRRMO" : contact.agency,
                      subtitle: nameUpper.includes("SPDRRMO")
                        ? "Irosin Extension"
                        : "Disaster & Water",
                    };

                const validNumbers = contact.numbers.filter((n) => n && n.trim().length > 0);

                return (
                  <div
                    key={contact.id || idx}
                    className="p-2.5 sm:p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col gap-2.5 hover:border-blue-500/40 transition-all"
                  >
                    {/* Card Header */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${iconConfig.style}`}
                      >
                        {iconConfig.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span
                          className="text-xs font-extrabold text-slate-900 dark:text-white block leading-tight truncate"
                          title={contact.agency}
                        >
                          {iconConfig.shortLabel}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-tight truncate mt-0.5">
                          {iconConfig.subtitle}
                        </span>
                      </div>
                    </div>

                    {/* Uniform Call Buttons Area */}
                    <div className="flex-1 flex flex-col justify-center gap-1.5 w-full">
                      {validNumbers.map((num, nIdx) => {
                        const dialNum = num.replace(/[^\d+]/g, "");
                        return (
                          <a
                            key={nIdx}
                            href={`tel:${dialNum}`}
                            className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-blue-600 hover:text-white hover:border-blue-600 dark:bg-slate-800/90 dark:hover:bg-blue-600 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 font-mono font-bold text-[11px] active:scale-95 transition-all cursor-pointer select-none group/btn"
                          >
                            <PhoneCall className="h-3 w-3 shrink-0 text-blue-600 dark:text-blue-400 group-hover/btn:text-white transition-colors" />
                            <span className="truncate">{num}</span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
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
                  {t.more.aboutLink}
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
                  {t.more.privacyLink}
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
                  {t.more.termsLink}
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

