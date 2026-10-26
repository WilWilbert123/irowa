// src/actions/notification-actions.ts
"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { announcementSchema } from "@/lib/validations/admin-schema";
import { logAdminAction } from "@/lib/services/audit-service";
import { getAnnouncements, getNotifications, sendPushNotificationToSubscribers } from "@/lib/services/notification-service";
import { revalidatePath } from "next/cache";

export async function getActiveAnnouncementsAction() {
  return await getAnnouncements();
}

export async function getUserNotificationsAction(visitorId?: string) {
  return await getNotifications(visitorId);
}

export async function createAnnouncementAction(formData: any) {
  const validated = announcementSchema.safeParse(formData);
  if (!validated.success) {
    return { error: (validated.error as any).issues?.[0]?.message || "Validation failed" };
  }

  const { title, body, priority, status, expires_at } = validated.data;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("announcements")
      .insert({
        title,
        body,
        priority,
        status,
        expires_at: expires_at || null,
        published_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) return { error: error.message };

    // Broadcast system notification
    await admin.from("notifications").insert({
      type: "announcement",
      title,
      body: body.slice(0, 150) + "...",
      announcement_id: data.id,
      is_read: false,
    });

    await logAdminAction("CREATE_ANNOUNCEMENT", "announcement", data.id, { title, priority });

    revalidatePath("/admin/announcements");
    revalidatePath("/notifications");
    return { success: true, id: data.id };
  } catch (err: any) {
    return { error: err.message || "Failed to publish announcement" };
  }
}

export async function sendBroadcastNotificationAction(data: {
  title: string;
  body: string;
  water_source_id?: string;
  announcement_id?: string;
}) {
  try {
    const admin = createAdminClient();
    await admin.from("notifications").insert({
      type: "advisory",
      title: data.title,
      body: data.body,
      water_source_id: data.water_source_id || null,
      announcement_id: data.announcement_id || null,
      is_read: false,
    });

    await sendPushNotificationToSubscribers({
      title: data.title,
      body: data.body,
      url: data.water_source_id ? `/water/${data.water_source_id}` : "/notifications",
    });

    await logAdminAction("DISPATCH_BROADCAST_NOTIFICATION", "notification", undefined, {
      title: data.title,
    });

    revalidatePath("/notifications");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to broadcast notification" };
  }
}
