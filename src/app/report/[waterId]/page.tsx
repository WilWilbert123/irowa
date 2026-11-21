// src/app/report/[waterId]/page.tsx
import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ReportForm } from "@/components/reports/report-form";
import { getWaterSourceById, getWaterSourceBySlug } from "@/lib/services/water-service";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default async function ReportWaterPage({
  params,
}: {
  params: Promise<{ waterId: string }>;
}) {
  const { waterId } = await params;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(waterId);
  const source = isUuid
    ? await getWaterSourceById(waterId)
    : await getWaterSourceBySlug(waterId);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Navbar showSearch={false} />
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-w-0 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full space-y-6 pb-28 md:pb-12">
          {source ? (
            <ReportForm
              waterSourceId={source.id}
              waterSourceName={source.name}
            />
          ) : (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Water Resource Not Found</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                The water point you are trying to report could not be found or may have been deleted.
              </p>
              <Link
                href="/map"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Interactive Map
              </Link>
            </div>
          )}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
