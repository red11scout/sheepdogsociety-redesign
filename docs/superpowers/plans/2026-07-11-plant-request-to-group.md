# Plant Request → Draft Group (Phase A) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Approving a plant request in `/admin/location-requests` creates a prefilled, off-map draft group so the request data stops getting stranded and Jeremy can finish + publish it.

**Architecture:** A pure mapping (`requestToDraftGroupInput`) turns a `location_requests` row into the existing `UpsertGroupLocationInput`; the approve endpoint calls the existing `upsertGroupLocation(...)`, stores the returned `groupId` on the request (`reviewed_group_id`) for linking + idempotency, and the request row links to `/admin/groups`.

**Tech Stack:** Next.js 16 App Router, Drizzle ORM, TypeScript strict, Vitest.

## Global Constraints

- **Read-only sandbox on prod DB.** No write/DDL/email runs here; verify by `tsc`+`build`+Vitest. The approve→create path is verified on the prod deploy after the migration is applied.
- **Migration is human-applied to prod.** This plan only *generates* the SQL (`drizzle-kit generate`, offline); a human applies it. Never `drizzle-kit push`.
- **Reuse, don't duplicate:** group/location creation goes through `upsertGroupLocation` in `src/server/admin-groups-locations.ts` (returns `{ groupId }`), never a parallel insert.
- **Admin-collision aware:** build on branch `feat/plant-request-to-group`, push the branch, do NOT merge to `main` until coordinated with the admin-studio session. Keep admin-UI edits minimal.
- Gate per task: `npx tsc --noEmit` clean, `npm test` green, `npm run build` clean before commit.

## File Structure

- `src/db/schema.ts` — add `reviewedGroupId` to `locationRequests` (~line 670).
- `drizzle/NNNN_*.sql` — generated migration (human-applied).
- `src/server/plant-requests.ts` (new) — `requestToDraftGroupInput(row)` (pure) + `approvePlantRequest(id, notes)` (wires create + link).
- `src/server/plant-requests.test.ts` (new) — unit tests for the pure mapping.
- `src/app/api/admin/location-requests/route.ts` — PATCH calls `approvePlantRequest` on approve.
- `src/app/(app)/admin/location-requests/*` — add a "View group →" link on approved rows (minimal).

---

### Task 1: Schema column + generated migration

**Files:** Modify `src/db/schema.ts`; generate `drizzle/*.sql`.

- [ ] **Step 1: Add the column** to `locationRequests` in `src/db/schema.ts` (after `notes`):

```ts
  reviewedGroupId: uuid("reviewed_group_id").references(() => groups.id, {
    onDelete: "set null",
  }),
```
(`groups` is already imported in schema.ts.)

- [ ] **Step 2: Generate the migration SQL (offline, no DB touch)**

```bash
npx drizzle-kit generate
```
Expected: a new `drizzle/NNNN_*.sql` containing `ALTER TABLE "location_requests" ADD COLUMN "reviewed_group_id" uuid;` (+ FK). Confirm it only touches `location_requests`.

- [ ] **Step 3: tsc + commit**

```bash
npx tsc --noEmit && git add src/db/schema.ts drizzle/
git commit -m "feat(plant): add location_requests.reviewed_group_id (migration generated, human-applied)"
```

---

### Task 2: Pure request→draft-group mapping (TDD)

**Files:** Create `src/server/plant-requests.ts`, `src/server/plant-requests.test.ts`.

**Interfaces:**
- Produces: `requestToDraftGroupInput(row: LocationRequestRow): UpsertGroupLocationInput` where `LocationRequestRow` = the inferred select type of `locationRequests`. Draft = `approvalStatus: "pending"`, `displayedOnMap: false`, `isActive: true`, empty address/lat/lng/day/time.

- [ ] **Step 1: Write the failing test** (`src/server/plant-requests.test.ts`):

```ts
import { describe, it, expect } from "vitest";
import { requestToDraftGroupInput } from "@/server/plant-requests";

const ROW = {
  id: "r1", requesterName: "Pete Gallo", requesterEmail: "pete@example.com",
  requesterPhone: "555-1212", proposedCity: "Granite Bay", proposedState: "California",
  proposedMeetingDetails: "Saturdays at the diner", reason: "No group nearby",
  status: "pending", reviewedBy: null, reviewedAt: null, notes: "",
  reviewedGroupId: null, createdAt: new Date(),
} as const;

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
});
```

- [ ] **Step 2: Run it — expect FAIL** (`npm test` → "requestToDraftGroupInput is not a function").

- [ ] **Step 3: Implement** (`src/server/plant-requests.ts`):

```ts
import type { InferSelectModel } from "drizzle-orm";
import { locationRequests } from "@/db/schema";
import type { UpsertGroupLocationInput } from "@/server/admin-groups-locations";

export type LocationRequestRow = InferSelectModel<typeof locationRequests>;

/** Pure: map an approved plant request into a PENDING, off-map draft group.
 *  Address / lat-lng / meeting day+time are intentionally blank — the admin
 *  fills them in /admin/groups before flipping the group live. */
export function requestToDraftGroupInput(
  row: LocationRequestRow
): UpsertGroupLocationInput {
  const details = [row.proposedMeetingDetails, row.reason]
    .map((s) => (s ?? "").trim())
    .filter(Boolean)
    .join("\n\n");
  return {
    groupName: `${row.proposedCity} Group`,
    groupDescription: details,
    approvalStatus: "pending",
    displayedOnMap: false,
    isActive: true,
    locationName: `${row.proposedCity} Group`,
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
```

