// src/actions/chat-actions.ts
"use server";

import { chatMessageSchema } from "@/lib/validations/chat-schema";
import { 
  sendChatMessage, 
  getChatRoomByWaterSourceId, 
  getChatMessages, 
  getChatRooms, 
  getReportedMessages 
} from "@/lib/services/chat-service";
import { moderateMessage } from "@/lib/services/moderation-service";
import { logAdminAction } from "@/lib/services/audit-service";
import { revalidatePath } from "next/cache";

export async function getAllChatRoomsAction() {
  return await getChatRooms();
}

export async function getChatRoomAction(waterSourceId: string) {
  return await getChatRoomByWaterSourceId(waterSourceId);
}

export async function getMessagesAction(waterSourceId: string) {
  return await getChatMessages(waterSourceId);
}

export async function getReportedMessagesAction() {
  return await getReportedMessages();
}

export async function sendChatMessageAction(formData: any) {
  const validated = chatMessageSchema.safeParse(formData);
  if (!validated.success) {
    return { error: (validated.error as any).issues?.[0]?.message || "Validation failed" };
  }

  const { chat_room_id, water_source_id, visitor_id, display_name, message } = validated.data;
  const targetRoom = chat_room_id || water_source_id || "";
  return await sendChatMessage(targetRoom, visitor_id, display_name, message);
}

export async function moderateMessageAction(
  messageId: string,
  action: "published" | "approved" | "hidden" | "deleted" | "flag" | "restore" | "hide" | "delete",
  reason?: string
) {
  const normalizedAction = 
    action === "published" || action === "approved" ? "restore" : 
    action === "hidden" ? "hide" : 
    action === "deleted" ? "delete" : action;

  const result = await moderateMessage(messageId, normalizedAction, reason);
  if (result.success) {
    await logAdminAction("MODERATE_CHAT_MESSAGE", "chat_message", messageId, { action, reason });
    revalidatePath("/admin/chat");
  }
  return result;
}
