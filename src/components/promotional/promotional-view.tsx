// src/components/promotional/promotional-view.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  ShieldCheck,
  Share2,
  Users,
  Compass,
  Droplets,
  Check,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    title: "Water Sources",
    description: "Rivers, springs & waterfalls",
    href: "/water",
    image: "/images/feature-water-sources.jpg",
    icon: MapPin,
    offsetClass: "translate-y-0 sm:translate-y-0",
    badgeClass: "bg-blue-600/90 text-white border-blue-300/40 shadow-blue-500/30",
  },
  {
    title: "Stay Safe",
    description: "Emergency water relief",
    href: "/notifications",
    image: "/images/feature-stay-safe.jpg",
    icon: ShieldCheck,
    offsetClass: "translate-y-2.5 sm:translate-y-3",
    badgeClass: "bg-emerald-600/90 text-white border-emerald-300/40 shadow-emerald-500/30",
  },
  {
    title: "Share",
    description: "Suggest a well or spring",
    href: "/submit-water",
    image: "/images/feature-share.jpg",
    icon: Share2,
    offsetClass: "-translate-y-1.5 sm:translate-y-0",
    badgeClass: "bg-teal-600/90 text-white border-teal-300/40 shadow-teal-500/30",
  },
  {
    title: "Build Community",
    description: "Connect with local residents",
    href: "/chat",
    image: "/images/feature-community.jpg",
    icon: Users,
    offsetClass: "translate-y-2 sm:translate-y-2.5",
    badgeClass: "bg-indigo-600/90 text-white border-indigo-300/40 shadow-indigo-500/30",
  },
];

