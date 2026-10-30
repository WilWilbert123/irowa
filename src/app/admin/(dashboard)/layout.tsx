// src/app/admin/(dashboard)/layout.tsx
import React from "react";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";

export const metadata = {
  title: "IroWa Admin Dashboard | Control Center",
  description: "Administrative console for managing Irosin municipal water sources, submissions, community reports, and emergency advisories.",
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
