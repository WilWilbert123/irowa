// src/app/not-found.tsx
import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-center">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-xl space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center">
          <Compass className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Page Not Found</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          The requested page or resource could not be found on IroWa.
        </p>
        <div className="pt-2">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Water Map</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
