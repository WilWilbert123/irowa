// src/app/water/[waterId]/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { WaterDetailView } from "@/components/water/water-detail-view";
import { getWaterSourceById, getWaterSourceBySlug } from "@/lib/services/water-service";

export default async function WaterDetailPage({
  params,
}: {
  params: Promise<{ waterId: string }>;
}) {
  const { waterId } = await params;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(waterId);
  const source = isUuid
    ? await getWaterSourceById(waterId)
    : await getWaterSourceBySlug(waterId);

  if (!source) {
    notFound();
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Navbar showSearch={false} />
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-w-0 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full pb-28 md:pb-12">
          <WaterDetailView source={source} />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
