// src/hooks/use-admin-session.ts
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Hook to detect if the current viewer accessed the public site from the Admin Console.
 * Keeps public users free from seeing any admin links while providing administrators
 * a seamless "Back to Admin" button.
 */
export function useIsAdminSession() {
  const [isAdmin, setIsAdmin] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // 1. Check URL query parameter ?from=admin
    const fromParam = searchParams.get("from");
    if (fromParam === "admin") {
      setIsAdmin(true);
      try {
        sessionStorage.setItem("irowa_admin_view_active", "true");
      } catch {}
      return;
    }

    // 2. Check sessionStorage
    try {
      const stored = sessionStorage.getItem("irowa_admin_view_active");
      if (stored === "true") {
        setIsAdmin(true);
        return;
      }
    } catch {}

    setIsAdmin(false);
  }, [searchParams]);

  return isAdmin;
}

