// src/actions/admin-auth-actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function loginAdminAction(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const returnUrl = (formData.get("returnUrl") as string) || "/admin";

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  // 1. Strict Security Gate: Verify email is authorized in ADMIN_EMAIL environment variable
  const allowedEmails = (process.env.ADMIN_EMAIL || "johnwilbertgamis2022@gmail.com,admin@irowa.local")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const normalizedInputEmail = email.toLowerCase();
  const isAuthorizedEmail = allowedEmails.includes(normalizedInputEmail);

  if (!isAuthorizedEmail) {
    return {
      error: `Access Denied: "${email}" is not authorized as an administrator. Only accounts in ADMIN_EMAIL may access this portal.`,
    };
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

  // 2. Verify that the user has an active admin profile, or auto-provision if verified in ADMIN_EMAIL
  const adminClient = createAdminClient();
  let { data: profile } = await adminClient
    .from("admin_profiles")
    .select("role, is_active")
    .eq("auth_user_id", data.user.id)
    .single();

  if (!profile) {
    // Auto-provision admin profile since the email is in ADMIN_EMAIL
    const { error: insertError } = await adminClient.from("admin_profiles").insert({
      auth_user_id: data.user.id,
      display_name: data.user.email?.split("@")[0] || "Administrator",
      role: "superadmin",
      is_active: true,
    });
    if (!insertError) {
      profile = { role: "superadmin", is_active: true };
    }
  }

  if (!profile || !profile.is_active) {
    await supabase.auth.signOut();
    return { error: "Your account is not authorized as an active administrator." };
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
