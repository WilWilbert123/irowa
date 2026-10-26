// src/app/water/[waterId]/not-found.tsx
import Link from "next/link";
import { Droplet, ArrowLeft } from "lucide-react";

export default function WaterNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center">
        <Droplet className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Water Resource Not Found</h2>
      <p className="text-sm text-slate-500 max-w-sm">
        The requested water resource could not be found or may have been unlisted by municipal administrators.
      </p>
      <Link
        href="/water"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Water Directory</span>
      </Link>
    </div>
  );
}
