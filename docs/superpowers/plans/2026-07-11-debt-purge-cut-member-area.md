# Debt Purge — Cut the Dead Member-Community Layer (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Delete the orphaned member-community layer, the inert `_legacy_*` folders, and the phantom dependencies — shrinking the codebase by ~2,400+ LOC and removing the entire channel-IDOR security surface — without touching any live public/admin feature or the production database.

**Architecture:** This is a pure-deletion pass. No feature is rewritten. Member pages, their member-only API routes, the Supabase realtime chat hook, and dead helper files are removed. Phantom npm deps (`@clerk/nextjs`, `@supabase/*`, `svix`) and their stale `next.config` image hosts go with them. The stale middleware allowlist and the legacy `/sign-in` redirect chain are pruned. Finally, Drizzle table *definitions* for the now-unreferenced member tables are removed (code only — physical tables are left in the shared prod DB; a `DROP` migration is a separate, human-approved step). Every task is gated by `tsc --noEmit` + `next build` + a grep invariant, then committed.

**Tech Stack:** Next.js 16.1.6 (App Router, Turbopack), TypeScript strict, Drizzle ORM, Auth.js v5.

## Global Constraints

- **Repo:** `/Users/drewgodwin/Code/sheepdogsociety-redesign` — work on `main`, commit per task.
- **Shared production database.** This repo is a read-only sandbox on the PROD Neon DB. **NEVER** issue DDL/`DROP TABLE` from here, and **NEVER** run `drizzle-kit push` or `drizzle-kit generate` as part of this plan. Removing a Drizzle table *definition* (a TypeScript export) is safe; deleting the physical table is out of scope and is flagged as a follow-up for a human-run prod migration.
- **NEVER touch (load-bearing infra):** `src/lib/sandbox.ts`, `src/db/index.ts` (the write-guard), `src/lib/email.ts`, `src/lib/sms/**`, `src/lib/ai/**`, `vercel.json`, `src/app/api/sandbox-status/**`, `src/emails/**`, `src/auth.ts`, `src/auth.config.ts`, `src/lib/auth-compat.ts`. (Auth-compat collapse + DB-client merge is Phase 2, a separate plan.)
- **KEEP these — they are LIVE, not part of the dead layer:** `src/app/api/members/route.ts` (public `/join` signup POST), `src/app/api/admin/prayer/**`, `src/app/api/admin/testimonies/**`, `src/app/api/events/**`, `src/app/api/groups/**`, `src/app/api/resources/**`, all `src/app/api/public/**`, and the `twilio` dependency (dormant SMS, kept intentionally).
- **No test runner exists.** The project has zero unit/integration tests. Per-task verification is therefore: (a) a grep invariant proving no live code references the deleted thing, (b) `npx tsc --noEmit` clean, (c) `npm run build` clean. Adding a smoke-test harness is the first task of the Phase 2 plan, not this one.
- **This is not a visual pass.** No Ridge & Bone / className / copy changes. If a deletion leaves a component unused, delete the component too; do not restyle anything.
- **Gate command (run at the end of every task before commit):**
  ```bash
  npx tsc --noEmit && npm run build 2>&1 | tail -5
  ```
  Expected: zero type errors; build completes; the route list no longer contains the deleted routes.

---

### Task 1: Delete the member-community page routes

**Files:**
- Delete: `src/app/(app)/channels/` (3 files), `src/app/(app)/prayer/` (2), `src/app/(app)/accountability/` (2), `src/app/(app)/bible/` (4), `src/app/(app)/dashboard/` (1), `src/app/(app)/members/` (2), `src/app/(app)/testimonies/` (2), `src/app/(app)/setup/` (1)

**Interfaces:**
- Produces: removal of routes `/channels`, `/prayer`, `/accountability`, `/bible`, `/bible/notes`, `/dashboard`, `/members`, `/testimonies`, `/setup`. After this task, `src/hooks/use-realtime-messages.ts` has zero importers (its only consumers, `channels/[channelId]/channel-view.tsx` and `channel-view`, are gone) — Task 3 relies on that.

- [ ] **Step 1: Confirm nothing outside these folders links to the member routes**

