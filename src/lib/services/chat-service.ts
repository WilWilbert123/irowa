// src/lib/services/chat-service.ts
import { createClient, isSupabaseConfigured } from "../supabase/client";
import { createAdminClient } from "../supabase/admin";
import { ChatMessageRow, ChatRoomWithSource } from "@/types/chat";
import { checkRateLimit } from "../utils/rate-limit";
import { getWaterSourceCustomIcons, getWaterSourceCategoryOverrides } from "./water-service";
import { getDefaultCircleIconForCategory } from "../map/circle-icons";

// Sample active discussions for demo/fallback mode
export const MOCK_CHAT_MESSAGES: Record<string, ChatMessageRow[]> = {};

const SPAM_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  {
    pattern: /(https?:\/\/[^\s]+|www\.[^\s]+|\b[a-z0-9-]+\.(com|net|org|xyz|top|click|info|biz|ru|cn|tk|ly|me)\b)/i,
    reason: "Automated filter: External URL or suspicious link detected",
  },
  {
    pattern: /\b(free\s*coin|claim\s*now|crypto\s*airdrop|casino|scatter|bet88|jili|gcash\s*free|click\s*here\s*to\s*win|earn\s*money\s*fast)\b/i,
    reason: "Automated filter: Promotional spam or scam keywords detected",
  },
  {
    pattern: /\b(putang\s*ina|puta|gago|tarantado|ulol|bobo|tanga|inutil|pakshet|fuck|shit|bitch|asshole|scammer)\b/i,
    reason: "Automated filter: Profanity or abusive language detected",
  },
];

export function evaluateMessageSafety(text: string): {
  isFlagged: boolean;
  reason: string | null;
} {
  const cleaned = text.trim();
  for (const rule of SPAM_PATTERNS) {
    if (rule.pattern.test(cleaned)) {
      return { isFlagged: true, reason: rule.reason };
    }
  }
  return { isFlagged: false, reason: null };
}

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

export async function getAdminChatRoomOverview(waterSourceId: string): Promise<{
  waterSource: any | null;
  room: any | null;
  messages: ChatMessageRow[];
}> {
  if (!isSupabaseConfigured()) {
    return { waterSource: null, room: null, messages: [] };
  }
  try {
    const admin = createAdminClient();
    const [{ data: sourceData }, { data: roomData }] = await Promise.all([
      admin
        .from("water_sources")
        .select("id, name, slug, category, barangay, availability_status, photos:water_photos(id, storage_path, is_primary)")
        .eq("id", waterSourceId)
        .maybeSingle(),
      admin
        .from("chat_rooms")
        .select("id, water_source_id, is_active, created_at")
        .eq("water_source_id", waterSourceId)
        .maybeSingle(),
    ]);

    let activeRoom = roomData;
    if (!activeRoom && sourceData) {
      const { data: createdRoom } = await admin
        .from("chat_rooms")
        .insert({ water_source_id: waterSourceId, is_active: true })
        .select("id, water_source_id, is_active, created_at")
        .single();
      activeRoom = createdRoom;
    }

    if (!activeRoom) {
      return { waterSource: sourceData || null, room: null, messages: [] };
    }

    // Fetch ALL messages for admin oversight (published, hidden, flagged, deleted)
    const { data: messagesData } = await admin
      .from("chat_messages")
      .select("*")
      .eq("chat_room_id", activeRoom.id)
      .order("created_at", { ascending: false })
      .limit(200);

    return {
      waterSource: sourceData || null,
      room: activeRoom,
      messages: (messagesData || []) as ChatMessageRow[],
    };
  } catch (err) {
    console.error("Failed to fetch admin chat room overview:", err);
    return { waterSource: null, room: null, messages: [] };
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
  const safety = evaluateMessageSafety(message);
  const initialStatus = safety.isFlagged ? "flagged" : "published";
  const moderationReason = safety.reason;

  if (!isSupabaseConfigured()) {
    const newMsg: ChatMessageRow = {
      id: `mock-${Date.now()}`,
      chat_room_id: roomId,
      visitor_id: visitorId,
      display_name: displayName,
      message: message.trim(),
      status: initialStatus,
      moderation_reason: moderationReason,
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
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("chat_messages")
      .insert({
        chat_room_id: roomId,
        visitor_id: visitorId,
        display_name: displayName,
        message: message.trim(),
        status: initialStatus,
        moderation_reason: moderationReason,
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
    const [{ data, error }, iconsMap, categoryOverrides] = await Promise.all([
      supabase
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
            availability_status,
            is_published,
            archived_at,
            photos:water_photos (
              id,
              storage_path,
              is_primary
            )
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
        .order("created_at", { ascending: true }),
      getWaterSourceCustomIcons(),
      getWaterSourceCategoryOverrides(),
    ]);

    if (error || !data) {
      console.error("Error fetching chat rooms:", error);
      return [];
    }

    const activeRooms = data.filter((room: any) => {
      const ws = room.water_source;
      return ws && ws.is_published && !ws.archived_at;
    });

    return activeRooms.map((room: any) => {
      const published = (room.chat_messages || []).filter(
        (m: any) => m.status === "published"
      );
      published.sort(
        (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const latest = published[0] || null;

      const ws = room.water_source;
      const effectiveCategory = (ws && categoryOverrides[ws.id]) || ws?.category || "Other";
      const customIcon = ws ? iconsMap[ws.id] : undefined;
      const smartDefault = getDefaultCircleIconForCategory(effectiveCategory, ws?.name);

      return {
        id: room.id,
        water_source_id: room.water_source_id,
        is_active: room.is_active,
        created_at: room.created_at,
        water_source: ws
          ? {
              ...ws,
              category: effectiveCategory,
              custom_icon_id: customIcon?.iconId || smartDefault.iconId,
              custom_icon_color: customIcon?.color || smartDefault.color,
            }
          : undefined,
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
  if (!isSupabaseConfigured()) {
    return [];
  }
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("chat_messages")
      .select("*")
      .eq("status", "flagged")
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }
    return data as ChatMessageRow[];
  } catch {
    return [];
  }
}

