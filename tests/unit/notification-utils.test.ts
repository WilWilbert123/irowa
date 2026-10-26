import { describe, it, expect } from "vitest";
import { urlBase64ToUint8Array } from "@/lib/notifications/notification-utils";

describe("Notification Utilities", () => {
  it("converts urlBase64 strings to Uint8Array for VAPID subscription", () => {
    // Valid standard base64 test string
    const testBase64 = "BM1234567890abcdef";
    const uint8Array = urlBase64ToUint8Array(testBase64);
    expect(uint8Array).toBeInstanceOf(Uint8Array);
    expect(uint8Array.length).toBeGreaterThan(0);
  });
});
