# Acts 2028 Sheepdog Society

## Overview
A weekly editorial newsletter for Christian men, anchored in Acts 20:28. Brief at `/Users/drewgodwin/Downloads/compass_artifact_wf-145eb503-8b48-455b-b02c-82c124aca57a_text_markdown.md`. Public site (Letter, Groups, Events, Resources, About, Join) plus an admin CMS. Admin-only auth via magic-link. The member community (chat, prayer, accountability, channels, reading plans) was **removed on 2026-07-11** — it was orphaned with no member sign-in path; the only surviving routes under `(app)` are `/admin/**`. Its unused Drizzle table defs were dropped from `schema.ts`; the physical tables remain in prod pending a human-reviewed DROP migration (see `docs/MIGRATIONS.md`).

## Stack
- **Framework**: Next.js 16 (App Router, Turbopack) + TypeScript strict
- **UI**: shadcn/ui + Tailwind CSS v4 + Radix UI + Lucide icons
- **Brand**: Pasture & Iron palette (bone, iron, navy, brass, olive, oxblood, stone) + Fraunces (display) + Cormorant Garamond (pull-quotes/scripture) + Inter (UI/body) + Merriweather (legacy scripture class)
- **Auth**: Auth.js v5 (NextAuth) + Resend magic-link + Drizzle adapter (allowlist via `ADMIN_EMAILS`)
- **Database**: Neon Postgres in production (`DATABASE_URL` = pooled endpoint, host suffix `-pooler`; `DATABASE_URL_UNPOOLED` available for migrations). Wired into Vercel via the Marketplace integration so env vars sync automatically. Previous Supabase install was retired 2026-05-08.
- **ORM**: Drizzle ORM (`src/db/schema.ts`, 29 tables — the 9 member-community tables were dropped from the schema on 2026-07-11)
- **AI**: Vercel AI SDK (`ai` + `@ai-sdk/anthropic`) streaming via `claude-sonnet-4-5`. NEVER LangChain.
- **Email**: Resend (transactional + Broadcasts) + React Email templates (`src/emails/`)
- **Editor**: Tiptap v3 (StarterKit + Underline + Link + Image + Placeholder + BubbleMenu via `@tiptap/react/menus`)
- **Maps**: Mapbox GL + react-map-gl (geocoder IS built in the admin groups table; the draggable-pin picker is not yet built; `LocationMap` covers public reads)
- **Storage**: Vercel Blob (`@vercel/blob`)
- **Theme**: next-themes (default LIGHT for public site; members can toggle)

## Commands
```bash
npm run dev          # next dev — local server on :3000
npm run build        # next build — Turbopack production build
DATABASE_URL='...' node scripts/apply-neon-migration.mjs  # apply Drizzle SQL to prod Postgres
npx drizzle-kit generate                                       # generate new migration after schema change
```

NEVER `drizzle-kit push` to prod. Migrations apply via `scripts/apply-neon-migration.mjs` or a manual GitHub Action.

## Key Patterns
- Server Components by default; `"use client"` only for interactivity (editor, modals, state)
- Auth.js `auth()` available at `@/auth` (full Session) or `@/lib/auth-compat` (Clerk-shape `{ userId }` for the 76 legacy call sites still in transition)
- Admin gating: middleware lets public routes through; admin pages double-check `users.role === "admin"` server-side
- AI calls: server-only, all log to `ai_generations` with prompt/version/model/tokens. Banned-word list in `src/lib/ai/system-prompt.ts`. Bible verse text NEVER generated — use `{{VERSE: ref}}` placeholders
- Soft delete: `deletedAt` column + partial unique indexes (`.where(deleted_at IS NULL)`); 30-day cron purge
- Letter versions: every autosave writes a row to `letter_versions` for restore/diff
- Resend Broadcasts: created in `publishLetter` server action; failures don't block the website publish

## Brand Voice (Jeremy)
Pastoral, warm, direct, masculine without macho. Short Anglo-Saxon sentences. Imperative + invitation, never command. Tender and tough. NEVER: delve, leverage, navigate, robust, tapestry, journey (n.), rise, reclaim, real men, alpha, based, toxic masculinity. NEVER em-dashes when commas work. NEVER political/culture-war framing.

