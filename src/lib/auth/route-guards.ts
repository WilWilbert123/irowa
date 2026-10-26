// src/lib/auth/route-guards.ts
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "./admin-auth";

export async function assertAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }
  return admin;
}
