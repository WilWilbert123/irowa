// src/types/submission.ts
import { Database } from "./database.types";

export type WaterSubmissionRow = Database["public"]["Tables"]["water_submissions"]["Row"];
export type WaterSubmissionInsert = Database["public"]["Tables"]["water_submissions"]["Insert"];
export type SubmissionPhotoRow = Database["public"]["Tables"]["submission_photos"]["Row"];

export interface WaterSubmissionWithPhotos extends WaterSubmissionRow {
  photos?: SubmissionPhotoRow[];
  reviewer?: {
    display_name: string;
  } | null;
}

export type WaterSubmission = WaterSubmissionWithPhotos;
