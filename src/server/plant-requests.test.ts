import { describe, it, expect } from "vitest";
import {
  requestToDraftGroupInput,
  type LocationRequestRow,
} from "@/server/plant-requests";

const ROW: LocationRequestRow = {
  id: "r1",
  requesterName: "Pete Gallo",
  requesterEmail: "pete@example.com",
  requesterPhone: "555-1212",
  proposedCity: "Granite Bay",
  proposedState: "California",
  proposedMeetingDetails: "Saturdays at the diner",
  reason: "No group nearby",
  status: "pending",
  reviewedBy: null,
  reviewedAt: null,
  notes: "",
  reviewedGroupId: null,
  createdAt: new Date(),
};

describe("requestToDraftGroupInput", () => {
  it("maps a request into a pending, off-map draft group", () => {
    const out = requestToDraftGroupInput(ROW);
    expect(out.approvalStatus).toBe("pending");
    expect(out.displayedOnMap).toBe(false);
    expect(out.isActive).toBe(true);
    expect(out.city).toBe("Granite Bay");
    expect(out.state).toBe("California");
    expect(out.contactName).toBe("Pete Gallo");
    expect(out.contactEmail).toBe("pete@example.com");
    expect(out.contactPhone).toBe("555-1212");
    expect(out.groupName).toBe("Granite Bay Group");
    expect(out.groupDescription).toContain("Saturdays at the diner");
    expect(out.groupDescription).toContain("No group nearby");
    expect(out.address ?? "").toBe("");
    expect(out.latitude ?? "").toBe("");
  });

  it("tolerates null phone and empty details", () => {
    const out = requestToDraftGroupInput({
      ...ROW,
      requesterPhone: null,
      proposedMeetingDetails: "",
      reason: "",
    });
    expect(out.contactPhone).toBe("");
    expect(out.groupDescription).toBe("");
  });
});
