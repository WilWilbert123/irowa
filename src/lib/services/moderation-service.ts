// src/lib/services/moderation-service.ts
import { createAdminClient } from "../supabase/admin";

export async function moderateMessage(
  messageId: string,
  action: "hide" | "restore" | "delete" | "flag" | "purge",
  reason?: string,
  adminId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createAdminClient();
    if (action === "purge") {
      await admin.from("chat_messages").delete().eq("id", messageId);
    } else {
      const newStatus =
        action === "hide"
          ? "hidden"
          : action === "delete"
          ? "deleted"
          : action === "flag"
          ? "flagged"
          : "published";
      await admin
        .from("chat_messages")
        .update({
          status: newStatus,
          moderation_reason: action === "restore" ? null : reason || null,
        })
        .eq("id", messageId);
    }

    if (action !== "purge") {
      await admin.from("chat_moderation_logs").insert({
        message_id: messageId,
        moderator_id: adminId || null,
        action,
        reason: reason || null,
      });
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to moderate message" };
  }
}

export async function restrictVisitorSession(
  visitorId: string,
  reason: string,
  hours: number = 24
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createAdminClient();
    const restrictedUntil = new Date(Date.now() + hours * 3600000).toISOString();

    await admin
      .from("visitor_sessions")
      .update({
        is_restricted: true,
        restriction_reason: reason,
        restricted_until: restrictedUntil,
      })
      .eq("visitor_id", visitorId);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to restrict visitor" };
  }
}
