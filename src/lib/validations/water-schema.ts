// src/lib/validations/water-schema.ts
import { z } from "zod";

export const waterCategories = [
  "Public Water Source",
  "Spring",
  "River",
  "Waterfall",
  "Resort",
  "Water Refilling Station",
  "Deep Well",
  "Community Water Point",
  "Other",
] as const;

export const waterAvailabilityStatuses = [
  "Available",
  "Limited Supply",
  "Temporarily Unavailable",
  "Seasonal",
  "Unknown",
] as const;

export const coordinatesSchema = z.object({
  latitude: z.number().min(-90, "Latitude must be >= -90").max(90, "Latitude must be <= 90"),
  longitude: z.number().min(-180, "Longitude must be >= -180").max(180, "Longitude must be <= 180"),
});

export const waterSourceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
  category: z.string().min(1, "Category is required"),
  description: z.string().max(2000, "Description cannot exceed 2000 characters").optional().nullable(),
  latitude: z.number().min(4.0, "Latitude must be within the Philippines (approx 4° to 21°N)").max(21.5, "Latitude must be within the Philippines"),
  longitude: z.number().min(116.0, "Longitude must be within the Philippines (approx 116° to 127°E)").max(127.0, "Longitude must be within the Philippines"),
  address: z.string().max(255).optional().nullable(),
  barangay: z.string().max(100).optional().nullable(),
  availability_status: z.string().default("Available"),
  verification_status: z.string().optional().default("unverified"),
  operating_hours: z.string().max(100).optional().nullable(),
  contact_information: z.string().max(200).optional().nullable(),
  is_published: z.boolean().default(true),
});

export const waterSourceFilterSchema = z.object({
  category: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  barangay: z.string().optional(),
});

export type WaterSourceFormData = z.infer<typeof waterSourceSchema>;