## Active Routes
**Public (`(public)`):** `/`, `/letter`, `/letter/[slug]`, `/groups`, `/groups/[id]`, `/events`, `/events/[slug]`, `/resources`, `/resources/[slug]`, `/about`, `/join`, `/new-here`, `/support`, `/contact`, `/acts-20-28`, `/privacy`, `/sms-terms`. Retired URLs (`/encouragements*`, `/locations*`, `/devotionals*`, `/blog*`, `/subscribe`, `/merch`, `/statement-of-faith`, `/get-started`, `/how-we-gather`, `/faq`, `/giving`, `/partnerships`, `/stories`, `/gallery`, `/scripture-reader`, `/daily-scripture`) permanently redirect to a live room via `next.config.ts`.
**Auth (`(auth)`):** `/admin/sign-in`, `/admin/check-email`
**Admin (`(app)/admin`):** `/admin/dashboard`, `/admin/letters`, `/admin/letters/[id]`, `/admin/encouragements`, `/admin/contacts`, `/admin/events`, `/admin/events/past`, `/admin/gallery`, `/admin/groups`, `/admin/location-requests`, `/admin/newsletter`, `/admin/prayer`, `/admin/resources`, `/admin/testimonies`, `/admin/members`, `/admin/users`, `/admin/audit`, `/admin/settings` (`/admin/locations` redirects to `/admin/groups`)
**SEO:** `/sitemap.xml`, `/robots.txt`, `/feed.xml`
**API:** `/api/auth/[...nextauth]`, `/api/ai/draft`, `/api/ai/improve`, `/api/ai/blog-draft`, `/api/ai/devotional`, `/api/ai/scripture-of-day`, `/api/ai/reading-plan`, `/api/webhooks/resend`, plus existing CRUD under `/api/admin/*` and public reads under `/api/public/*`

## Required Env Vars
**Auth:** `AUTH_SECRET`, `AUTH_RESEND_KEY`, `ADMIN_EMAILS`, `NEXT_PUBLIC_SITE_URL`
**Email:** `RESEND_API_KEY`, `RESEND_AUDIENCE_ID`, `RESEND_FROM_AUTH`, `RESEND_FROM_NEWSLETTER`
**DB:** `DATABASE_URL` (Neon pooled endpoint — used by the entire runtime: app queries + Auth.js + every feature). `DATABASE_URL_UNPOOLED` for migration scripts that need a stable session. Migrations applied via the GitHub Action at `.github/workflows/apply-migrations.yml` (auto on push to main when `drizzle/*.sql` changes) using the `DATABASE_URL_PRODUCTION` env secret.
**AI:** `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` (for `gpt-image-1`, optional)
**Maps:** `NEXT_PUBLIC_MAPBOX_TOKEN`
**Storage:** `BLOB_READ_WRITE_TOKEN`
**Bible:** `ESV_API_KEY`, `API_BIBLE_KEY`
**Cron:** `CRON_SECRET`
**Legacy / dead weight on Vercel (safe to remove):** `CLERK_*`, `NEXT_PUBLIC_CLERK_*`, `CLERK_WEBHOOK_SECRET`, all `SUPABASE_*` keys (the chat broker is decommissioned and prod is on Neon as of 2026-05-08), `NEON_DATABASE_URL` (already removed; the marketplace integration uses `DATABASE_URL` directly).

## Vercel
- Project: `drew-godwins-projects/sheepdogsociety`
- Live: `acts2028sheepdogsociety.com` (apex 307→www) + `www.acts2028sheepdogsociety.com`
- Cron: `vercel.json` declares `/api/cron/generate-daily` (existing daily 5am), `/api/cron/purge` (daily 4am, soft-delete sweeper), `/api/cron/group-followup` (hourly inquiry nudges). AI routes get `maxDuration: 60` (Pro plan).
- Migrations: never `drizzle-kit push` to prod; use `scripts/apply-neon-migration.mjs` or a manual GH Action.

## GitHub
- Repo: `red11scout/sheepdogsociety`
- Migration branch: `migration/authjs-neon-brief` (active — contains the Auth.js + brand redesign + Phase D/E/F work)