```bash
cd /Users/drewgodwin/Code/sheepdogsociety-redesign
grep -rnE 'href=["'"'"'`]/(channels|prayer|accountability|bible|dashboard|members|testimonies|setup)(/|"|'"'"'|`)' src \
  | grep -vE 'src/app/\(app\)/(channels|prayer|accountability|bible|dashboard|members|testimonies|setup)/' \
  | grep -vE '/admin/|/api/' || echo "NO EXTERNAL LINKS"
```
Expected: `NO EXTERNAL LINKS`. (Admin routes like `/admin/members`, `/admin/prayer`, `/admin/testimonies` are different paths and are correctly excluded — they stay.)

- [ ] **Step 2: Delete the eight member route folders**

```bash
git rm -r \
  "src/app/(app)/channels" \
  "src/app/(app)/prayer" \
  "src/app/(app)/accountability" \
  "src/app/(app)/bible" \
  "src/app/(app)/dashboard" \
  "src/app/(app)/members" \
  "src/app/(app)/testimonies" \
  "src/app/(app)/setup"
```

- [ ] **Step 3: Gate**

```bash
npx tsc --noEmit && npm run build 2>&1 | tail -5
```
Expected: zero errors; build route list no longer shows `/channels`, `/prayer`, `/accountability`, `/bible`, `/dashboard`, `/members`, `/testimonies`, `/setup`. (`use-realtime-messages.ts` still compiles as an unused module — it is deleted in Task 3.)

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "chore(purge): delete orphaned member-community page routes"
```

---

### Task 2: Delete the member-only API routes

**Files:**
- Delete: `src/app/api/channels/`, `src/app/api/messages/`, `src/app/api/dm/`, `src/app/api/notes/`, `src/app/api/bible/`, `src/app/api/accountability/`, `src/app/api/prayer/`, `src/app/api/testimonies/`
- **Do NOT delete:** `src/app/api/members/`, `src/app/api/admin/prayer/`, `src/app/api/admin/testimonies/`, `src/app/api/events/`, `src/app/api/groups/`, `src/app/api/resources/`, `src/app/api/public/**`

**Interfaces:**
- Consumes: the deletions in Task 1 (the only consumers of these APIs were the member pages).
- Produces: removal of the channel-IDOR / self-join-write attack surface (the security review's C1, H1, H3-adjacent, L3 findings all lived in `api/channels`, `api/messages`, `api/messages/[messageId]/reactions`).

- [ ] **Step 1: Prove each deleted API has no surviving client consumer**

```bash
cd /Users/drewgodwin/Code/sheepdogsociety-redesign
for api in channels messages dm notes bible accountability prayer testimonies; do
  echo "--- /api/$api consumers outside its own route folder ---"
  grep -rnE "[\"'\`]/api/$api" src \
    | grep -v "src/app/api/$api/" \
    | grep -v "src/app/api/admin/$api/" || echo "NONE"
done
```
Expected: every block prints `NONE`. (If `/api/prayer` or `/api/testimonies` shows a consumer under `src/app/api/admin/...`, that is the admin route referencing its own path — ignore; those admin routes are kept and use different files.)

- [ ] **Step 2: Delete the member-only API route folders**

```bash
git rm -r \
  "src/app/api/channels" \
  "src/app/api/messages" \
  "src/app/api/dm" \
  "src/app/api/notes" \
  "src/app/api/bible" \
  "src/app/api/accountability" \
  "src/app/api/prayer" \
  "src/app/api/testimonies"
```

- [ ] **Step 3: Confirm the LIVE endpoints survived**

```bash
ls src/app/api/members/route.ts \
   src/app/api/admin/prayer/route.ts \
   src/app/api/admin/testimonies/route.ts \
   src/app/api/public/newsletter/route.ts
```
Expected: all four paths exist.

- [ ] **Step 4: Gate + commit**

```bash
npx tsc --noEmit && npm run build 2>&1 | tail -5
git add -A && git commit -m "chore(purge): delete member-only API routes (chat/prayer/bible/accountability); keep public + admin"
```

---

### Task 3: Delete the Supabase realtime hook and dead helper files

**Files:**
- Delete: `src/hooks/use-realtime-messages.ts` (149 LOC), `src/lib/supabase/admin.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts` (72 LOC total), `src/components/AskTheWatch.tsx` (224 LOC, zero importers), `src/lib/admin.ts` (19 LOC, dead hardcoded-email allowlist, unreferenced)

**Interfaces:**
- Consumes: Task 1 (removes the realtime hook's last importer).
- Produces: `@supabase/ssr` and `@supabase/supabase-js` become fully unused (Task 5 removes them from `package.json`).

- [ ] **Step 1: Prove all six files are unreferenced**

```bash
cd /Users/drewgodwin/Code/sheepdogsociety-redesign
grep -rn "use-realtime-messages\|lib/supabase\|AskTheWatch\|from \"@/lib/admin\"\|from '@/lib/admin'" src \
  | grep -vE "src/(hooks/use-realtime-messages|lib/supabase/|components/AskTheWatch|lib/admin)" || echo "ALL UNREFERENCED"
```
Expected: `ALL UNREFERENCED`.

- [ ] **Step 2: Delete the files**

```bash
git rm \
  "src/hooks/use-realtime-messages.ts" \
  "src/lib/supabase/admin.ts" \
  "src/lib/supabase/client.ts" \
  "src/lib/supabase/server.ts" \
  "src/components/AskTheWatch.tsx" \
  "src/lib/admin.ts"
rmdir "src/lib/supabase" 2>/dev/null || true
```

- [ ] **Step 3: Gate + commit**

```bash
npx tsc --noEmit && npm run build 2>&1 | tail -5
git add -A && git commit -m "chore(purge): delete Supabase realtime hook, dead supabase client lib, AskTheWatch, dead admin allowlist"
```

---

### Task 4: Delete the inert legacy folders and the retired Clerk webhook

**Files:**
- Delete: `src/app/(app)/_legacy_member_area/` (blog/devotionals/events/groups pages, ~13 files), `src/app/(app)/_resources_legacy/` (resource-library, ~3 files), `src/app/api/webhooks/clerk/` (a `410 Gone` stub)

**Interfaces:**
- Produces: no route change (the `_`-prefixed folders were never routable; the clerk webhook only returned 410).

- [ ] **Step 1: Confirm the legacy trees are referenced only from within themselves**

```bash
cd /Users/drewgodwin/Code/sheepdogsociety-redesign
grep -rn "_legacy_member_area\|_resources_legacy" src \
  | grep -vE "src/app/\(app\)/(_legacy_member_area|_resources_legacy)/" || echo "SELF-CONTAINED"
grep -rn "webhooks/clerk" src | grep -v "src/app/api/webhooks/clerk/" || echo "CLERK WEBHOOK UNREFERENCED"
```
Expected: `SELF-CONTAINED` and `CLERK WEBHOOK UNREFERENCED`.

- [ ] **Step 2: Delete**

```bash
git rm -r \
  "src/app/(app)/_legacy_member_area" \
  "src/app/(app)/_resources_legacy" \
  "src/app/api/webhooks/clerk"
```

- [ ] **Step 3: Gate + commit**

```bash
npx tsc --noEmit && npm run build 2>&1 | tail -5
git add -A && git commit -m "chore(purge): delete inert _legacy_* folders and retired 410 Clerk webhook"
```

---

### Task 5: Remove phantom dependencies and their stale config

**Files:**
- Modify: `package.json` (remove `@clerk/nextjs`, `@supabase/ssr`, `@supabase/supabase-js`, `svix`), `next.config.ts` (remove the Clerk + Supabase `images.remotePatterns` entries)
- Regenerate: `package-lock.json`

**Interfaces:**
- Consumes: Tasks 2–4 (all importers of Supabase/Clerk/svix are gone).

- [ ] **Step 1: Final proof the four packages are unimported**

```bash
cd /Users/drewgodwin/Code/sheepdogsociety-redesign
grep -rn "@clerk/nextjs\|@supabase/ssr\|@supabase/supabase-js\|from \"svix\"\|from 'svix'\|require(\"svix\")" src || echo "ZERO IMPORTS — SAFE TO REMOVE"
```
Expected: `ZERO IMPORTS — SAFE TO REMOVE`. (A comment mentioning `svix` in `src/app/api/webhooks/resend/route.ts` is fine — it is a code comment, not an import. Leave that route; its signature-verification hardening is a Phase 2/security item.)

- [ ] **Step 2: Uninstall the four packages**

```bash
npm rm @clerk/nextjs @supabase/ssr @supabase/supabase-js svix
```
(This edits `package.json` and `package-lock.json` in one step.)

- [ ] **Step 3: Strip the dead image hosts from `next.config.ts`**

In `next.config.ts` (repo root) replace the `images` block:

```ts
  // Allow Clerk/Supabase images
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
```
with (delete the block entirely if no remote images remain, or keep only hosts actually used — Vercel Blob serves from `*.public.blob.vercel-storage.com`; add that only if an `<Image>` references it):

```ts
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
```

Verify whether any remote image host is actually needed:
```bash
grep -rnoE 'https://[a-z0-9.*-]+\.(blob\.vercel-storage\.com|supabase\.co|clerk\.com)' src | sort -u
```
If this prints nothing and no `<Image src={dynamicUrl}>` uses an external host, delete the `images` block entirely. If it prints a blob host, keep the blob `remotePattern` only.

- [ ] **Step 4: Gate + commit**

```bash
npx tsc --noEmit && npm run build 2>&1 | tail -5
git add -A && git commit -m "chore(purge): remove phantom deps (@clerk/nextjs, @supabase/*, svix) + stale next.config image hosts"
```

---

### Task 6: Prune the stale middleware allowlist and the legacy sign-in redirect chain

**Files:**
- Modify: `src/middleware.ts` (remove dead public-route patterns + deleted-route allowlist entries), `src/app/(app)/layout.tsx` (redirect target `/sign-in` → `/admin/sign-in`)
- Delete: `src/app/sign-in/`, `src/app/sign-up/`, `src/app/pending/` (legacy Clerk redirect stubs) — **only after** Step 1 confirms nothing else redirects to them
- Verify: `src/components/layout/app-shell.tsx` — delete if it is an unused pass-through

**Interfaces:**
- Consumes: Tasks 1–4.
- Produces: `middleware.ts` PUBLIC_ROUTES contains only routes that still exist; `(app)/layout.tsx` redirects unauthenticated users straight to `/admin/sign-in`.

- [ ] **Step 1: Find every redirect target pointing at the legacy sign-in pages**

```bash
cd /Users/drewgodwin/Code/sheepdogsociety-redesign
grep -rnE '["'"'"'`]/(sign-in|sign-up|pending)(["'"'"'`]|\?)' src | grep -v "src/app/(sign-in|sign-up|pending)"
```
Expected consumers: `src/app/(app)/layout.tsx` (redirects to `/sign-in`) and possibly `src/auth.config.ts`. Note each; Step 3 repoints them.

- [ ] **Step 2: Remove stale patterns from `src/middleware.ts` PUBLIC_ROUTES**

Delete these lines (routes that no longer exist — all now handled by `next.config.ts` `redirects()` or fully gone):
```ts
  /^\/get-started(\/.*)?$/,
  /^\/how-we-gather(\/.*)?$/,
  /^\/faq(\/.*)?$/,
  /^\/giving(\/.*)?$/,
  /^\/partnerships(\/.*)?$/,
  /^\/stories(\/.*)?$/,
  /^\/scripture-reader(\/.*)?$/,
  /^\/daily-scripture(\/.*)?$/,
  /^\/locations(\/.*)?$/,
  /^\/devotionals(\/.*)?$/,
  /^\/subscribe(\/.*)?$/,
  /^\/merch(\/.*)?$/,
  /^\/statement-of-faith(\/.*)?$/,
  /^\/blog(\/.*)?$/,
  /^\/encouragements(\/.*)?$/,
  /^\/what-to-expect(\/.*)?$/,
```
Also delete the now-dead auth stubs from the allowlist (they are removed in Step 4):
```ts
  /^\/sign-in(\/.*)?$/, // legacy Clerk routes — redirect handled in page
  /^\/sign-up(\/.*)?$/,
  /^\/pending(\/.*)?$/,
```
Keep everything else (the live public routes, `/admin/sign-in`, `/admin/check-email`, `/api/auth`, `/api/public`, `/api/og`, `/api/members`, `/api/webhooks`, `/api/cron`, `/api/sandbox-status`, and the SEO files). Redirect sources in `next.config.ts` (e.g. `/encouragements`) fire before auth, so they do not need allowlist entries.

- [ ] **Step 3: Repoint the `(app)/layout.tsx` redirect**

In `src/app/(app)/layout.tsx`, change the unauthenticated redirect from `/sign-in` to `/admin/sign-in`:
```ts
// before
redirect("/sign-in");
// after
redirect("/admin/sign-in");
```
(Match the exact surrounding code; there is one `redirect("/sign-in")` call near line 14.)

- [ ] **Step 4: Delete the legacy Clerk redirect pages**

```bash
git rm -r "src/app/sign-in" "src/app/sign-up" "src/app/pending"
```

- [ ] **Step 5: Delete `app-shell.tsx` if it is an unused pass-through**

```bash
grep -rn "app-shell\|AppShell" src | grep -v "src/components/layout/app-shell.tsx"
```
If the only remaining reference is a single import in `src/app/(app)/layout.tsx` and `AppShell` is a `<>{children}</>` no-op (confirm by reading the file), inline its children in `layout.tsx` and `git rm src/components/layout/app-shell.tsx`. If it has real logic or multiple consumers, leave it.

- [ ] **Step 6: Gate + commit**

```bash
grep -nE '/(get-started|how-we-gather|faq|giving|partnerships|stories|scripture-reader|daily-scripture|locations|devotionals|subscribe|merch|statement-of-faith|encouragements|what-to-expect|sign-up|pending)' src/middleware.ts && echo "FAIL: stale patterns remain" || echo "MIDDLEWARE CLEAN"
npx tsc --noEmit && npm run build 2>&1 | tail -5
git add -A && git commit -m "chore(purge): prune stale middleware allowlist; redirect (app) to /admin/sign-in; delete legacy sign-in stubs"
```

---

### Task 7: Remove unreferenced member table definitions + refresh stale docs

**Files:**
- Modify: `src/db/schema.ts` (remove Drizzle definitions for member tables that now have zero references), `CLAUDE.md` (fix the stale Active Routes list + Phase E note)
- **Do NOT:** run `drizzle-kit generate`/`push`, create a migration, or `DROP` any physical table.

**Interfaces:**
- Consumes: Tasks 1–4 (removed all code that referenced the chat/bible/accountability/reading tables).
- Produces: a smaller `schema.ts`. The physical prod tables remain; their removal is a documented follow-up.

- [ ] **Step 1: For each candidate table, prove zero references before removing its definition**

Candidates (member-only, expected zero refs after Tasks 1–4): `channels`, `channelMembers`, `messages`, `reactions`, `accountabilityPairs`, `accountabilityCheckins`, `readingPlans`, `readingProgress`, `notes`, `bibleBookmarks`, `bibleHighlights`.

```bash
cd /Users/drewgodwin/Code/sheepdogsociety-redesign
for t in channels channelMembers messages reactions accountabilityPairs accountabilityCheckins readingPlans readingProgress notes bibleBookmarks bibleHighlights; do
  n=$(grep -rn "schema\.$t\b\|\b$t\b" src --include='*.ts' --include='*.tsx' | grep -v "src/db/schema.ts" | wc -l | tr -d ' ')
  echo "$t: $n external refs"
done
```
Remove the `pgTable` definition (and any associated `relations`/enums used ONLY by it) **only** for tables reporting `0 external refs`. If any reports non-zero, leave that table and note which live file still uses it.

**Explicitly KEEP** (still referenced by live admin/public code — do not remove): `testimonies` (About page + admin), `prayerRequests` / `prayerRequestPrayers` (`api/admin/prayer`), `groupMembers` (`api/groups/[groupId]/members`), `blogPosts` + `attendanceRecords` (leave for now — their fate is tied to the admin blog/attendance features, a separate decision).

- [ ] **Step 2: Remove the confirmed-dead table definitions from `src/db/schema.ts`**

Delete the `pgTable("...")` blocks for each table that reported `0 external refs` in Step 1. Work top-down by line number so earlier deletions do not shift later ones. After editing, confirm the file still parses:
```bash
npx tsc --noEmit 2>&1 | grep "schema.ts" || echo "SCHEMA CLEAN"
```

- [ ] **Step 3: Fix the stale docs in `CLAUDE.md`**

In the `## Active Routes` and stack sections of `CLAUDE.md`: remove the retired public routes (`/devotionals`, `/subscribe`, `/merch`, `/statement-of-faith`, `/get-started`, `/giving`, `/how-we-gather`, `/faq`, `/scripture-reader`, `/daily-scripture`, `/stories`, `/partnerships`, `/locations`) and the non-existent admin routes (`/admin/blog`, `/admin/devotionals`, `/admin/reading-plans`, `/admin/scripture`); replace the member-community description in the Overview with a note that the member area was removed on 2026-07-11 and only `/admin/**` survives under `(app)`. Correct the Phase E line to: "geocoder built; draggable-pin picker not yet built." Drop `@clerk/nextjs`, `@supabase/*`, and `svix` from any dependency mention.

- [ ] **Step 4: Document the physical-table follow-up**

Append to `docs/MIGRATIONS.md` a short "Pending prod cleanup" note listing the physical tables now unused by code (the ones removed in Step 2), stating they remain in the prod DB and a `DROP TABLE` migration should be authored and human-reviewed separately (never run from the sandbox). Do not create the migration file.

- [ ] **Step 5: Gate + commit**

```bash
npx tsc --noEmit && npm run build 2>&1 | tail -5
git add -A && git commit -m "chore(purge): remove unreferenced member table defs (code only); refresh stale CLAUDE.md + migration note"
```

---

### Task 8: Final verification sweep

**Files:**
- None modified. This task proves the purge left the live surface intact.

**Interfaces:**
- Consumes: Tasks 1–7.

- [ ] **Step 1: Full dead-reference sweep — must be silent**

```bash
cd /Users/drewgodwin/Code/sheepdogsociety-redesign
grep -rn "@clerk\|@supabase\|use-realtime-messages\|AskTheWatch\|_legacy_member_area\|_resources_legacy\|lib/supabase\|from \"@/lib/admin\"" src || echo "NO DEAD REFERENCES"
```
Expected: `NO DEAD REFERENCES` (a `svix` comment in `webhooks/resend` is acceptable — it is not matched here).

- [ ] **Step 2: Prove the live routes still build**

```bash
npx tsc --noEmit && npm run build 2>&1 | tee /tmp/build.txt | tail -8
grep -E "/join|/letter|/groups|/events|/resources|/about|/admin/dashboard|/api/members|/api/public" /tmp/build.txt | head
```
Expected: zero type errors; the live public + admin + public-API routes all present in the build output.

- [ ] **Step 3: Report the LOC delta**

```bash
git diff --stat "5b3f675..HEAD" | tail -1
```
Record the net lines removed in the final commit message body.

- [ ] **Step 4: (Optional, if deploying) crawl the sandbox**

```bash
git push origin main
# after Vercel deploy completes:
node scripts/verify-ia.mjs
```
Expected: `ALL CHECKS PASSED` (the existing five-rooms crawl still passes — the purge touched no public route).

- [ ] **Step 5: Final commit (if any doc/report tweaks remain)**

```bash
git add -A && git commit -m "chore(purge): final verification — member layer removed, live surface intact" --allow-empty
```

---

## Self-Review (completed)

- **Scope coverage:** member pages (Task 1) → member APIs (Task 2) → realtime hook + dead helpers (Task 3) → inert legacy + clerk webhook (Task 4) → phantom deps + config (Task 5) → middleware/routing cleanup (Task 6) → schema defs + docs (Task 7) → verification (Task 8). Every dead-code item from the assessment is assigned to a task.
- **Live-surface safety:** `api/members` (public signup), `api/admin/prayer`, `api/admin/testimonies`, events/groups/resources APIs, all `api/public/*`, and `twilio` are explicitly listed as KEEP in Global Constraints and re-verified in Tasks 2, 3, and 8. The ambiguous member tables (`prayerRequests`, `testimonies`, `groupMembers`, `blogPosts`, `attendanceRecords`) are explicitly excluded from Task 7 removal because live admin/public code references them.
- **Production-DB safety:** no task issues DDL, runs `drizzle-kit`, or drops a physical table; Task 7 removes TypeScript definitions only and documents the physical-table follow-up as human-run.
- **Ordering:** deletions precede dep-removal precede config/schema cleanup, so each `tsc`/`build` gate passes at every step (e.g. `use-realtime-messages.ts` loses its importer in Task 1 before deletion in Task 3; Supabase packages lose all imports in Tasks 2–4 before removal in Task 5).
- **No placeholders:** every step is an exact command, an exact code block, or an exact grep gate. The one judgment call (app-shell deletion, Task 6 Step 5) has an explicit decision rule.
- **Verification honesty:** the plan states up front that no test runner exists and that gates are grep + `tsc` + `build`; it does not claim tests it cannot run.

## What this plan deliberately does NOT do (Phase 2 — separate plan)

- Collapse the ~60 surviving `@/lib/auth-compat` call sites into `@/auth` (kills the fabricated `sessionId` and the `userId!` assertions).
- Merge `src/auth.ts`'s private Postgres client into the sandbox-guarded `src/db` client (removes the one unguarded prod-write path).
- These are behavior-preserving refactors of the auth hot path on a shared prod DB. Phase 2 must open by adding a minimal smoke-test harness (Vitest + a Playwright admin-sign-in check) so the refactor is verifiable before it lands.
