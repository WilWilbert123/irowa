// src/app/admin/(dashboard)/moderation/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, MessageSquare, AlertTriangle, FileText, ArrowRight, Users } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";

export default function AdminContentModerationHubPage() {
  return (
    <div className="space-y-6">
      <AdminHeader
        title="Content Moderation Hub"
        subtitle="Centralized review for civic safety, citizen water submissions, community reports, and chat filters."
        isLive={true}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Water Submissions</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Verify submitted coordinates, photos, and availability claims from the community before publication.
              </p>
            </div>
          </div>
          <Link
            href="/admin/submissions"
            className="w-full flex items-center justify-between py-2 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors border border-slate-200/60 dark:border-slate-800"
          >
            <span>Review Submissions Queue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Community Reports</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Investigate citizen reports of dried springs, broken pumps, contaminated water, or inaccurate pins.
              </p>
            </div>
          </div>
          <Link
            href="/admin/reports"
            className="w-full flex items-center justify-between py-2 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors border border-slate-200/60 dark:border-slate-800"
          >
            <span>Investigate Reports</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-500 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Chat Moderation</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Hide or permanently delete abusive, hateful, or spam messages across all water source discussion channels.
              </p>
            </div>
          </div>
          <Link
            href="/admin/chat"
            className="w-full flex items-center justify-between py-2 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors border border-slate-200/60 dark:border-slate-800"
          >
            <span>Moderate Discussions</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-500" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Civic Safety & Verification Standard
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          IroWa operates as a vital emergency resource for the municipality of Irosin. Water availability and potability must be treated as distinct concepts. Water sources must never be labeled as potable or safe to drink without explicit municipal sanitary health authority clearance.
        </p>
      </div>
    </div>
  );
}
