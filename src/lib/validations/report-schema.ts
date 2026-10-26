// src/lib/validations/report-schema.ts
import { z } from "zod";

export const reportTypes = [
  "Incorrect location",
  "Resource no longer exists",
  "Incorrect availability",
  "Duplicate marker",
  "Incorrect information",
  "Potential safety concern",
  "Inappropriate photo or content",
  "Other",
] as const;

export const reportSchema = z.object({
  water_source_id: z.string().min(1, "Invalid water source identifier"),
  visitor_id: z.string().min(1, "Visitor identifier is required"),
  report_type: z.enum(reportTypes),
  description: z
    .string()
    .min(5, "Please provide more detail (at least 5 characters)")
    .max(1000, "Description cannot exceed 1000 characters"),
});

export type ReportFormData = z.infer<typeof reportSchema>;