export function PromotionalView() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.origin : "https://irowa.local";
    const shareData = {
      title: "IroWa — Discover. Share. Be Prepared.",
      text: "Find and explore water resources in Irosin, Sorsogon. From natural springs to resorts, stay informed and ready during droughts and emergencies.",
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignore clipboard fallback failure
    }
  };

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Full Image Background - Native HD Portrait for Mobile, Widescreen HD for Desktop */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
        {/* Mobile Portrait (768x1376) - 100% Sharp, zero pixelation or stretch */}
        <div className="relative w-full h-full sm:hidden">
          <Image
            src="/images/irosin-hero-mobile.jpg"
            alt="Mount Bulusan and Irosin Landscape"
            fill
            className="object-cover object-center"
            quality={100}
            priority
          />
        </div>

        {/* Desktop Widescreen (1376x768) */}
        <div className="relative w-full h-full hidden sm:block">
          <Image
            src="/images/irosin-hero-bg.jpg"
            alt="Mount Bulusan and Irosin Landscape"
            fill
            className="object-cover object-bottom"
            quality={100}
            priority
          />
        </div>

        {/* Balanced natural gradient: soft white/dark haze on top for crystal clear text readability, natural mountains below */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/60 to-white/30 dark:from-slate-950/95 dark:via-slate-950/65 dark:to-slate-950/30 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* 2. Foreground Content - Single Screen Viewport (Zero Scroll) */}
      <div className="relative z-10 w-full max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-8 pt-3 sm:pt-6 md:pt-7 pb-3 sm:pb-5 flex-1 flex flex-col justify-between min-h-0 space-y-2 sm:space-y-3.5 md:space-y-4">

        {/* Top Bar: Brand Logo & Live Badge */}
        <div className="flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 shrink-0 flex items-center justify-center drop-shadow-md">
              <Image
                src="/images/irowalogo.png"
                alt="IroWa Logo"
                width={64}
                height={64}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-blue-700 dark:text-blue-400 tracking-tight leading-none">
                IroWa
              </h1>
              <p className="text-[11px] sm:text-xs md:text-sm font-bold text-sky-800 dark:text-sky-300 mt-0.5 tracking-tight">
                Irosin Water Resources Map
              </p>
            </div>
          </div>
        </div>

        {/* Headline & Narrative */}
        <div className="space-y-1 sm:space-y-1.5 shrink-0">
          <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
            Discover. Share. Be Prepared.
          </h2>
          <p className="text-[11px] sm:text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal max-w-3xl line-clamp-2 sm:line-clamp-none">
            Find and explore water resources in Irosin, Sorsogon. From natural springs to resorts, IroWa helps you stay informed, connected, and ready — especially during droughts and emergencies.
          </p>
        </div>

        {/* 4 Feature Columns with Full-Bleed Image Backgrounds & Floating Glassmorphism */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 shrink-0 pt-0.5 pb-1 sm:pb-2">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.title}
                href={feature.href}
                prefetch={true}
                className={cn(
                  "group relative flex flex-col justify-between h-28 sm:h-32 md:h-36 p-3 rounded-2xl sm:rounded-3xl overflow-hidden border border-white/40 dark:border-white/15 shadow-lg shadow-black/25 hover:shadow-2xl hover:-translate-y-1.5 active:scale-95 transition-all duration-300 select-none",
                  feature.offsetClass
                )}
              >
                {/* Full-Bleed Image Background */}
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                  unoptimized
                />

                {/* Dark Gradient Overlay for Maximum Contrast & Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/55 to-slate-950/25 pointer-events-none transition-opacity duration-300 group-hover:via-slate-950/45" />

                {/* Top Row: Floating Glass Icon Pill */}
                <div className="relative z-10 flex items-center justify-between">
                  <div
                    className={cn(
                      "w-7 h-7 sm:w-8 sm:h-8 rounded-xl backdrop-blur-md shadow-md flex items-center justify-center border transition-transform duration-300 group-hover:scale-110",
                      feature.badgeClass
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                  </div>
                </div>

                {/* Bottom Content: High-contrast Title & Description */}
                <div className="relative z-10 space-y-0.5">
                  <h3 className="font-black text-xs sm:text-sm md:text-base text-white tracking-tight leading-tight drop-shadow-sm group-hover:text-sky-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] md:text-xs text-slate-200/90 font-medium leading-snug drop-shadow-xs line-clamp-1 sm:line-clamp-2">
                    {feature.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Center Action: Explore Irosin with glowing gradient CTA */}
        <div className="flex flex-col items-center justify-center shrink-0 pt-2 sm:pt-3">
          <Link
            href="/home"
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-3.5 sm:px-12 sm:py-4 rounded-full bg-gradient-to-r from-blue-600 via-sky-600 to-blue-700 hover:from-blue-700 hover:via-sky-700 hover:to-blue-800 active:scale-95 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-150 text-center select-none"
          >
            <Compass className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-sky-200 group-hover:rotate-45 transition-transform duration-300" />
            <span className="tracking-wide">Explore Irosin</span>
            <ArrowRight className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-sky-200 group-hover:translate-x-1.5 transition-transform duration-200" />
          </Link>

          {/* Secondary Controls with clear, spacious breathing room */}
          <div className="mt-4 sm:mt-5 flex items-center justify-center gap-3.5 sm:gap-4 text-xs sm:text-sm">
            <Link
              href="/water"
              className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white/95 hover:bg-white dark:bg-slate-900/90 dark:hover:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold shadow-xs hover:shadow-md active:scale-95 transition-all duration-150 backdrop-blur-md select-none"
            >
              <Droplets className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
              <span>Water Directory</span>
            </Link>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white/95 hover:bg-white dark:bg-slate-900/90 dark:hover:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold shadow-xs hover:shadow-md active:scale-95 transition-all duration-150 cursor-pointer backdrop-blur-md select-none"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500" />
                  <span>Share IroWa</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Credit & Sorsogon Tag */}
        <div className="flex items-center justify-between pt-1 text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400">
          <span className="font-medium bg-white/70 dark:bg-slate-900/70 px-2 py-0.5 rounded-md backdrop-blur-xs">
            © {new Date().getFullYear()} IroWa All Rights Reserved
          </span>
          <div className="px-2.5 py-0.5 rounded-full bg-slate-900/70 backdrop-blur-md text-white/95 font-medium shadow-xs">
            Irosin, Sorsogon
          </div>
        </div>

      </div>
    </main>
  );
}