- [ ] **Step 4: Run it — expect PASS** (`npm test`).

- [ ] **Step 5: Commit**

```bash
git add src/server/plant-requests.ts src/server/plant-requests.test.ts
git commit -m "feat(plant): pure request->draft-group mapping + tests"
```

---

### Task 3: Wire approve → create draft group (idempotent)

**Files:** Modify `src/server/plant-requests.ts` (add `approvePlantRequest`), `src/app/api/admin/location-requests/route.ts`.

**Interfaces:**
- Consumes: `requestToDraftGroupInput` (Task 2), `upsertGroupLocation` → `{ groupId }` (existing).
- Produces: `approvePlantRequest(id: string, notes?: string): Promise<{ groupId: string }>`.

- [ ] **Step 1: Add `approvePlantRequest`** to `src/server/plant-requests.ts`:

```ts
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { upsertGroupLocation } from "@/server/admin-groups-locations";

export async function approvePlantRequest(
  id: string,
  notes?: string
): Promise<{ groupId: string }> {
  const [row] = await db
    .select()
    .from(locationRequests)
    .where(eq(locationRequests.id, id));
  if (!row) throw new Error("Plant request not found");

  // Idempotent: if a group was already created, just re-stamp status/notes.
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
    .set({
      status: "approved",
      notes: notes ?? "",
      reviewedGroupId: groupId,
    })
    .where(eq(locationRequests.id, id));
  return { groupId };
}
```
(`requestToDraftGroupInput` + `locationRequests` are already in this file from Task 2. `reviewedBy`/`reviewedAt` are stamped by the route below.)

- [ ] **Step 2: Call it from the approve route.** In `src/app/api/admin/location-requests/route.ts` PATCH, replace the single `db.update(...)` block with a branch: on `status === "approved"` call `approvePlantRequest`, then stamp reviewer; keep the old update for `declined`.

```ts
import { approvePlantRequest } from "@/server/plant-requests";
// ...inside PATCH, after the input check:
  if (status === "approved") {
    const { groupId } = await approvePlantRequest(id, notes);
    await db
      .update(locationRequests)
      .set({ reviewedBy: admin.id, reviewedAt: new Date() })
      .where(eq(locationRequests.id, id));
    return NextResponse.json({ success: true, groupId });
  }
  await db
    .update(locationRequests)
    .set({ status, notes: notes ?? "", reviewedBy: admin.id, reviewedAt: new Date() })
    .where(eq(locationRequests.id, id));
  return NextResponse.json({ success: true });
```

- [ ] **Step 3: Gate + commit**

```bash
npx tsc --noEmit && npm test && npm run build 2>&1 | tail -5
git add src/server/plant-requests.ts "src/app/api/admin/location-requests/route.ts"
git commit -m "feat(plant): approving a request creates a prefilled draft group (idempotent)"
```

---

### Task 4: "View group →" link on approved requests

**Files:** Modify the `/admin/location-requests` client (the component rendering rows — find with `grep -rl "reviewedGroupId\|status.*approved\|approved" "src/app/(app)/admin/location-requests"`).

**Interfaces:** Consumes `request.reviewedGroupId` from the GET payload (the route already `select()`s all columns, so it's present after Task 1).

- [ ] **Step 1:** On a row whose `status === "approved"` and `reviewedGroupId` is set, render a link:

```tsx
{req.status === "approved" && req.reviewedGroupId && (
  <a href={`/admin/groups?focus=${req.reviewedGroupId}`} className="link-editorial folio !text-brass">
    View group →
  </a>
)}
```
Keep the edit minimal — one link element, matching the file's existing row markup and classes. Do not restyle the page.

- [ ] **Step 2: Gate + commit**

```bash
npx tsc --noEmit && npm run build 2>&1 | tail -5
git add "src/app/(app)/admin/location-requests"
git commit -m "feat(plant): link approved requests to their created group"
```

---

### Task 5: Push branch + handoff

- [ ] **Step 1:** `npx tsc --noEmit && npm test && npm run build` all green.
- [ ] **Step 2:** `git push -u origin feat/plant-request-to-group` (branch only — NOT merged to main; coordinate with the admin-studio session before merging).
- [ ] **Step 3:** Report to the user: the generated migration SQL needs applying to prod (human step), then the flow is live after deploy.

## Self-Review

- **Spec coverage:** approve→draft group (Task 3), field mapping (Task 2 + spec table), `reviewed_group_id` migration (Task 1), "View group" link (Task 4) — all from the spec's Part A. ✔
- **Placeholders:** the `NNNN_*.sql` name is drizzle-assigned; the location-requests component path is resolved by grep in Task 4 (its exact name isn't known until then). No TODOs.
- **Type consistency:** `requestToDraftGroupInput` returns `UpsertGroupLocationInput` (existing type); `approvePlantRequest` returns `{ groupId }` matching `upsertGroupLocation`. ✔
