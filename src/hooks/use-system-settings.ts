// src/hooks/use-system-settings.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { getSystemSettingsAction, SystemSettingsData } from "@/actions/settings-actions";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export const DEFAULT_SYSTEM_SETTINGS: SystemSettingsData = {
  appName: "IroWa",
  tagline: "Irosin Water Resources Map",
  emergencyHotline: "0917-123-4567",
  alertBannerEnabled: true,
  alertBannerText: "Water Advisory: Regular conservation guidelines in effect for low-elevation barangays.",
  mapCenterLat: 12.7042,
  mapCenterLng: 124.0326,
  defaultZoom: 13,
};

// Global in-memory cache for instant 0ms access across client pages
let cachedSettings: SystemSettingsData | null = null;
const listeners = new Set<(settings: SystemSettingsData) => void>();

function notifyListeners(next: SystemSettingsData) {
  cachedSettings = next;
  listeners.forEach((listener) => listener(next));
}

export function useSystemSettings() {
  const [settings, setSettings] = useState<SystemSettingsData>(
    cachedSettings || DEFAULT_SYSTEM_SETTINGS
  );
  const [loading, setLoading] = useState(!cachedSettings);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await getSystemSettingsAction();
      notifyListeners(data);
    } catch (err) {
      console.warn("Failed to load live settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // 1. Subscribe to local shared state changes
    const listener = (newSettings: SystemSettingsData) => {
      if (!isMounted) return;
      setSettings(newSettings);
      setLoading(false);
    };
    listeners.add(listener);

    // 2. Fetch fresh settings on mount
    fetchSettings();

    // 3. Realtime subscription to postgres_changes on "application_settings"
    if (!isSupabaseConfigured()) {
      return () => {
        isMounted = false;
        listeners.delete(listener);
      };
    }

    const supabase = createClient();
    const channelName = `realtime_system_settings_${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "application_settings",
        },
        async () => {
          // Immediately re-fetch settings from server action to ensure full mapping & integrity
          try {
            const fresh = await getSystemSettingsAction();
            if (isMounted) {
              notifyListeners(fresh);
            }
          } catch (err) {
            console.warn("Failed to refresh system settings on realtime event:", err);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      listeners.delete(listener);
      supabase.removeChannel(channel);
    };
  }, [fetchSettings]);

  return { settings, loading, refresh: fetchSettings };
}

