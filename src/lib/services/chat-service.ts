// src/lib/services/chat-service.ts
import { createClient, isSupabaseConfigured } from "../supabase/client";
import { createAdminClient } from "../supabase/admin";
import { ChatMessageRow, ChatRoomWithSource } from "@/types/chat";
import { checkRateLimit } from "../utils/rate-limit";

// Sample active discussions for demo/fallback mode
export const MOCK_CHAT_MESSAGES: Record<string, ChatMessageRow[]> = {
  "a1111111-1111-4111-a111-111111111111": [
    {
      id: "m1",
      chat_room_id: "room-bitang",
      visitor_id: "v_juan",
      display_name: "Juan Dela Cruz",
      message: "Is the trail to Bitang Waterfall safe today? Did it rain heavily last night?",
      status: "published",
      moderation_reason: null,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: "m2",
      chat_room_id: "room-bitang",
      visitor_id: "v_elena",
      display_name: "Elena Ramos",
      message: "The trail is dry and clear! Local guides are at the trailhead in Brgy. Liang.",
      status: "published",
      moderation_reason: null,
      created_at: new Date(Date.now() - 1800000).toISOString(),
      updated_at: new Date(Date.now() - 1800000).toISOString(),
    },
  ],
  "c3333333-3333-4333-c333-333333333333": [
    {
      id: "m3",
      chat_room_id: "room-maasim",
      visitor_id: "v_maria",
      display_name: "Maria Santos",
      message: "May I ask if the water level at Maasim River is still good for swimming?",
      status: "published",
      moderation_reason: null,
      created_at: new Date(Date.now() - 300000).toISOString(),
      updated_at: new Date(Date.now() - 300000).toISOString(),
    },
    {
      id: "m4",
      chat_room_id: "room-maasim",
      visitor_id: "v_rizal",
      display_name: "Rizal Dela Cruz",
      message: "Yes, it is still good! The water is clear and safe as of this morning.",
      status: "published",
      moderation_reason: null,
      created_at: new Date(Date.now() - 120000).toISOString(),
      updated_at: new Date(Date.now() - 120000).toISOString(),
    },
  ],
};

export async function getChatRoomForWaterSource(waterSourceId: string): Promise<string> {
  if (!isSupabaseConfigured()) {
    return `room-${waterSourceId}`;
  }
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("chat_rooms")
      .select("id")
      .eq("water_source_id", waterSourceId)
      .single();

    if (error || !data) {
      // Create room if it doesn't exist
      const admin = createAdminClient();
      const { data: newRoom } = await admin
        .from("chat_rooms")
        .insert({ water_source_id: waterSourceId, is_active: true })
        .select("id")
        .single();
      return newRoom?.id || `room-${waterSourceId}`;
    }
    return data.id;
  } catch {
    return `room-${waterSourceId}`;
  }
}

export async function getChatMessages(waterSourceId: string, limit: number = 50): Promise<ChatMessageRow[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }
  try {
    const roomId = await getChatRoomForWaterSource(waterSourceId);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("chat_room_id", roomId)
      .eq("status", "published")
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error || !data) {
      return [];
    }
    return data as ChatMessageRow[];
  } catch {
    return [];
  }
}

export async function sendChatMessage(
  waterSourceId: string,
  visitorId: string,
  displayName: string,
  message: string
): Promise<{ success: boolean; data?: ChatMessageRow; error?: string }> {
  // Rate limiting check
  const rateLimit = checkRateLimit(`chat:${visitorId}`, 15, 60000);
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: `Too many messages sent. Please wait ${rateLimit.retryAfterSeconds} seconds.`,
    };
  }

  const roomId = await getChatRoomForWaterSource(waterSourceId);

  if (!isSupabaseConfigured()) {
    const newMsg: ChatMessageRow = {
      id: `mock-${Date.now()}`,
      chat_room_id: roomId,
      visitor_id: visitorId,
      display_name: displayName,
      message: message.trim(),
      status: "published",
      moderation_reason: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (!MOCK_CHAT_MESSAGES[waterSourceId]) {
      MOCK_CHAT_MESSAGES[waterSourceId] = [];
    }
    MOCK_CHAT_MESSAGES[waterSourceId].push(newMsg);
    return { success: true, data: newMsg };
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        chat_room_id: roomId,
        visitor_id: visitorId,
        display_name: displayName,
        message: message.trim(),
        status: "published",
      })
      .select()
      .single();

    if (error) {
      // Offline fallback: append to mock
      const newMsg: ChatMessageRow = {
        id: `mock-${Date.now()}`,
        chat_room_id: roomId,
        visitor_id: visitorId,
        display_name: displayName,
        message: message.trim(),
        status: "published",
        moderation_reason: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (!MOCK_CHAT_MESSAGES[waterSourceId]) {
        MOCK_CHAT_MESSAGES[waterSourceId] = [];
      }
      MOCK_CHAT_MESSAGES[waterSourceId].push(newMsg);
      return { success: true, data: newMsg };
    }

    return { success: true, data: data as ChatMessageRow };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to send message" };
  }
}

export async function getChatRoomByWaterSourceId(waterSourceId: string): Promise<any> {
  const roomId = await getChatRoomForWaterSource(waterSourceId);
  return {
    id: roomId,
    water_source_id: waterSourceId,
    is_active: true,
    created_at: new Date().toISOString(),
  };
}

export async function getChatRooms(): Promise<ChatRoomWithSource[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("chat_rooms")
      .select(`
        id,
        water_source_id,
        is_active,
        created_at,
        water_source:water_source_id (
          id,
          name,
          slug,
          category,
          barangay,
          availability_status
        ),
        chat_messages (
          id,
          message,
          display_name,
          created_at,
          status
        )
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error || !data) {
      console.error("Error fetching chat rooms:", error);
      return [];
    }

    return data.map((room: any) => {
      const published = (room.chat_messages || []).filter(
        (m: any) => m.status === "published"
      );
      published.sort(
        (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const latest = published[0] || null;

      return {
        id: room.id,
        water_source_id: room.water_source_id,
        is_active: room.is_active,
        created_at: room.created_at,
        water_source: room.water_source,
        message_count: published.length,
        last_message: latest,
      };
    });
  } catch (err) {
    console.error("Error in getChatRooms:", err);
    return [];
  }
}

export async function getPublishedAnnouncements() {
  if (!isSupabaseConfigured()) {
    return [];
  }
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }
    return data;
  } catch {
    return [];
  }
}

export async function getReportedMessages(): Promise<ChatMessageRow[]> {
  return [
    {
      id: "rep-msg-1",
      chat_room_id: "room-san-mateo",
      visitor_id: "v_spammer_12",
      display_name: "PromoBot",
      message: "Free coin claim at suspicious-water-link.com click now!",
      status: "flagged",
      moderation_reason: "Automated spam link detected by community filter",
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ];
}

