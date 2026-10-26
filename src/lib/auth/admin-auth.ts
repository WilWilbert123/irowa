// src/lib/auth/admin-auth.ts
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminProfileRow } from "@/types/admin";

export async function getCurrentAdmin(): Promise<{
  user: any;
  profile: AdminProfileRow;
} | null> {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const adminClient = createAdminClient();
  const { data: profile, error: profileError } = await adminClient
    .from("admin_profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .eq("is_active", true)
    .single();

  if (profileError || !profile) {
    return null;
  }

  return { user, profile };
}

export async function requireAdmin(): Promise<{
  user: any;
  profile: AdminProfileRow;
}> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    throw new Error("Unauthorized: Active administrator account required");
  }
  return admin;
}
