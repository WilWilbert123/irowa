// src/hooks/use-reports.ts
"use client";

import { useState, useEffect } from "react";
import { WaterReportWithDetails } from "@/types/report";
import { getReportsAdmin } from "@/lib/services/report-service";

export function useReports() {
  const [reports, setReports] = useState<WaterReportWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const data = await getReportsAdmin();
      setReports(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return { reports, isLoading, refetch: fetchReports };
}
