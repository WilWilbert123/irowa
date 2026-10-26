// src/lib/supabase/admin.ts
import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

export function createAdminClient(): SupabaseClient<Database> & any {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-irowa.supabase.co";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey || serviceRoleKey.includes("placeholder")) {
    const fallbackKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      "placeholder-key";
    return createSupabaseClient<Database>(supabaseUrl, fallbackKey, {
      auth: { persistSession: false },
    }) as any;
  }

  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }) as any;
}
