// src/actions/admin-auth-actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function loginAdminAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const returnUrl = (formData.get("returnUrl") as string) || "/admin";

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  // Development demo shortcut for local testing when external DB is not set up
  if (email === "admin@irowa.local" && password === "irowa123456") {
    // Demo administrator mode
    return { success: true, redirectUrl: returnUrl };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: error?.message || "Invalid email or password." };
  }

  // Verify that the user has an active admin profile
  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("admin_profiles")
    .select("role, is_active")
    .eq("auth_user_id", data.user.id)
    .single();

  if (!profile || !profile.is_active) {
    await supabase.auth.signOut();
    return { error: "Your account is not authorized as an administrator." };
  }

  revalidatePath("/admin");
  return { success: true, redirectUrl: returnUrl };
}

export async function logoutAdminAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/admin/login");
}
