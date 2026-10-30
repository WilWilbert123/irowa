// src/app/privacy/page.tsx
import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Navbar showSearch={false} />
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-w-0 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6 pb-28 md:pb-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
              <Shield className="h-4 w-4" />
              <span>Data & Privacy</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              How IroWa respects resident privacy and treats community data.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">1. No Personal Accounts Required</h2>
            <p>
              IroWa does not require personal registration, passwords, email addresses, or phone numbers from public visitors. You are free to browse and explore all public water map data anonymously.
            </p>

            <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Local Browser Storage</h2>
            <p>
              Saved locations, theme preferences, and your chosen display handle are kept on your device using HTML5 LocalStorage. You can clear this data at any time via your browser settings.
            </p>

            <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Community Chat & Submissions</h2>
            <p>
              When you post a message in group chat or submit a proposed water point, your message and chosen display handle are made public for community coordination. Please avoid posting sensitive personal information or private phone numbers.
            </p>

            <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Geolocation</h2>
            <p>
              When using the &quot;Find My Location&quot; feature, your browser requests permission to access your GPS coordinates. These coordinates are used exclusively on your local device to calculate distances and center the map; they are never sold or tracked across sessions.
            </p>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
