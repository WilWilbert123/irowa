// src/app/about/page.tsx
import React from "react";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Droplets, Shield, Heart, Compass } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Navbar showSearch={false} />
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-w-0 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6 pb-28 md:pb-12">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl flex items-center justify-center overflow-hidden">
              <Image
                src="/images/irowalogo.png"
                alt="IroWa"
                width={64}
                height={64}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                <Droplets className="h-4 w-4" />
                <span>Civic Information Platform</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                About IroWa
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Irosin Water Resources Map — A digital community initiative for water discovery and drought resilience.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Our Purpose
              </h2>
              <p>
                Nestled at the base of Mount Bulusan, the municipality of Irosin boasts natural hot and cold springs, cascading mountain waterfalls, crystal rivers, and agricultural community water wells. However, during El Niño events, seasonal dry spells, and infrastructure repairs, locating verified water access becomes essential for residents and farmers.
              </p>
              <p>
                <strong>IroWa</strong> provides an open, accessible geographic resource map where residents can locate available water, check operating hours, view status updates, and participate in shared community chats without friction.
              </p>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 space-y-1.5">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-xs text-slate-900 dark:text-white">Verified Data</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Submissions are reviewed by administrators before being marked as official points.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/30 space-y-1.5">
                <Heart className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                <h3 className="font-bold text-xs text-slate-900 dark:text-white">Accountless Access</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Open access for all residents without logins, passwords, or tracking.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 space-y-1.5">
                <Compass className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-xs text-slate-900 dark:text-white">Emergency Ready</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Integrated advisories, standby well locations, and mobile-friendly directions.
                </p>
              </div>
            </div>

            <section className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Contact & Municipal Inquiries
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                For official water testing inquiries or municipal emergency assistance, please contact the Irosin MDRRMO or Municipal Health Office.
              </p>
            </section>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
