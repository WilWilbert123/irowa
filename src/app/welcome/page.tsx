// src/app/welcome/page.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useVisitor } from "@/contexts/visitor-context";
import { Droplet, MapPin, MessageSquare, ArrowRight, ShieldCheck, Compass } from "lucide-react";

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

  const handleSkip = () => {
    router.push("/home");
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-radial from-slate-900 via-slate-950 to-black text-white">
      <div className="w-full max-w-md rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-teal-400 p-0.5 shadow-lg shadow-blue-500/20 mb-3 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center">
              <Image
                src="/images/irowa-logo.svg"
                alt="IroWa"
                width={36}
                height={36}
                className="w-9 h-9"
                priority
              />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome to <span className="text-blue-400">IroWa</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
            Irosin Water Resources Map — Discover, share, and discuss community water points during dry spells and emergencies.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-3 gap-2.5 pt-2">
          <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-800 text-center space-y-1">
            <Compass className="h-5 w-5 text-blue-400 mx-auto" />
            <span className="text-[10px] font-semibold text-slate-300 block">Interactive Map</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-800 text-center space-y-1">
            <Droplet className="h-5 w-5 text-teal-400 mx-auto" />
            <span className="text-[10px] font-semibold text-slate-300 block">Verified Status</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-800 text-center space-y-1">
            <MessageSquare className="h-5 w-5 text-indigo-400 mx-auto" />
            <span className="text-[10px] font-semibold text-slate-300 block">Live Chat</span>
          </div>
        </div>

        {/* Onboarding Name Input */}
        <form onSubmit={handleContinue} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Choose a Display Name (Optional)
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="e.g. Maria S., Juan from Gabao"
              maxLength={40}
              className="w-full h-12 px-4 rounded-2xl bg-slate-800 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {errorMsg && (
              <span className="text-xs text-rose-400 mt-1 block">{errorMsg}</span>
            )}
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Your name is shown when contributing reports, questions, or updates in community chat. No account password required.
            </p>
          </div>

          <button
            type="submit"
            className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{nameInput.trim() ? "Set Name & Open Map" : "Open Map as Resident"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="w-full text-center text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Skip for now & browse anonymously
          </button>
        </form>

        <div className="pt-2 text-center border-t border-slate-800/60">
          <span className="text-[11px] text-slate-500">
            For Irosin residents, visitors, and emergency responders.
          </span>
        </div>
      </div>
    </main>
  );
}
