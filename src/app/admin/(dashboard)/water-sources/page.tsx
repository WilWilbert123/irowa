// src/app/admin/(dashboard)/water-sources/page.tsx
import React from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { getAllWaterSourcesAdmin } from "@/lib/services/water-service";
import { archiveWaterSourceAction } from "@/actions/water-actions";
import { AVAILABILITY_BADGES, CATEGORY_COLORS } from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/date-utils";
import { Eye, Edit, Trash2, PlusCircle, Droplet } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function AdminWaterSourcesPage() {
  const sources = await getAllWaterSourcesAdmin();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Water Sources Management"
        subtitle={`Managing ${sources.length} approved municipal and natural water resources.`}
        actionButton={{
          href: "/admin/water-sources/new",
          label: "Create New Resource",
        }}
      />

      {/* Table Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Resource Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Barangay</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Verified</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {sources.map((source) => {
                const badge = AVAILABILITY_BADGES[source.availability_status] || AVAILABILITY_BADGES["Available"];
                const catDef = CATEGORY_COLORS[source.category] || CATEGORY_COLORS["Other"];

                return (
                  <tr key={source.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900 dark:text-white">
                      <Link href={`/admin/water-sources/${source.id}`} className="hover:text-blue-500">
                        {source.name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={cn("px-2 py-0.5 rounded-full font-medium text-[11px]", catDef.bg, catDef.text)}>
                        {source.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      {source.barangay ? `Brgy. ${source.barangay}` : "Irosin"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={cn("px-2 py-0.5 rounded-full font-semibold text-[10px] inline-flex items-center gap-1", badge.bg)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", badge.dot)} />
                        {source.availability_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {formatDate(source.last_verified_at)}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right space-x-2">
                      <Link
                        href={`/water/${source.slug}`}
                        target="_blank"
                        className="inline-flex p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View Public Page"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/water-sources/${source.id}/edit`}
                        className="inline-flex p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Details"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <form
                        action={async () => {
                          "use server";
                          await archiveWaterSourceAction(source.id);
                        }}
                        className="inline"
                      >
                        <button
                          type="submit"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Archive / Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
