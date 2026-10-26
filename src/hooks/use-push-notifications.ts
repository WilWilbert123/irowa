// src/hooks/use-push-notifications.ts
"use client";

import { useNotifications } from "@/contexts/notification-context";

export function usePushNotifications() {
  const { pushEnabled, togglePushNotifications } = useNotifications();
  return { pushEnabled, togglePushNotifications };
}
