// src/contexts/visitor-context.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { VisitorProfile, VisitorPreferences } from "@/types/visitor";

interface VisitorContextType {
  visitor: VisitorProfile | null;
  preferences: VisitorPreferences;
  isInitialized: boolean;
  setDisplayName: (name: string) => void;
  toggleSavedSource: (sourceId: string) => void;
  isSaved: (sourceId: string) => boolean;
  updatePreferences: (partial: Partial<VisitorPreferences>) => void;
}

const DEFAULT_PREFERENCES: VisitorPreferences = {
  theme: "system",
  mapStyle: "satellite",
  pushNotificationsEnabled: false,
  soundEnabled: true,
  savedSources: [],
};

const VisitorContext = createContext<VisitorContextType | undefined>(undefined);

const STORAGE_KEY_VISITOR = "irowa_visitor_profile";
const STORAGE_KEY_PREFS = "irowa_visitor_prefs";

export function VisitorProvider({ children }: { children: React.ReactNode }) {
  const [visitor, setVisitor] = useState<VisitorProfile | null>(null);
  const [preferences, setPreferences] = useState<VisitorPreferences>(DEFAULT_PREFERENCES);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedVisitor = localStorage.getItem(STORAGE_KEY_VISITOR);
      if (storedVisitor) {
        setVisitor(JSON.parse(storedVisitor));
      } else {
        // Generate anonymous visitor profile
        const newVisitor: VisitorProfile = {
          visitorId: `v_${crypto.randomUUID()}`,
          displayName: "",
          createdAt: new Date().toISOString(),
        };
        setVisitor(newVisitor);
        localStorage.setItem(STORAGE_KEY_VISITOR, JSON.stringify(newVisitor));
      }

      const storedPrefs = localStorage.getItem(STORAGE_KEY_PREFS);
      if (storedPrefs) {
        setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(storedPrefs) });
      }
    } catch {
      // Fallback for private browsing where localStorage is restricted
      const fallbackVisitor: VisitorProfile = {
        visitorId: `v_${Date.now()}_temp`,
        displayName: "",
        createdAt: new Date().toISOString(),
      };
      setVisitor(fallbackVisitor);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const setDisplayName = (name: string) => {
    if (!visitor) return;
    const updated = { ...visitor, displayName: name.trim() };
    setVisitor(updated);
    try {
      localStorage.setItem(STORAGE_KEY_VISITOR, JSON.stringify(updated));
    } catch {}
  };

  const toggleSavedSource = (sourceId: string) => {
    setPreferences((prev) => {
      const exists = prev.savedSources.includes(sourceId);
      const updatedSources = exists
        ? prev.savedSources.filter((id) => id !== sourceId)
        : [...prev.savedSources, sourceId];

      const newPrefs = { ...prev, savedSources: updatedSources };
      try {
        localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(newPrefs));
      } catch {}
      return newPrefs;
    });
  };

  const isSaved = (sourceId: string) => {
    return preferences.savedSources.includes(sourceId);
  };

  const updatePreferences = (partial: Partial<VisitorPreferences>) => {
    setPreferences((prev) => {
      const newPrefs = { ...prev, ...partial };
      try {
        localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(newPrefs));
      } catch {}
      return newPrefs;
    });
  };

  return (
    <VisitorContext.Provider
      value={{
        visitor,
        preferences,
        isInitialized,
        setDisplayName,
        toggleSavedSource,
        isSaved,
        updatePreferences,
      }}
    >
      {children}
    </VisitorContext.Provider>
  );
}

export function useVisitor() {
  const context = useContext(VisitorContext);
  if (!context) {
    throw new Error("useVisitor must be used within a VisitorProvider");
  }
  return context;
}
