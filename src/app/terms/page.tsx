// src/app/terms/page.tsx
import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar showSearch={false} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6 pb-24 md:pb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
              <FileText className="h-4 w-4" />
              <span>Community Guidelines</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Terms of Use
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Guidelines for maintaining constructive and safe water resource communication.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Community Respect</h2>
            <p>
              Users must refrain from abusive language, spamming, harassment, or submitting false water point information. Water resources are vital for health and disaster response.
            </p>

            <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Moderation & Abuse Prevention</h2>
            <p>
              Administrators reserve the right to remove misleading reports, hide inappropriate chat messages, and temporarily restrict visitor sessions that violate community safety rules.
            </p>

            <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Disclaimers of Water Safety</h2>
            <p>
              IroWa indexes locations and reported flow status. Listing does not guarantee that untreated surface or spring water meets national microbiological drinking water standards.
            </p>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
