// src/types/notification.ts
import { Database } from "./database.types";

export type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];
export type AnnouncementRow = Database["public"]["Tables"]["announcements"]["Row"];
export type PushSubscriptionRow = Database["public"]["Tables"]["push_subscriptions"]["Row"];

export type Announcement = AnnouncementRow;
export type Notification = NotificationRow;
export type AnnouncementPriority = "normal" | "high" | "urgent" | "low";
