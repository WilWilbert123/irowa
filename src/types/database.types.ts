// src/types/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          id: string;
          auth_user_id: string;
          display_name: string;
          role: "superadmin" | "admin" | "moderator";
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          display_name: string;
          role?: "superadmin" | "admin" | "moderator";
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string;
          display_name?: string;
          role?: "superadmin" | "admin" | "moderator";
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      water_sources: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category: WaterCategory;
          description: string | null;
          latitude: number;
          longitude: number;
          address: string | null;
          barangay: string | null;
          availability_status: WaterAvailabilityStatus;
          verification_status: "Verified" | "Pending" | "Unverified" | "Rejected";
          operating_hours: string | null;
          contact_information: string | null;
          is_published: boolean;
          published_at: string | null;
          last_verified_at: string | null;
          reverify_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
          archived_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          category: WaterCategory;
          description?: string | null;
          latitude: number;
          longitude: number;
          address?: string | null;
          barangay?: string | null;
          availability_status?: WaterAvailabilityStatus;
          verification_status?: "Verified" | "Pending" | "Unverified" | "Rejected";
          operating_hours?: string | null;
          contact_information?: string | null;
          is_published?: boolean;
          published_at?: string | null;
          last_verified_at?: string | null;
          reverify_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
          archived_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          category?: WaterCategory;
          description?: string | null;
          latitude?: number;
          longitude?: number;
          address?: string | null;
          barangay?: string | null;
          availability_status?: WaterAvailabilityStatus;
          verification_status?: "Verified" | "Pending" | "Unverified" | "Rejected";
          operating_hours?: string | null;
          contact_information?: string | null;
          is_published?: boolean;
          published_at?: string | null;
          last_verified_at?: string | null;
          reverify_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
          archived_at?: string | null;
        };
      };
      water_photos: {
        Row: {
          id: string;
          water_source_id: string;
          storage_path: string;
          caption: string | null;
          is_primary: boolean;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          water_source_id: string;
          storage_path: string;
          caption?: string | null;
          is_primary?: boolean;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          water_source_id?: string;
          storage_path?: string;
          caption?: string | null;
          is_primary?: boolean;
          uploaded_by?: string | null;
          created_at?: string;
        };
      };
      water_submissions: {
        Row: {
          id: string;
          visitor_id: string;
          submitter_name: string;
          name: string;
          category: WaterCategory;
          description: string | null;
          latitude: number;
          longitude: number;
          address: string | null;
          barangay: string | null;
          availability_status: WaterAvailabilityStatus;
          operating_hours: string | null;
          contact_information: string | null;
          status: "pending" | "approved" | "rejected" | "duplicate";
          reviewed_by: string | null;
          reviewed_at: string | null;
          rejection_reason: string | null;
          published_water_source_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          visitor_id: string;
          submitter_name: string;
          name: string;
          category: WaterCategory;
          description?: string | null;
          latitude: number;
          longitude: number;
          address?: string | null;
          barangay?: string | null;
          availability_status?: WaterAvailabilityStatus;
          operating_hours?: string | null;
          contact_information?: string | null;
          status?: "pending" | "approved" | "rejected" | "duplicate";
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          published_water_source_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          visitor_id?: string;
          submitter_name?: string;
          name?: string;
          category?: WaterCategory;
          description?: string | null;
          latitude?: number;
          longitude?: number;
          address?: string | null;
          barangay?: string | null;
          availability_status?: WaterAvailabilityStatus;
          operating_hours?: string | null;
          contact_information?: string | null;
          status?: "pending" | "approved" | "rejected" | "duplicate";
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          published_water_source_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      submission_photos: {
        Row: {
          id: string;
          submission_id: string;
          storage_path: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          submission_id: string;
          storage_path: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          submission_id?: string;
          storage_path?: string;
          created_at?: string;
        };
      };
      chat_rooms: {
        Row: {
          id: string;
          water_source_id: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          water_source_id: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          water_source_id?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          chat_room_id: string;
          visitor_id: string;
          display_name: string;
          message: string;
          status: "published" | "hidden" | "flagged" | "deleted";
          moderation_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          chat_room_id: string;
          visitor_id: string;
          display_name: string;
          message: string;
          status?: "published" | "hidden" | "flagged" | "deleted";
          moderation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          chat_room_id?: string;
          visitor_id?: string;
          display_name?: string;
          message?: string;
          status?: "published" | "hidden" | "flagged" | "deleted";
          moderation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          visitor_id: string | null;
          type: "new_water_source" | "status_update" | "advisory" | "submission_review" | "announcement" | "general";
          title: string;
          body: string;
          water_source_id: string | null;
          announcement_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          visitor_id?: string | null;
          type: "new_water_source" | "status_update" | "advisory" | "submission_review" | "announcement" | "general";
          title: string;
          body: string;
          water_source_id?: string | null;
          announcement_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          visitor_id?: string | null;
          type?: "new_water_source" | "status_update" | "advisory" | "submission_review" | "announcement" | "general";
          title?: string;
          body?: string;
          water_source_id?: string | null;
          announcement_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
      };
      push_subscriptions: {
        Row: {
          id: string;
          visitor_id: string | null;
          endpoint: string;
          subscription_data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          visitor_id?: string | null;
          endpoint: string;
          subscription_data: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          visitor_id?: string | null;
          endpoint?: string;
          subscription_data?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      saved_water_sources: {
        Row: {
          id: string;
          visitor_id: string;
          water_source_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          visitor_id: string;
          water_source_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          visitor_id?: string;
          water_source_id?: string;
          created_at?: string;
        };
      };
      water_reports: {
        Row: {
          id: string;
          water_source_id: string;
          visitor_id: string;
          report_type: WaterReportType;
          description: string;
          status: "pending" | "investigating" | "resolved" | "dismissed";
          reviewed_by: string | null;
          reviewed_at: string | null;
          admin_notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          water_source_id: string;
          visitor_id: string;
          report_type: WaterReportType;
          description: string;
          status?: "pending" | "investigating" | "resolved" | "dismissed";
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          admin_notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          water_source_id?: string;
          visitor_id?: string;
          report_type?: WaterReportType;
          description?: string;
          status?: "pending" | "investigating" | "resolved" | "dismissed";
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          admin_notes?: string | null;
          created_at?: string;
        };
      };
      visitor_sessions: {
        Row: {
          id: string;
          visitor_id: string;
          display_name: string;
          is_restricted: boolean;
          restriction_reason: string | null;
          restricted_until: string | null;
          created_at: string;
          last_seen_at: string;
        };
        Insert: {
          id?: string;
          visitor_id: string;
          display_name: string;
          is_restricted?: boolean;
          restriction_reason?: string | null;
          restricted_until?: string | null;
          created_at?: string;
          last_seen_at?: string;
        };
        Update: {
          id?: string;
          visitor_id?: string;
          display_name?: string;
          is_restricted?: boolean;
          restriction_reason?: string | null;
          restricted_until?: string | null;
          created_at?: string;
          last_seen_at?: string;
        };
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          body: string;
          priority: "low" | "normal" | "high" | "urgent";
          status: "draft" | "published" | "archived";
          published_at: string | null;
          expires_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          body: string;
          priority?: "low" | "normal" | "high" | "urgent";
          status?: "draft" | "published" | "archived";
          published_at?: string | null;
          expires_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          body?: string;
          priority?: "low" | "normal" | "high" | "urgent";
          status?: "draft" | "published" | "archived";
          published_at?: string | null;
          expires_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          admin_user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          details: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          details?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          details?: Json | null;
          created_at?: string;
        };
      };
      application_settings: {
        Row: {
          id: string;
          key: string;
          value: Json;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: Json;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: Json;
          updated_by?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}

export type WaterCategory =
  | "Public Water Source"
  | "Spring"
  | "River"
  | "Waterfall"
  | "Resort"
  | "Water Refilling Station"
  | "Deep Well"
  | "Community Water Point"
  | "Other";

export type WaterAvailabilityStatus =
  | "Available"
  | "Limited Supply"
  | "Temporarily Unavailable"
  | "Seasonal"
  | "Unknown";

export type WaterReportType =
  | "Incorrect location"
  | "Resource no longer exists"
  | "Incorrect availability"
  | "Duplicate marker"
  | "Incorrect information"
  | "Potential safety concern"
  | "Inappropriate photo or content"
  | "Other";
