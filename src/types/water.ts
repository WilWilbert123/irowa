// src/types/water.ts
import { Database, WaterCategory, WaterAvailabilityStatus } from "./database.types";

export type { WaterCategory, WaterAvailabilityStatus };

export type WaterVerificationStatus = 
  | "verified" 
  | "unverified" 
  | "stale" 
  | "Verified" 
  | "Pending" 
  | "Unverified" 
  | "Rejected";

export type WaterSourceRow = Database["public"]["Tables"]["water_sources"]["Row"];
export type WaterSourceInsert = Database["public"]["Tables"]["water_sources"]["Insert"];
export type WaterSourceUpdate = Database["public"]["Tables"]["water_sources"]["Update"];

export type WaterPhotoRow = Database["public"]["Tables"]["water_photos"]["Row"];

export interface WaterSourceWithPhotos extends WaterSourceRow {
  photos?: WaterPhotoRow[];
  unread_reports_count?: number;
  chat_room_id?: string;
  distance_km?: number;
}

export type WaterSource = WaterSourceWithPhotos;

export interface WaterFilterState {
  searchQuery: string;
  category: WaterCategory | "All";
  availability: WaterAvailabilityStatus | "All";
  barangay: string | "All";
  sortBy: "name" | "updated_at" | "distance";
}
