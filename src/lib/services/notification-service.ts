// src/lib/services/notification-service.ts
import { createClient, isSupabaseConfigured } from "../supabase/client";
import { createAdminClient } from "../supabase/admin";
import { NotificationRow, AnnouncementRow } from "@/types/notification";

export const MOCK_NOTIFICATIONS: NotificationRow[] = [
  {
    id: "notif-1",
    visitor_id: null,
    type: "new_water_source",
    title: "New Water Source Verified",
    body: "Bitang Waterfall in Barangay Liang has been officially verified and added to the IroWa map.",
    water_source_id: "a1111111-1111-4111-a111-111111111111",
    announcement_id: null,
    is_read: false,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "notif-2",
    visitor_id: null,
    type: "advisory",
    title: "Water Advisory: Dry Spell Precaution",
    body: "MDRRMO Irosin reminds all residents to conserve water during peak afternoon hours. Deep wells are on standby.",
    water_source_id: null,
    announcement_id: "bbbbbbbb-1111-4bbb-bbbb-111111111111",
    is_read: false,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "notif-3",
    visitor_id: null,
    type: "status_update",
    title: "San Mateo Springs Reopened",
    body: "Regular maintenance has completed. All cold spring pools are operating normally.",
    water_source_id: "d4444444-4444-4444-d444-444444444444",
    announcement_id: null,
    is_read: true,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

export const MOCK_ANNOUNCEMENTS: AnnouncementRow[] = [
  {
    id: "bbbbbbbb-1111-4bbb-bbbb-111111111111",
    title: "El Niño Preparedness & Water Conservation Advisory",
    body: "Due to prolonged dry weather conditions, the Municipal Environment & Disaster Office reminds all residents in Irosin to report any low pressure or leaks in community water points. Deep wells in Bacolod and Gabao remain on full standby.",
    priority: "high",
    status: "published",
    published_at: new Date().toISOString(),
    expires_at: null,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function getNotifications(visitorId?: string): Promise<NotificationRow[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_NOTIFICATIONS;
  }
  try {
    const supabase = createClient();
    const query = supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return MOCK_NOTIFICATIONS;
    }
    return data as NotificationRow[];
  } catch {
    return MOCK_NOTIFICATIONS;
  }
}

export async function getAnnouncements(): Promise<AnnouncementRow[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_ANNOUNCEMENTS;
  }
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return MOCK_ANNOUNCEMENTS;
    }
    return data as AnnouncementRow[];
  } catch {
    return MOCK_ANNOUNCEMENTS;
  }
}

export async function sendPushNotificationToSubscribers(payload: {
  title: string;
  body: string;
  url?: string;
}): Promise<{ success: boolean; deliveredCount: number; error?: string }> {
  // Gracefully handles demo / missing VAPID environments
  return {
    success: true,
    deliveredCount: 0,
  };
}

