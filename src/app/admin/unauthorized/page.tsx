// src/app/admin/unauthorized/page.tsx
import Link from "next/link";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";
import { logoutAdminAction } from "@/actions/admin-auth-actions";

export default function AdminUnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-white">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl text-center space-y-5">
        <div className="mx-auto w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-black">Unauthorized Access</h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Your account is authenticated, but does not have an active administrator profile linked in the system.
        </p>

        <div className="pt-2 flex flex-col gap-2.5">
          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out Current Account</span>
            </button>
          </form>

          <Link
            href="/home"
            className="w-full h-11 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Public Water Map</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
