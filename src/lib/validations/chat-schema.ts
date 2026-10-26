// src/lib/validations/chat-schema.ts
import { z } from "zod";

export const visitorDisplayNameSchema = z
  .string()
  .min(2, "Display name must be at least 2 characters")
  .max(30, "Display name cannot exceed 30 characters")
  .regex(/^[a-zA-Z0-9\s._-]+$/, "Display name contains invalid characters");

export const chatMessageSchema = z.object({
  chat_room_id: z.string().optional(),
  water_source_id: z.string().optional(),
  visitor_id: z.string().min(1, "Visitor identifier is required"),
  display_name: visitorDisplayNameSchema,
  message: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(1000, "Message cannot exceed 1000 characters"),
});

export const messageModerationSchema = z.object({
  message_id: z.string().min(1, "Message ID is required"),
  action: z.enum(["hide", "restore", "delete", "flag"]),
  reason: z.string().max(500).optional(),
});

export type ChatMessageFormData = z.infer<typeof chatMessageSchema>;
export type MessageModerationFormData = z.infer<typeof messageModerationSchema>;
