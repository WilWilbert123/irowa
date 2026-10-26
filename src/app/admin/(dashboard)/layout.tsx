// src/app/admin/(dashboard)/layout.tsx
import React from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        <div className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
