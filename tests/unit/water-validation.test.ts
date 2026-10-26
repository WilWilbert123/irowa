import { describe, it, expect } from "vitest";
import { 
  waterSourceSchema, 
  waterSourceFilterSchema, 
  coordinatesSchema 
} from "@/lib/validations/water-schema";

describe("Water Resource Schema Validations", () => {
  it("validates valid water source data within Irosin/Sorsogon coordinates", () => {
    const validData = {
      name: "Bitang Waterfall",
      category: "waterfall",
      description: "A natural flowing waterfall with clean mountain water.",
      latitude: 12.7125,
      longitude: 124.015,
      address: "Barangay Gabao",
      barangay: "Gabao",
      availability_status: "available",
      verification_status: "verified",
      operating_hours: "6:00 AM - 5:00 PM",
      contact_information: "0912-345-6789",
      is_published: true,
    };

    const result = waterSourceSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("fails when latitude is outside valid Philippine coordinate bounds", () => {
    const invalidCoords = {
      name: "Invalid Far Away Point",
      category: "spring",
      latitude: 45.0, // Outside Philippines
      longitude: 124.03,
      barangay: "San Julian",
    };

    const result = waterSourceSchema.safeParse(invalidCoords);
    expect(result.success).toBe(false);
  });

  it("fails when name is missing or too short", () => {
    const invalidName = {
      name: "A",
      category: "spring",
      latitude: 12.7,
      longitude: 124.0,
      barangay: "San Julian",
    };

    const result = waterSourceSchema.safeParse(invalidName);
    expect(result.success).toBe(false);
  });

  it("validates coordinate schemas", () => {
    expect(coordinatesSchema.safeParse({ latitude: 12.7042, longitude: 124.0326 }).success).toBe(true);
    expect(coordinatesSchema.safeParse({ latitude: 91, longitude: 124.0 }).success).toBe(false);
    expect(coordinatesSchema.safeParse({ latitude: 12.0, longitude: 181 }).success).toBe(false);
  });

  it("validates filter query parameters", () => {
    const filter = {
      category: "spring",
      status: "available",
      search: "Masacrot",
      barangay: "San Roque",
    };
    const result = waterSourceFilterSchema.safeParse(filter);
    expect(result.success).toBe(true);
  });
});
