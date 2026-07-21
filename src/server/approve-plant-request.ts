import { eq } from "drizzle-orm";
import { db } from "@/db";
import { locationRequests } from "@/db/schema";
import { upsertGroupLocation } from "@/server/admin-groups-locations";
import { requestToDraftGroupInput } from "@/server/plant-requests";

/**
 * Approve a plant request and create a prefilled draft group from it.
 *
 * Idempotent: if a group was already created for this request
 * (`reviewed_group_id` set), it re-stamps status/notes and returns the existing
 * group id instead of creating a duplicate. Reviewer stamping
 * (`reviewed_by` / `reviewed_at`) is done by the caller.
 *
 * Kept out of `plant-requests.ts` so that module stays free of runtime server
 * imports (db / server actions) and its pure mapping stays unit-testable.
 */
export async function approvePlantRequest(
  id: string,
  notes?: string
): Promise<{ groupId: string }> {
  const [row] = await db
    .select()
    .from(locationRequests)
    .where(eq(locationRequests.id, id));
  if (!row) throw new Error("Plant request not found");

  if (row.reviewedGroupId) {
    await db
      .update(locationRequests)
      .set({ status: "approved", notes: notes ?? row.notes ?? "" })
      .where(eq(locationRequests.id, id));
    return { groupId: row.reviewedGroupId };
  }

  const { groupId } = await upsertGroupLocation(requestToDraftGroupInput(row));
  await db
    .update(locationRequests)
    .set({ status: "approved", notes: notes ?? "", reviewedGroupId: groupId })
    .where(eq(locationRequests.id, id));
  return { groupId };
}
