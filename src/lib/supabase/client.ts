// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/database.types";

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes("placeholder") &&
    !key.includes("placeholder")
  );
}

export function createClient(): any {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-irowa.supabase.co";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "placeholder-key";

  return createBrowserClient<Database>(supabaseUrl, supabaseKey) as any;
}
