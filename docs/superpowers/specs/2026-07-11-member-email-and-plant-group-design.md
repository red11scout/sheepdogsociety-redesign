# Member Email System + Plant-Request → Group — Design Spec

**Status:** Design approved in brainstorming (2026-07-11). Awaiting spec review before an implementation plan is written.

## Goal

Give Jeremy (a) a real approve→group workflow so plant-request data stops getting stranded, and (b) a member-email system: surface the "Subscribe" flag, let non-members (wives/kids) subscribe to the Letter, send the weekly Letter to the combined audience from `shepherd@acts2028sheepdogsociety.com`, and give Jeremy a tool to email leaders / selected groups / everyone.

## Hard constraints (shape the plan, not the design)

- **This repo is a read-only sandbox on the prod DB.** `SANDBOX_READONLY` blocks every write and `src/lib/email.ts` is a no-op stub with no send keys. Nothing here — group creation, flag changes, email sends — runs or is testable in the fork. This is **build-for-prod, verified after deploy**.
- **Migrations are human-applied to prod.** Any schema change ships as a Drizzle migration applied via the GitHub Action / `scripts/apply-neon-migration.mjs`. Never `drizzle-kit push`, never DDL from the sandbox.
- **Heavy overlap with the concurrent admin-studio rewrite.** This touches `/admin/location-requests`, `/admin/groups`, `/admin/members`, and adds admin pages — exactly what the other session is rewriting. Implementation must sequence after that lands (or merge carefully); this spec is safe to write now.
- **`shepherd@acts2028sheepdogsociety.com` is verified in Resend** (per the user). It becomes the From/Reply-To for all member-facing mail.

## The audience model (foundation)

Two audience tables, one send path.

| Audience | Table | "Subscribe" signal | Gets the Letter? | Gets Jeremy's blasts? |
|---|---|---|---|---|
| **Members** (from `/join`) | `members` (+ `member_notification_prefs`) | `wants_newsletter` (exists, default `true`) | yes when `wants_newsletter` | yes (targetable) |
| **Subscribers** (wives/kids) | `newsletter_subscribers` (repurposed) | `is_active` | yes when `is_active` | only under "Everyone" |

**One send path — `src/server/audience.ts`:**
- `getLetterRecipients()` → members where `wants_newsletter=true AND is_active AND deleted_at IS NULL`, UNION subscribers where `is_active=true`. Dedupe by lowercased email (member record wins). Each recipient: `{ email, name, unsubscribeUrl }`.
- `sendToRecipients(recipients, { subject, html, text })` → batches via Resend's batch API (≤100/call), From/Reply-To `shepherd@`, sets a `List-Unsubscribe` header per recipient.
- The old Resend **Broadcast/Audience** mechanism is retired (per the audience decision). We send to our own combined list.

**Unsubscribe — one `/unsubscribe` route, two token types (no new columns):**
- Members: existing stored `member_notification_prefs.email_unsubscribe_token` → sets `wants_newsletter=false`.
- Subscribers: a **signed** token `hmac(email, UNSUBSCRIBE_SECRET)` embedded in the link → sets `newsletter_subscribers.is_active=false`. No DB column needed.
- Route resolves token → flips the right flag → shows a plain confirmation page.

## Part A — Plant request → draft group

**Trigger:** the Approve action in `/admin/location-requests` (today: `src/app/api/admin/location-requests/route.ts` only stamps `status='approved'`).

**New behavior:** in one transaction, set `status='approved'` **and** create a draft group+location prefilled from the request, then store its id on the request for linking + idempotency.

**Field mapping (`location_requests` → new group+location):**
| Request field | Group/location field |
|---|---|
| `requesterName` | `location.contactName` |
| `requesterEmail` | `location.contactEmail` (admin-only) |
| `requesterPhone` | `location.contactPhone` (admin-only) |
| `proposedCity` | `location.city` |
| `proposedState` | `location.state` |
| `proposedMeetingDetails` + `reason` | `location.description` |
| — | `location.name` = `"{proposedCity} Group"` placeholder (admin renames) |
| — | `approvalStatus='pending'`, `displayedOnMap=false`, `isActive=true`, empty address/lat/lng/day/time |

Reuse the existing creation logic in `src/server/admin-groups-locations.ts` (the same path `+ Add group` uses) rather than a parallel insert.

