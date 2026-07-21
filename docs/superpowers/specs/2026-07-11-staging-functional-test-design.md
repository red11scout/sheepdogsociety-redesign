# Verify-and-Test-Deploy on Isolated Neon-Branch Staging — Design Spec

**Status:** Design approved 2026-07-11. Small spec — the only code is the email-redirect guard + two scripts; the rest is setup (user-run) + a checklist.

## Goal

Prove the merged redesign works at runtime — especially the two never-run features (plant→group, member email) — on a **writable, isolated** environment, without risking prod data or emailing a single real member. Then tear it down.

## Constraints

- **Prod is the live site.** No functional testing there.
- **The existing sandbox is read-only** (`SANDBOX_READONLY`, no send keys) — it can render pages but can't exercise writes/email.
- **The staging DB is a Neon branch of prod** → real schema + real data (incl. real member emails), but writes are isolated to the branch.
- Because the branch holds real emails, **no email may leave staging to a real address.** This is the linchpin (see the guard).
- I cannot run Neon/Vercel or read the tester's inbox — the human provisions staging and does the click-through; I build the code, guide, and run the automated crawl.

## The one code change — `EMAIL_TEST_REDIRECT` guard

In `src/lib/email.ts`: when `process.env.EMAIL_TEST_REDIRECT` is set (and not in sandbox), the `resend()` client is wrapped so that:
- `emails.send` and `batch.send` rewrite **every** `to` to that single address, and prefix the subject `[TEST→<original>]`.
- `broadcasts.create` / `broadcasts.send` become no-ops (a broadcast targets a Resend audience, which can't be safely redirected — so it must not fire from staging).

The rewrite is a pure exported function `applyTestRedirect(payload, redirect)` with a unit test. The whole guard is **env-gated → completely inert in prod** (the var is never set there). This is what makes testing against a prod-data branch safe.

## Staging environment (human-provisioned; I guide via the runbook)

A throwaway Vercel project `sheepdogsociety-staging` linked to `red11scout/sheepdogsociety-redesign`, deploying `main`, with env:

| Var | Value | Why |
|---|---|---|
| `DATABASE_URL` | the Neon **branch** connection string | isolated writable DB |
| `SANDBOX_READONLY` | *unset* | writes actually happen |
| `RESEND_API_KEY` | real key | sends fire (then get redirected) |
| `EMAIL_TEST_REDIRECT` | your email | **every** send lands only in your inbox |
| `AUTH_SECRET`, `ADMIN_EMAILS`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_MAPBOX_TOKEN` | staging-appropriate | auth, links, map |
| `RESEND_FROM_SHEPHERD` | optional | defaults to `shepherd@…` |

Apply the two migrations to the branch first: `DATABASE_URL='<branch>' node scripts/apply-neon-migration.mjs` (idempotent; safe to re-run).

## Functional checklist (hand-run on staging)

Each with an expected result:
1. **Plant→group** — approve a request → pending, off-map draft group in `/admin/groups`, prefilled; row shows "View group →"; re-approve = no duplicate.
2. **Subscribe column** — toggle in `/admin/members` → persists across reload.
3. **/subscribe** — submit → row in `newsletter_subscribers`, shows in `/admin/newsletter`; re-subscribe re-activates a prior unsubscribe.
4. **Unsubscribe** — open the link (GET confirm → POST) → flag flips (`wants_newsletter` / `is_active`).
5. **Weekly Letter** — publish a test letter → you receive the redirected copy; recipient count = members(wants_newsletter) + subscribers, deduped.
6. **/admin/email** — compose → Leaders / a group / everyone → live count matches → send → you receive the redirected copy + a `broadcast_log` row.
7. **Light smoke** — every public room + each admin page loads, no 500s.

## Automation — `scripts/verify-staging.mjs`

A committed Node script (mirrors `scripts/verify-ia.mjs`) that hits the staging base URL and asserts the **unauthenticated** checks: public rooms return 200, `/subscribe` renders, `/api/public/unsubscribe` responds, retired-URL redirects still hold, `/api/sandbox-status` shows the guard is OFF (writable) on staging. The authenticated write/email flows stay hand-checked (they need admin login + your inbox).

## Who does what

- **Me:** `EMAIL_TEST_REDIRECT` guard + test; `verify-staging.mjs`; the runbook (`docs/STAGING_TEST.md`) + this checklist; run the crawl against your staging URL and interpret it.
- **You:** Neon branch, the `sheepdogsociety-staging` project + env, apply the 2 migrations, deploy, click-through, watch your inbox.

## Teardown

After the checklist passes: delete the Neon branch and the `sheepdogsociety-staging` project. No writable env should linger on prod-adjacent infra. Then the real prod go-live proceeds with confidence.

## Out of scope

- The prod go-live itself (separate, deliberate step).
- Load/perf testing. Automated E2E of authenticated flows (Playwright against staging) — possible later; v1 hand-checks them.
