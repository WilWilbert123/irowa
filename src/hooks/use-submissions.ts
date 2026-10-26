// src/hooks/use-submissions.ts
"use client";

import { useState, useEffect } from "react";
import { WaterSubmissionWithPhotos } from "@/types/submission";
import { getSubmissionsAdmin } from "@/lib/services/submission-service";

export function useSubmissions() {
  const [submissions, setSubmissions] = useState<WaterSubmissionWithPhotos[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const data = await getSubmissionsAdmin();
      setSubmissions(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  return { submissions, isLoading, refetch: fetchSubmissions };
}
