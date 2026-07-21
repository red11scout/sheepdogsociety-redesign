# Staging Functional Test — Runbook

Stand up a **writable, isolated** staging environment on a Neon branch, exercise
every feature end-to-end with **all email locked to your inbox**, then tear it
down. Design: `docs/superpowers/specs/2026-07-11-staging-functional-test-design.md`.

> **The one rule that keeps this safe:** the staging deploy MUST have
> `EMAIL_TEST_REDIRECT` set to your email. With it set, every email — the
> weekly Letter, Jeremy's blasts, auth links — is rewritten to go only to you,
> and audience Broadcasts are disabled. Even though the branch DB holds real
> member addresses, nothing can reach them. If this var is missing, **do not
> send anything.**

## 1. Create a Neon branch of prod

Neon Console → your project → **Branches** → **New branch** (branch from your
production branch). Name it `staging-test`. Copy its **pooled** and **unpooled**
connection strings.

- Pooled (`...-pooler...`) → `DATABASE_URL` for the app.
- Unpooled → for the migration script.

## 2. Apply the two migrations to the branch

From this repo (they're additive + idempotent):

```bash
DATABASE_URL='<branch UNPOOLED url>' node scripts/apply-neon-migration.mjs
```

Expect it to run `0005_location_requests_reviewed_group_id.sql` and
`0006_broadcast_log.sql` (plus the earlier ones, which no-op as "already
exists"). Re-running is safe.

## 3. Create the `sheepdogsociety-staging` Vercel project

New Vercel project → import `red11scout/sheepdogsociety-redesign` → deploy
`main`. Set these Environment Variables (Production scope of *this* project):

| Var | Value |
|---|---|
| `DATABASE_URL` | branch **pooled** url |
| `EMAIL_TEST_REDIRECT` | **your email** (the safety lock) |
| `RESEND_API_KEY` | your Resend key |
| `AUTH_SECRET` | any staging secret (`openssl rand -hex 32`) |
| `ADMIN_EMAILS` | your admin email |
| `ADMIN_PASSWORD` | a staging password (if you use the password path) |
| `NEXT_PUBLIC_SITE_URL` | the staging URL Vercel gives you |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | your Mapbox token (for the groups map) |
| `RESEND_FROM_SHEPHERD` | *(optional)* defaults to `shepherd@…` |

**Do NOT set** `SANDBOX_READONLY` here — leaving it unset is what makes staging
writable.

## 4. Deploy

Trigger a deploy (push, or **Redeploy** in the Vercel dashboard). Note the URL,
e.g. `https://sheepdogsociety-staging.vercel.app`.

## 5. Smoke crawl (automated)

```bash
BASE='https://sheepdogsociety-staging.vercel.app' node scripts/verify-staging.mjs
```

Expect `ALL STAGING SMOKE CHECKS PASSED` — public rooms 200, `/subscribe`
renders, retired URLs redirect, `/api/public/unsubscribe` answers.

## 6. Functional checklist (by hand — needs admin login + your inbox)

Sign in at `<staging>/admin/sign-in`. Then:

- [ ] **Plant → group.** `/admin/location-requests` → approve a pending request →
      a **pending, off-map** group appears in `/admin/groups`, prefilled with the
      requester's city/state/name; the request row shows **"View group →"**.
      Approve the same one again → **no duplicate** group.
- [ ] **Subscribe column.** `/admin/members` → toggle a member's **Subscribe**
      from Yes↔No → reload the page → the value **persisted**.
- [ ] **/subscribe.** Visit `<staging>/subscribe`, submit an email → it appears
      in `/admin/newsletter` ("Subscribers"). Submit the same email again after
      unsubscribing it → it **re-activates**.
- [ ] **Unsubscribe.** From a sent email's footer link (step below) or a copied
      `/api/public/unsubscribe?...` link → the GET page shows a confirm button →
      click it → the flag flips (member `wants_newsletter` or subscriber
      `is_active` → false).
- [ ] **Weekly Letter.** `/admin/encouragements` → publish a test letter → **you**
      receive one email subject-tagged `[TEST→…]`; the recipient count reflects
      members(Subscribe=Yes) + subscribers, deduped.
- [ ] **/admin/email.** Compose → try **Everyone**, **Leaders**, and **a group** →
      the live count changes per audience → **Review & send** → **you** receive
      the `[TEST→…]` copy, and it shows under **Recent sends** (a `broadcast_log`
      row).
- [ ] **Light smoke.** Click each public room and each admin page — no 500s, no
      obviously-broken data.

Every email you receive should be `[TEST→realaddress]`. If any arrives *without*
that tag, stop — `EMAIL_TEST_REDIRECT` isn't set, and real people are at risk.

## 7. Teardown

- Delete the `sheepdogsociety-staging` Vercel project.
- Delete the `staging-test` Neon branch.

No writable environment should linger against prod-adjacent infra. After this
passes, the real prod go-live can proceed with confidence.
