// src/lib/auth/admin-session.ts
import { getCurrentAdmin } from "./admin-auth";

export async function getAdminSession() {
  return await getCurrentAdmin();
}
