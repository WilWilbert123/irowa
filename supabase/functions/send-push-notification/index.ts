// supabase/functions/send-push-notification/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/auth.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { title, body, url, visitor_id } = await req.json();
    if (!title || !body) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createAdminClient();
    let query = supabase.from("push_subscriptions").select("*");
    if (visitor_id) {
      query = query.eq("visitor_id", visitor_id);
    }

    const { data: subs, error } = await query;
    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        recipient_count: subs ? subs.length : 0,
        message: "Push notifications dispatched",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
