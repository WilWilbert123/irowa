// src/app/profile/page.tsx
"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useVisitor } from "@/contexts/visitor-context";
import { useNotifications } from "@/contexts/notification-context";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { User, Smartphone, Moon, Shield, Info, Check } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { visitor, setDisplayName, preferences, updatePreferences } = useVisitor();
  const { pushEnabled, togglePushNotifications } = useNotifications();
  const [nameInput, setNameInput] = useState(visitor?.displayName || "");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      setDisplayName(nameInput.trim());
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Navbar showSearch={false} />
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-w-0 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto w-full space-y-6 pb-28 md:pb-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
              <User className="h-4 w-4" />
              <span>Preferences & Identity</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Visitor Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage your community chat handle, theme preferences, and push notification settings.
            </p>
          </div>

          {/* Profile Name Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Public Display Name
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Maria Santos"
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  Visible to neighbors when sending messages in water point chat or submitting community updates.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <span className="text-[11px] font-mono text-slate-400 truncate max-w-xs">
                  ID: {visitor?.visitorId || "Anonymous"}
                </span>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  {savedSuccess && <Check className="h-3.5 w-3.5" />}
                  <span>{savedSuccess ? "Saved!" : "Update Name"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Application Preferences Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Application Settings
            </h3>

            <div className="divide-y divide-slate-100 dark:border-slate-800 dark:divide-slate-800">
              {/* Theme */}
              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Interface Theme
                  </h4>
                  <p className="text-xs text-slate-400">Light, dark, or system preference</p>
                </div>
                <ThemeToggle />
              </div>

              {/* Push Notifications */}
              <div className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Emergency Advisories & Push
                  </h4>
                  <p className="text-xs text-slate-400">Receive alert updates on low supply in your barangay</p>
                </div>
                <button
                  onClick={togglePushNotifications}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
                    pushEnabled
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {pushEnabled ? "Enabled" : "Enable"}
                </button>
              </div>

              {/* Offline Map Style */}
              <div className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Default Map Layer
                  </h4>
                  <p className="text-xs text-slate-400">Select standard, satellite imagery, or terrain</p>
                </div>
                <select
                  value={preferences.mapStyle || "satellite"}
                  onChange={(e) =>
                    updatePreferences({
                      mapStyle: e.target.value as "standard" | "satellite" | "terrain",
                    })
                  }
                  className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none"
                >
                  <option value="satellite">Satellite</option>
                  <option value="standard">Standard Street</option>
                  <option value="terrain">Topographic</option>
                </select>
              </div>
            </div>
          </div>

          {/* About & Community Links */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              About & Legal
            </h3>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-blue-600 dark:text-blue-400 pt-1">
              <Link href="/about" className="hover:underline">About IroWa</Link>
              <span>•</span>
              <Link href="/terms" className="hover:underline">Community Terms</Link>
              <span>•</span>
              <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            </div>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
