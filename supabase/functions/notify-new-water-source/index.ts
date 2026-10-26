// supabase/functions/notify-new-water-source/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/auth.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { record } = await req.json();
    if (!record || !record.id || !record.name) {
      return new Response(JSON.stringify({ error: "Invalid water source record" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createAdminClient();

    // Insert broadcast notification
    await supabase.from("notifications").insert({
      type: "new_water_source",
      title: "New Water Source Available",
      body: `${record.name} (${record.category}) is now available in Barangay ${record.barangay || "Irosin"}.`,
      water_source_id: record.id,
      is_read: false,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
