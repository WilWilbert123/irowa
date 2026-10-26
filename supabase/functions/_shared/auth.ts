// supabase/functions/_shared/auth.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export function createAdminClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  return createClient(supabaseUrl, serviceRoleKey);
}

export async function verifyAdminUser(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  const client = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return null;

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("admin_profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .eq("is_active", true)
    .single();

  return profile ? { user, profile } : null;
}
