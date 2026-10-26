import { describe, it, expect } from "vitest";
import { 
  chatMessageSchema, 
  visitorDisplayNameSchema,
  messageModerationSchema 
} from "@/lib/validations/chat-schema";

describe("Chat Validation Schemas", () => {
  it("validates valid chat message submission", () => {
    const valid = {
      water_source_id: "a1111111-1111-4111-a111-111111111111",
      visitor_id: "vis_12345678",
      display_name: "Maria Santos",
      message: "Is the spring currently flowing cleanly this morning?",
    };

    const res = chatMessageSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("rejects messages exceeding 1000 characters", () => {
    const longMessage = {
      water_source_id: "a1111111-1111-4111-a111-111111111111",
      visitor_id: "vis_12345678",
      display_name: "Juan",
      message: "a".repeat(1001),
    };

    const res = chatMessageSchema.safeParse(longMessage);
    expect(res.success).toBe(false);
  });

  it("rejects empty or whitespace-only messages", () => {
    const empty = {
      water_source_id: "a1111111-1111-4111-a111-111111111111",
      visitor_id: "vis_12345678",
      display_name: "Juan",
      message: "   ",
    };

    const res = chatMessageSchema.safeParse(empty);
    expect(res.success).toBe(false);
  });

  it("validates visitor display name constraints", () => {
    expect(visitorDisplayNameSchema.safeParse("Maria").success).toBe(true);
    expect(visitorDisplayNameSchema.safeParse("A").success).toBe(false); // min 2
    expect(visitorDisplayNameSchema.safeParse("a".repeat(35)).success).toBe(false); // max 30
  });

  it("validates moderation action schema", () => {
    const action = {
      message_id: "msg-123",
      action: "hide",
      reason: "Inappropriate language",
    };
    expect(messageModerationSchema.safeParse(action).success).toBe(true);
  });
});
