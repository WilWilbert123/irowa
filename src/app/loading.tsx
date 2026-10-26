// src/app/loading.tsx
export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500 tracking-wider">
          Loading IroWa...
        </span>
      </div>
    </div>
  );
}
