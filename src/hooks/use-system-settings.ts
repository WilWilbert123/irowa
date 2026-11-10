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
  hideMapPoiMarkers: false,
};

// Global in-memory cache and subscriber management for 0ms shared state
let cachedSettings: SystemSettingsData | null = null;
const listeners = new Set<(settings: SystemSettingsData) => void>();
const SHARED_SETTINGS_CHANNEL = "system_settings_realtime";
let activeChannel: any = null;

function notifyListeners(next: SystemSettingsData) {
  cachedSettings = next;
  listeners.forEach((listener) => listener(next));
}

export function updateCachedSettings(updates: Partial<SystemSettingsData>) {
  const current = cachedSettings || DEFAULT_SYSTEM_SETTINGS;
  const updated = { ...current, ...updates };
  notifyListeners(updated);
}

export function broadcastSystemSettingsUpdate(updates: Partial<SystemSettingsData>) {
  updateCachedSettings(updates);
  if (activeChannel) {
    try {
      activeChannel.send({
        type: "broadcast",
        event: "settings_updated",
        payload: updates,
      });
    } catch {
      // safe fallback
    }
  }
}

function ensureRealtimeSubscription() {
  if (!isSupabaseConfigured() || activeChannel) return;

  try {
    const supabase = createClient();
    const channel = supabase.channel(SHARED_SETTINGS_CHANNEL, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "settings_updated" }, (payload: any) => {
        if (payload?.payload) {
          updateCachedSettings(payload.payload);
        }
      })
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "application_settings",
        },
        async () => {
          try {
            const fresh = await getSystemSettingsAction();
            notifyListeners(fresh);
          } catch (err) {
            console.warn("Failed to refresh system settings on realtime event:", err);
          }
        }
      )
      .subscribe();

    activeChannel = channel;
  } catch (err) {
    console.warn("Could not initialize system settings realtime channel:", err);
  }
}

function cleanupRealtimeSubscription() {
  if (activeChannel && listeners.size === 0) {
    try {
      const supabase = createClient();
      supabase.removeChannel(activeChannel);
    } catch {
      // safe fallback
    }
    activeChannel = null;
  }
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

    // 1. Subscribe component to shared in-memory settings
    const listener = (newSettings: SystemSettingsData) => {
      if (!isMounted) return;
      setSettings(newSettings);
      setLoading(false);
    };
    listeners.add(listener);

    // 2. Initial fetch
    fetchSettings();

    // 3. Ensure single shared realtime channel is active
    ensureRealtimeSubscription();

    return () => {
      isMounted = false;
      listeners.delete(listener);
      cleanupRealtimeSubscription();
    };
  }, [fetchSettings]);

  return { settings, loading, refresh: fetchSettings };
}
