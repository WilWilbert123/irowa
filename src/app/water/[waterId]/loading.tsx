// src/app/water/[waterId]/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingWaterDetail() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 sm:p-8">
      <Skeleton className="h-6 w-32 rounded-lg" />
      <Skeleton className="h-80 w-full rounded-3xl" />
      <div className="space-y-4 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
        <Skeleton className="h-8 w-2/3 rounded-lg" />
        <Skeleton className="h-4 w-1/2 rounded-md" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    </div>
  );
}
