// src/lib/notifications/push-manager.ts
import { isPushNotificationSupported, urlBase64ToUint8Array } from "./notification-utils";
import { requestNotificationPermission } from "./notification-permissions";
import { createClient } from "../supabase/client";

export async function subscribeToPushNotifications(visitorId?: string): Promise<{
  success: boolean;
  subscription?: PushSubscription;
  error?: string;
}> {
  try {
    if (!isPushNotificationSupported()) {
      return { success: false, error: "Push notifications not supported on this device." };
    }

    const permission = await requestNotificationPermission();
    if (permission !== "granted") {
      return { success: false, error: "Notification permission was not granted." };
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey || vapidPublicKey.includes("placeholder") || vapidPublicKey.includes("your-")) {
      return {
        success: false,
        error: "Push Notification VAPID / Firebase Web Key is not configured. Please add NEXT_PUBLIC_FIREBASE_VAPID_KEY in .env.local.",
      };
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as unknown as BufferSource,
      });
    }

    // Persist subscription in Supabase
    const supabase = createClient();
    await supabase.from("push_subscriptions").upsert(
      {
        visitor_id: visitorId || null,
        endpoint: subscription.endpoint,
        subscription_data: subscription.toJSON() as any,
      },
      { onConflict: "endpoint" }
    );

    return { success: true, subscription };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to subscribe to push notifications" };
  }
}

export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  try {
    if (!isPushNotificationSupported()) return false;
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      // Remove from database
      const supabase = createClient();
      await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
