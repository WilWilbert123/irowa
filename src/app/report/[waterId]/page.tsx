// src/app/report/[waterId]/page.tsx
import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ReportForm } from "@/components/reports/report-form";
import { getWaterSourceById, getWaterSourceBySlug } from "@/lib/services/water-service";
import { notFound } from "next/navigation";

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
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar showSearch={false} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full pb-24 md:pb-8">
          <ReportForm
            waterSourceId={source?.id || waterId}
            waterSourceName={source?.name || "Selected Water Resource"}
          />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
