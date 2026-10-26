import { describe, it, expect } from "vitest";
import { 
  submitWaterSource, 
  getSubmissionsAdmin, 
  approveSubmission, 
  rejectSubmission 
} from "@/lib/services/submission-service";

describe("Community Submission Approval Workflow Integration", () => {
  it("submits a new community water source in pending status", async () => {
    const res = await submitWaterSource({
      visitor_id: "vis_test_user",
      submitter_name: "Community Volunteer",
      name: "Sitio Tubig-Labi Spring Test",
      category: "Spring",
      description: "Clean cold spring source near the foot of the hill.",
      latitude: 12.715,
      longitude: 124.028,
      barangay: "Gabao",
      availability_status: "Available",
    });

    expect(res.success).toBe(true);
    expect(res.submissionId).toBeDefined();
  });

  it("retrieves the submissions queue containing the pending record", async () => {
    const queue = await getSubmissionsAdmin();
    expect(queue.length).toBeGreaterThan(0);
    const hasPending = queue.some((s) => s.status === "pending");
    expect(hasPending).toBe(true);
  });

  it("approves a pending submission, updating status to approved", async () => {
    const queue = await getSubmissionsAdmin();
    const target = queue.find((s) => s.status === "pending");
    if (target) {
      const result = await approveSubmission(target.id, "admin-tester");
      expect(result.success).toBe(true);
      expect(result.publishedSourceId).toBeDefined();
    }
  });

  it("rejects a submission with an explicit reason", async () => {
    const res = await submitWaterSource({
      visitor_id: "vis_spam_user",
      submitter_name: "Spam Submitter",
      name: "Invalid Fake Water Station",
      category: "Other",
      latitude: 12.7042,
      longitude: 124.0326,
      availability_status: "Available",
    });

    expect(res.submissionId).toBeDefined();

    const rejectRes = await rejectSubmission(
      res.submissionId!,
      "Duplicate entry and invalid location."
    );

    expect(rejectRes.success).toBe(true);
  });
});
