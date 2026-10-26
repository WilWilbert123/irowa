// supabase/functions/moderate-chat-message/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { verifyAdminUser, createAdminClient } from "../_shared/auth.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const auth = await verifyAdminUser(req);
    if (!auth) {
      return new Response(JSON.stringify({ error: "Unauthorized: Administrator access required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { message_id, action, reason } = await req.json();
    if (!message_id || !action) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createAdminClient();
    const newStatus = action === "hide" ? "hidden" : action === "flag" ? "flagged" : "published";

    await supabase
      .from("chat_messages")
      .update({ status: newStatus, moderation_reason: reason || null })
      .eq("id", message_id);

    await supabase.from("chat_moderation_logs").insert({
      message_id,
      moderator_id: auth.profile.id,
      action,
      reason,
    });

    return new Response(JSON.stringify({ success: true, status: newStatus }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
