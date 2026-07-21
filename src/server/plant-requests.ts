import type { InferSelectModel } from "drizzle-orm";
import { locationRequests } from "@/db/schema";
import type { UpsertGroupLocationInput } from "@/server/admin-groups-locations";

export type LocationRequestRow = InferSelectModel<typeof locationRequests>;

/**
 * Pure: map an approved plant request into a PENDING, off-map draft group.
 *
 * Address / lat-lng / meeting day+time are intentionally left blank — the admin
 * fills them in /admin/groups before flipping the group live. This keeps a
 * half-finished group off the public map.
 */
export function requestToDraftGroupInput(
  row: LocationRequestRow
): UpsertGroupLocationInput {
  const description = [row.proposedMeetingDetails, row.reason]
    .map((s) => (s ?? "").trim())
    .filter(Boolean)
    .join("\n\n");

  const name = `${row.proposedCity} Group`;

  return {
    groupName: name,
    groupDescription: description,
    approvalStatus: "pending",
    displayedOnMap: false,
    isActive: true,
    locationName: name,
    city: row.proposedCity,
    state: row.proposedState,
    contactName: row.requesterName,
    contactEmail: row.requesterEmail,
    contactPhone: row.requesterPhone ?? "",
    address: "",
    latitude: "",
    longitude: "",
    meetingDay: "",
    meetingTime: "",
  };
}
