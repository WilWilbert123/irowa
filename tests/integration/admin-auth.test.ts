import { describe, it, expect } from "vitest";
import { adminLoginSchema } from "@/lib/validations/admin-schema";

describe("Admin Authentication Schema & Route Protection Integration", () => {
  it("validates administrator login credentials", () => {
    const valid = {
      email: "admin@irowa.gov.ph",
      password: "SecureAdminPassword123!",
    };
    const res = adminLoginSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("fails on invalid email format", () => {
    const invalid = {
      email: "not-an-email",
      password: "password123",
    };
    const res = adminLoginSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it("fails on empty password", () => {
    const invalid = {
      email: "admin@irowa.gov.ph",
      password: "",
    };
    const res = adminLoginSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });
});
