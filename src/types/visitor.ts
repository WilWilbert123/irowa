// src/types/visitor.ts
export interface VisitorProfile {
  visitorId: string;
  displayName: string;
  createdAt: string;
  isRestricted?: boolean;
}

export interface VisitorPreferences {
  theme: "light" | "dark" | "system";
  mapStyle: "standard" | "satellite" | "terrain";
  pushNotificationsEnabled: boolean;
  soundEnabled: boolean;
  savedSources: string[]; // water source IDs
}
