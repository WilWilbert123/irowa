// src/app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useVisitor } from "@/contexts/visitor-context";

export default function RootPage() {
  const router = useRouter();
  const { visitor, isInitialized } = useVisitor();

  useEffect(() => {
    if (!isInitialized) return;

    // If visitor already set a name or visited before, go to /home
    if (visitor?.displayName && visitor.displayName.trim().length > 0) {
      router.replace("/home");
    } else {
      router.replace("/welcome");
    }
  }, [isInitialized, visitor, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-900 text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold tracking-wider text-slate-400">
          Entering IroWa...
        </span>
      </div>
    </div>
  );
}
