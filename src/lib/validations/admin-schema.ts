// src/lib/validations/admin-schema.ts
import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const announcementSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(150),
  body: z.string().min(10, "Announcement body must be at least 10 characters").max(3000),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  status: z.enum(["draft", "published", "archived"]).default("published"),
  expires_at: z.string().optional().nullable(),
});

export type AdminLoginFormData = z.infer<typeof adminLoginSchema>;
export type AnnouncementFormData = z.infer<typeof announcementSchema>;
