// src/lib/notifications/notification-permissions.ts
import { isPushNotificationSupported } from "./notification-utils";

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushNotificationSupported()) {
    throw new Error("Push notifications are not supported by this browser.");
  }

  return await Notification.requestPermission();
}

export function getNotificationPermissionStatus(): NotificationPermission {
  if (!isPushNotificationSupported()) return "denied";
  return Notification.permission;
}
