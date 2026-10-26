// src/app/submit-water/page.tsx
import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SubmissionForm } from "@/components/submissions/submission-form";
import { PlusCircle } from "lucide-react";

export default function SubmitWaterPage() {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Navbar showSearch={false} />
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-w-0 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto w-full space-y-6 pb-28 md:pb-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
              <PlusCircle className="h-4 w-4" />
              <span>Community Contribution</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Suggest a Water Source
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Share a functioning spring, deep well, emergency communal tap, or refilling station in Irosin.
            </p>
          </div>

          <SubmissionForm />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
