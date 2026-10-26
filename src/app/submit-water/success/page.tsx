// src/app/submit-water/success/page.tsx
import React from "react";
import Link from "next/link";
import { CheckCircle2, MapPin, Compass, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function SubmissionSuccessPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar showSearch={false} />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 pb-24 md:pb-8">
        <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-xl text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center shadow-xs">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Submission Received!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Thank you for contributing to IroWa. Your suggested water source has entered the review queue. Local municipal authorities and community moderators will verify the coordinates before publishing it on the live map.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Link
              href="/home"
              className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Compass className="h-4 w-4" />
              <span>Explore Interactive Map</span>
            </Link>

            <Link
              href="/water"
              className="w-full h-11 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
            >
              Browse Directory
            </Link>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
