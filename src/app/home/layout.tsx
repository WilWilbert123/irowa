// src/app/home/layout.tsx
import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 min-h-0 relative overflow-hidden flex flex-col">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
