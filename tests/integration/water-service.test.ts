import { describe, it, expect } from "vitest";
import { getPublishedWaterSources, getWaterSourceById, MOCK_IROSIN_WATER_SOURCES } from "@/lib/services/water-service";

describe("Water Resource Service Integration", () => {
  it("fetches published water resources with fallback to curated Irosin seed data", async () => {
    const sources = await getPublishedWaterSources();
    expect(sources).toBeDefined();
    expect(Array.isArray(sources)).toBe(true);
    expect(sources.length).toBeGreaterThan(0);

    const first = sources[0];
    expect(first.id).toBeDefined();
    expect(first.name).toBeDefined();
    expect(first.category).toBeDefined();
    expect(typeof first.latitude).toBe("number");
    expect(typeof first.longitude).toBe("number");
  });

  it("filters water sources by category and availability status", async () => {
    const waterfallSources = await getPublishedWaterSources({ category: "Waterfall" as any });
    expect(waterfallSources.every((s) => s.category.toLowerCase() === "waterfall")).toBe(true);

    const availableSources = await getPublishedWaterSources({ availability: "Available" as any });
    expect(availableSources.every((s) => s.availability_status.toLowerCase() === "available")).toBe(true);
  });

  it("retrieves a specific water source by ID", async () => {
    const seed = MOCK_IROSIN_WATER_SOURCES[0];
    const source = await getWaterSourceById(seed.id);
    expect(source).toBeDefined();
    expect(source?.id).toBe(seed.id);
    expect(source?.name).toBe(seed.name);
  });
});
