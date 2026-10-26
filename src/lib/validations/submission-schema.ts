// src/lib/validations/submission-schema.ts
import { z } from "zod";
import { waterCategories, waterAvailabilityStatuses } from "./water-schema";

export const submissionSchema = z.object({
  visitor_id: z.string().min(1, "Visitor identifier is required"),
  submitter_name: z
    .string()
    .min(2, "Your name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  name: z
    .string()
    .min(3, "Water source name must be at least 3 characters")
    .max(100, "Name cannot exceed 100 characters"),
  category: z.enum(waterCategories),
  description: z
    .string()
    .max(2000, "Description cannot exceed 2000 characters")
    .optional()
    .nullable(),
  latitude: z.number().min(-90).max(90, "Please select a valid point on the map"),
  longitude: z.number().min(-180).max(180, "Please select a valid point on the map"),
  address: z.string().max(255).optional().nullable(),
  barangay: z.string().max(100).optional().nullable(),
  availability_status: z.enum(waterAvailabilityStatuses).default("Available"),
  operating_hours: z.string().max(100).optional().nullable(),
  contact_information: z.string().max(200).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export type SubmissionFormData = z.infer<typeof submissionSchema>;
