// src/types/chat.ts
import { Database } from "./database.types";

export type ChatRoomRow = Database["public"]["Tables"]["chat_rooms"]["Row"];
export type ChatMessageRow = Database["public"]["Tables"]["chat_messages"]["Row"];
export type ChatMessageInsert = Database["public"]["Tables"]["chat_messages"]["Insert"];

export interface ChatRoomWithSource extends ChatRoomRow {
  water_source?: {
    id: string;
    name: string;
    slug: string;
    category: string;
    barangay: string | null;
  };
  last_message?: ChatMessageRow | null;
  message_count?: number;
}

export type ChatRoom = ChatRoomWithSource;
export type ChatMessage = ChatMessageRow;
