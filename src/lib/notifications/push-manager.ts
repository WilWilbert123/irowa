// src/lib/notifications/push-manager.ts
import { isPushNotificationSupported, urlBase64ToUint8Array } from "./notification-utils";
import { requestNotificationPermission } from "./notification-permissions";
import { createClient } from "../supabase/client";

/**
 * Safely retrieves or registers the service worker without hanging indefinitely.  
 */
export async function getOrRegisterServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  try {
    let reg = await navigator.serviceWorker.getRegistration();
    if (!reg) {
      reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    }
    // Timeout safeguard for navigator.serviceWorker.ready so it never blocks
    const readyPromise = navigator.serviceWorker.ready;
    const timeoutPromise = new Promise<ServiceWorkerRegistration>((_, reject) =>
      setTimeout(() => reject(new Error("Service worker activation timed out")), 4000)
    );
    return await Promise.race([readyPromise, timeoutPromise]);
  } catch (err) {
    console.warn("Could not register or activate service worker:", err);
    return null;
  }
}

export async function subscribeToPushNotifications(visitorId?: string): Promise<{
  success: boolean;
  subscription?: PushSubscription;
  error?: string;
}> {
  try {
    if (!isPushNotificationSupported()) {
      return { success: false, error: "Push notifications are not supported on this device/browser." };
    }

    const permission = await requestNotificationPermission();
    if (permission !== "granted") {
      return {
        success: false,
        error:
          permission === "denied"
            ? "Notification permission was blocked in your browser settings. Please permit notifications to receive alerts."
            : "Notification permission request was dismissed.",
      };
    }

    const registration = await getOrRegisterServiceWorker();
    const vapidPublicKey =
      process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    if (!registration || !vapidPublicKey || vapidPublicKey.includes("placeholder") || vapidPublicKey.includes("your-")) {
      // Permission granted, supported in-app
      return { success: true };
    }

    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as unknown as BufferSource,
      });
    }

    // Persist subscription in Supabase
    try {
      const supabase = createClient();
      await supabase.from("push_subscriptions").upsert(
        {
          visitor_id: visitorId || null,
          endpoint: subscription.endpoint,
          subscription_data: subscription.toJSON() as any,
        },
        { onConflict: "endpoint" }
      );
    } catch (dbErr) {
      console.warn("Could not record subscription in Supabase:", dbErr);
    }

    return { success: true, subscription };
  } catch (err: any) {
    console.warn("Push subscription warning:", err);
    // If notification permission was granted, consider it enabled for browser notifications
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      return { success: true };
    }
    return { success: false, error: err.message || "Failed to subscribe to push notifications" };
  }
}

export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  try {
    if (!isPushNotificationSupported()) return true;
    const registration = await getOrRegisterServiceWorker();
    if (!registration) return true;

    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      // Remove from database
      try {
        const supabase = createClient();
        await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
      } catch { }
      return true;
    }
    return true;
  } catch {
    return true;
  }
}