**Idempotency + linking:** add nullable `location_requests.reviewed_group_id uuid`. If already set, Approve is a no-op re-approve (no duplicate). The request row in `/admin/location-requests` renders a **"View group →"** link to `/admin/groups?focus={id}` once created. This is the "way to see the information" that's missing today.

**Migration A:** `ALTER TABLE location_requests ADD COLUMN reviewed_group_id uuid REFERENCES groups(id) ON DELETE SET NULL;`

## Part B — Subscribe + sends

**B1 — Subscribe column in `/admin/members`.** Surface `wants_newsletter` as an inline **Subscribe** toggle (default yes) in the members table; a small `PATCH /api/admin/members/[id]/subscribe` flips it. No migration (flag exists).

**B2 — `/subscribe` page + `/admin/subscribers`.**
- Public `/subscribe` (server route + the retained `newsletter-form` component): name + email → `POST /api/public/newsletter` upserts `newsletter_subscribers` (`is_active=true`). Single opt-in; every send carries unsubscribe. Add to the middleware public allowlist.
- `/admin/subscribers`: a new admin page listing non-member subscribers (email, name, subscribed-at, active) with search, add-by-email (Jeremy), and deactivate. This is the "database in the admin portal to show Jeremy those who just subscribe but are not members."

**B3 — Weekly Letter → combined audience.** Modify the live publish path (`publishLetter` in `src/server/encouragements.ts`, which today fires a Resend Broadcast) to instead render the letter email and call `sendToRecipients(getLetterRecipients(), …)` from `shepherd@`. Failures don't block the website publish (existing contract). The `admin/letters` parallel path (`src/server/letters.ts`) is left alone / reconciled during implementation.

**B4 — Jeremy's email tool: `/admin/email`.**
- Compose: subject + body (plain or lightly-formatted → wrapped in the brand email shell).
- Audience picker (one of): **Leaders** (group leaders' emails), **Selected group(s)** (members with `group_id` in the chosen groups, active), **Everyone** (all active members + all active subscribers).
- Live recipient **count** before sending; an explicit **confirm** step (this sends real email).
- Sends via `sendToRecipients(...)` from `shepherd@`, each with unsubscribe.
- Logs to `broadcast_log`.

**Migration B:** `broadcast_log` table — `id uuid pk`, `sent_by text → users.id`, `subject text`, `audience_type text` (`leaders|groups|everyone`), `audience_detail jsonb` (e.g. group ids), `recipient_count integer`, `status text`, `created_at timestamptz default now()`. The tool shows recent sends from this table.

## Out of scope (explicit)

- **Upcoming-events email** — dropped per the user. `wants_events` stays in the schema, unused for now.
- SMS (the A2P/Twilio path stays dormant).
- Rich WYSIWYG for Jeremy's tool (v1 is subject + simple body).
- Double-opt-in for subscribers (single opt-in + compliant unsubscribe is sufficient).

## Migrations summary (human-applied to prod)

1. `location_requests.reviewed_group_id uuid` (Part A).
2. `broadcast_log` table (Part B4).
3. New env var `UNSUBSCRIBE_SECRET` (or reuse `AUTH_SECRET`) for subscriber unsubscribe signing.

No migration is needed for the Subscribe flag (`wants_newsletter` already exists) or the `/subscribe` writes.

## Verification strategy

Sandbox can't exercise writes/sends, so the plan verifies by: `tsc --noEmit` + `next build` + unit tests for the pure pieces (audience dedup, unsubscribe token sign/verify, request→group field mapping) using the new Vitest runner. End-to-end (a real approve creating a group, a real send from `shepherd@`) is verified on the prod deploy after the migrations are applied — with the send tool first exercised against a single test recipient.

## Suggested implementation phases (for the plan)

- **Phase A:** plant-request → draft group (+ migration A, + field-mapping unit test). Self-contained.
- **Phase B1:** audience model + `src/server/audience.ts` + `/unsubscribe` route + token tests.
- **Phase B2:** `/subscribe` page, `/admin/subscribers`, Subscribe column in `/admin/members`.
- **Phase B3:** weekly Letter → combined audience.
- **Phase B4:** `/admin/email` tool + `broadcast_log` (+ migration B).
