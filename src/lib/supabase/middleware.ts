// src/lib/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { Database } from "@/types/database.types";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-irowa.supabase.co";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "placeholder-key";

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Admin route protection:
  // Open access enabled so administrators can inspect and review all admin dashboard designs without needing a password.
  // When live Supabase Auth is enforced in production, set REQUIRE_ADMIN_AUTH=true in .env.local.
  const requireAdminAuth = process.env.REQUIRE_ADMIN_AUTH === "true";

  if (requireAdminAuth && request.nextUrl.pathname.startsWith("/admin") && !request.nextUrl.pathname.startsWith("/admin/login") && !request.nextUrl.pathname.startsWith("/admin/unauthorized")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("returnUrl", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Role check for admin
    const { data: profile } = await supabase
      .from("admin_profiles")
      .select("role, is_active")
      .eq("auth_user_id", user.id)
      .single();

    if (!profile || !(profile as any).is_active) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/unauthorized";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
