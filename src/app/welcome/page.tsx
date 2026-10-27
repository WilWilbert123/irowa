// src/app/welcome/page.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useVisitor } from "@/contexts/visitor-context";
import { ArrowRight } from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();
  const { visitor, setDisplayName } = useVisitor();
  const [nameInput, setNameInput] = useState(visitor?.displayName || "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim().length > 0) {
      if (nameInput.trim().length < 2) {
        setErrorMsg("Display name must be at least 2 characters.");
        return;
      }
      setDisplayName(nameInput.trim());
    }
    router.push("/home");
  };

  return (
    <main className="min-h-dvh w-full flex items-center justify-center p-4 sm:p-6 bg-radial from-slate-900 via-slate-950 to-black text-white overflow-y-auto">
      <div className="w-full max-w-sm sm:max-w-md rounded-2xl sm:rounded-3xl bg-slate-900/85 backdrop-blur-2xl border border-slate-800/80 p-6 sm:p-8 shadow-2xl shadow-black/60 space-y-6 my-auto">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-blue-600 to-teal-400 p-0.5 shadow-lg shadow-blue-500/20 mb-3 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[14px] sm:rounded-[22px] flex items-center justify-center">
              <Image
                src="/images/irowa-logo.svg"
                alt="IroWa"
                width={36}
                height={36}
                className="w-8 h-8 sm:w-9 sm:h-9"
                priority
              />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              IroWa
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xs mx-auto">
            Community Water Resources Map for Irosin
          </p>
        </div>

        {/* Onboarding Name Form */}
        <form onSubmit={handleContinue} className="space-y-4 pt-1">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="display-name-input"
                className="block text-xs font-semibold text-slate-300"
              >
                Display Name
              </label>
              <span className="text-[11px] text-slate-500">Optional</span>
            </div>
            <input
              id="display-name-input"
              type="text"
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="e.g. Maria S."
              maxLength={40}
              className="w-full h-11 sm:h-12 px-4 rounded-xl sm:rounded-2xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-colors"
            />
            {errorMsg && (
              <span className="text-xs text-rose-400 mt-1.5 block">
                {errorMsg}
              </span>
            )}
          </div>

          <button
            id="continue-button"
            type="submit"
            className="w-full h-11 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{nameInput.trim() ? "Set Name & Open Map" : "Open Map"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <Link
            id="skip-link"
            href="/home"
            className="block w-full text-center text-xs text-slate-400 hover:text-white transition-colors py-1.5 cursor-pointer"
          >
            Skip for now, browse anonymously
          </Link>
        </form>
      </div>
    </main>
  );
}
