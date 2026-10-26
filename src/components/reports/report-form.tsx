// src/components/reports/report-form.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useVisitor } from "@/contexts/visitor-context";
import { submitReportAction } from "@/actions/report-actions";
import { reportTypes } from "@/lib/validations/report-schema";
import { AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";

interface ReportFormProps {
  waterSourceId: string;
  waterSourceName?: string;
}

export function ReportForm({ waterSourceId, waterSourceName }: ReportFormProps) {
  const router = useRouter();
  const { visitor } = useVisitor();
  const [reportType, setReportType] = useState(reportTypes[0]);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length < 5) {
      setErrorMsg("Please provide more detail (at least 5 characters).");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await submitReportAction({
        water_source_id: waterSourceId,
        visitor_id: visitor?.visitorId || `v_${Date.now()}`,
        report_type: reportType,
        description: description.trim(),
      });

      if ("success" in res && res.success) {
        setIsSuccess(true);
      } else {
        setErrorMsg((res as any).error || "Failed to submit report");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Report Submitted</h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Thank you for helping keep IroWa accurate and safe. Local administrators and MDRRMO will review your feedback promptly.
        </p>
        <button
          onClick={() => router.push(`/water/${waterSourceId}`)}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
        >
          Return to Water Source
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
      <div>
        <h2 className="font-bold text-lg text-slate-900 dark:text-white">
          Report Issue: {waterSourceName || "Water Resource"}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Help community members and responders by reporting dry conditions, incorrect map pins, or safety concerns.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Reason for Report <span className="text-rose-500">*</span>
        </label>
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value as any)}
          className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
        >
          {reportTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Detailed Observations <span className="text-rose-500">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Please describe what you observed (e.g. water stopped flowing, broken pipe, water has sulfuric odor, marker is 200m south)..."
          required
          className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
      >
        {isSubmitting ? "Submitting..." : "Submit Community Report"}
      </button>
    </form>
  );
}
