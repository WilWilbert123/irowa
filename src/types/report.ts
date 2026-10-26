// src/types/report.ts
import { Database } from "./database.types";

export type WaterReportRow = Database["public"]["Tables"]["water_reports"]["Row"];
export type WaterReportInsert = Database["public"]["Tables"]["water_reports"]["Insert"];

export interface WaterReportWithDetails extends WaterReportRow {
  water_source?: {
    id: string;
    name: string;
    category: string;
    barangay: string | null;
    latitude?: number;
    longitude?: number;
  } | null;
}

export type WaterReport = WaterReportWithDetails;
export type ReportStatus = "pending" | "investigating" | "resolved" | "dismissed";
