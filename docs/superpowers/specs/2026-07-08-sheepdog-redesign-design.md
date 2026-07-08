# Acts 2028 Sheepdog Society — Redesign Design Spec

**Date:** 2026-07-08
**Author:** Drew Godwin + Claude
**Status:** Draft for approval

---

## 1. Overview

Redesign the full Acts 2028 Sheepdog Society web app — a weekly editorial newsletter and
community for Christian men, anchored in Acts 20:28 — into a visually stunning, responsive,
light/dark-readable experience. The redesign lands in a **new, isolated sandbox** (new GitHub
repo + new Vercel project) so the live site at `acts2028sheepdogsociety.com` is never at risk.

**This is a re-skin, not a re-platform.** The information architecture, routes, data model,
server actions, and features stay as they are. We are replacing the *visual system* — tokens,
typography, components, layout, motion — across every surface, and adding a first-class dark mode.

### Goals
- One coherent design system applied to **all three surfaces**: public site, member community, admin CMS.
- **Light and dark** both first-class and independently legible (WCAG AA minimum, AAA for body).
- Fully responsive: 375 / 768 / 1024 / 1440 breakpoints; mobile-first.
- Deploys to a fresh Vercel project reusing the production Neon DB **read-only**, with a hard
  safety layer that prevents any write, cron, email, or SMS side effect.

### Non-goals
- No schema/migration changes. No feature additions or removals. No content rewriting.
- No changes to the live production repo or Vercel project.
- No new backend services.

---

## 2. Chosen visual direction — "Ridge & Bone" (A base + B hero)

Direction **A (The Standard — editorial reverence)** is the foundation; Direction **B
(The Watchman — iron & ember)** supplies a scoped, dark cinematic treatment for hero moments
(homepage hero, Letter covers, event headers). This gives editorial authority and long-form
readability everywhere, with cinematic punch where it earns attention.

### 2.1 Color tokens (semantic; CSS custom properties + Tailwind v4 `@theme`)

**Base — light**
| Token | Hex | Role |
|---|---|---|
| `--background` | `#F6F1E7` | page (warm bone) |
| `--card` / surface | `#FBF8F1` | cards, raised |
| `--foreground` | `#201B14` | primary text (ink) |
| `--muted-foreground` | `#5B5346` | secondary text |
| `--primary` | `#22303F` | navy — primary UI |
| `--primary-foreground` | `#F6F1E7` | on navy |
| `--accent` | `#A2762F` | brass — CTAs, links, rules |
| `--accent-foreground` | `#FFFFFF` | on brass |
| `--secondary` | `#6B6F4E` | olive — tags, quiet accents |
| `--border` | `#E4DBCA` | hairlines, dividers |
| `--ring` | `#A2762F` | focus |
| `--destructive` | `#7C2F26` | oxblood — danger |

**Base — dark**
| Token | Hex | Role |
|---|---|---|
| `--background` | `#16130E` | warm near-black |
| `--card` | `#1F1A12` | raised |
| `--foreground` | `#EDE6D6` | primary text |
| `--muted-foreground` | `#A89F8B` | secondary text |
| `--primary` | `#B8C6D4` | light steel |
| `--primary-foreground` | `#16130E` | on steel |
| `--accent` | `#C8A05A` | brass (lifted for dark) |
| `--accent-foreground` | `#1A140A` | on brass |
| `--secondary` | `#8E9270` | olive (lifted) |
| `--border` | `#332C21` | hairlines |
| `--ring` | `#C8A05A` | focus |
| `--destructive` | `#C56A54` | danger (lifted) |

**Hero surface — "iron & ember" (Direction B), theme-independent dark block**
| Token | Hex | Role |
|---|---|---|
| `--hero-bg` | `#14161A` | iron |
| `--hero-surface` | `#1C2026` | raised on hero |
| `--hero-foreground` | `#E9E6E0` | ash text |
| `--hero-muted` | `#9AA0A6` | steel text |
| `--hero-accent` | `#CF7B3F` | ember |
| `--hero-border` | `#2B3037` | hairline |

Contrast: every foreground/background pair above meets WCAG AA (≥4.5:1 body, ≥3:1 large).
Verified during implementation with a contrast check pass; any pair that fails is nudged, not shipped.

### 2.2 Typography
| Role | Family | Usage |
|---|---|---|
| Display | **Fraunces** (opsz variable) | Headlines, section titles, pull-quotes |
| Hero impact | **Barlow Condensed** 700, uppercase | Hero H1s and event/Letter covers (B treatment) |
| Body / long-form | **Newsreader** (fallback Georgia) | The Letter, articles, devotionals |
| UI / labels | **Inter** | Nav, buttons, forms, admin, captions, eyebrows |
| Scripture accent | **Cormorant Garamond** italic | Scripture pull-quotes (optional) |

Loaded via `next/font/google` (self-hosted, `display: swap`). Type scale: 12 / 14 / 16 / 18 / 20 / 24 /
30 / 38 / 48 / 60 / 76. Body 16px min on mobile, line-height 1.6, measure 65–72ch.

### 2.3 Space, radius, motion, effects
- **Spacing:** 4/8pt scale. Section rhythm 24 / 40 / 64 / 96.
- **Radius:** base `4px` (editorial restraint); hero/impact blocks `2px`; C-style soft surfaces `12px`
  reserved for member cards only.
- **Motion:** 150–300ms, ease-out enter / ease-in exit; scroll reveal (translateY 14px + fade),
  staggered 30–50ms; **all** motion gated behind `prefers-reduced-motion`.
- **Effects:** hairline rules (brass at 0.6 alpha), drop caps on the Letter, small-caps eyebrows,
  ridge-line dividers on hero blocks. No glassmorphism, no heavy shadows in light mode.

### 2.4 Anti-patterns to avoid (from design review)
Cream+serif+terracotta cliché (we use navy+brass, not terracotta), emoji as icons (Lucide only),
centered-everything, `rounded-lg` on everything, gray-on-gray body, decorative-only motion.

---

## 3. Implementation architecture

The app is Next.js 16 + Tailwind CSS v4 + shadcn/ui + Radix + Lucide. Retheme strategy, lowest-risk first:

1. **Token layer** — Define all semantic tokens in `src/app/globals.css` under `@theme` and
   `:root` / `.dark` (next-themes `class` strategy). This is the single source of truth; the existing
   Pasture & Iron variables are remapped to the new values so most components recolor for free.
2. **Font layer** — Swap `next/font` declarations; expose `--font-display`, `--font-body`, `--font-ui`,
   `--font-hero`, `--font-script`; wire into Tailwind `@theme`.
3. **Primitive layer** — Restyle shadcn primitives (`button`, `card`, `badge`, `input`, `tabs`,
   `dialog`, etc.) once in `src/components/ui/*`. Every page inherits.
4. **Composed components** — Restyle shared building blocks: site header/nav, footer, `LetterCard`,
   `GroupCard`, hero block (new `HeroCinematic` using the iron/ember tokens), section headers,
   pull-quote, scripture block.
5. **Page pass** — Walk each route group applying the composed components and layout polish:
   - **Public** (~40 routes): `/`, `/letter*`, `/devotionals*`, `/groups*`, `/events*`, `/resources*`,
     `/subscribe`, `/about`, `/contact`, `/get-started`, `/giving`, `/how-we-gather`, `/faq`,
     `/statement-of-faith`, `/stories`, `/gallery*`, `/merch`, `/partnerships`, `/scripture-reader`, etc.
   - **Member** (`(app)`): dashboard, prayer, channels, accountability, bible, testimonies, members.
   - **Admin** (`(app)/admin`): dashboard, letters editor, devotionals, events, groups, resources,
     contacts, users, newsletter, etc. — restyle chrome/tables/forms; do **not** enable writes (see §4).
6. **Auth pages**: sign-in / check-email themed to match.

Dark mode uses next-themes; the CLAUDE.md notes public default is light — we keep that default and
make the toggle first-class site-wide.

---

## 4. Sandbox safety layer (NON-NEGOTIABLE — build first)

Because the sandbox reuses the **production** Neon DB, it must be provably incapable of side effects.

**`SANDBOX_READONLY=true`** environment flag drives a guard module (`src/lib/sandbox.ts`) that:
- **Crons disabled:** remove all `crons` from `vercel.json` in the sandbox. (Purge, generate-daily,
  group-followup never run.)
- **Writes blocked:** a `assertWritable()` guard is called at the top of every server action and every
  `/api/**` mutation route; when the flag is set it throws / returns 403 before any DB write. A thin
  Drizzle wrapper additionally rejects `insert/update/delete/execute(non-SELECT)` at runtime as a backstop.
- **Outbound disabled:** Resend (email + Broadcasts), Twilio (SMS), and AI generation routes
  short-circuit to no-ops that return a synthetic "sandbox" response. No key that can send is set on
  the sandbox project (we simply don't copy `RESEND_API_KEY`, `AUTH_RESEND_KEY`, `TWILIO_*`,
  `RESEND_AUDIENCE_ID`).
- **DB creds:** copy `DATABASE_URL` from the prod project. If a read-only Neon role/replica is available
  we prefer it; otherwise the app-level guards above are the enforcement boundary.
- **Auth:** admin sign-in UI is restyled and reachable, but because writes are blocked, admin is
  effectively a themed read-only preview. Magic-link email is disabled (no Resend key), so we seed a
  sandbox session path or a temporary bypass **only** in the sandbox for visual review of admin.
- **Indicator:** hidden per decision — no visible sandbox badge in the UI. All guards remain fully active.

**Env vars copied to sandbox:** `DATABASE_URL` (read), `DATABASE_URL_UNPOOLED` (read, no migrations run),
`AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL` (= sandbox URL), `NEXT_PUBLIC_MAPBOX_TOKEN`, `ESV_API_KEY`,
`API_BIBLE_KEY`, `BLOB_READ_WRITE_TOKEN` (reads), `ANTHROPIC_API_KEY` (only if AI preview desired; gen
still guarded). **Deliberately NOT copied:** `RESEND_*`, `AUTH_RESEND_KEY`, `TWILIO_*`, `CRON_SECRET`,
`RESEND_AUDIENCE_ID`, and any Clerk/Supabase legacy keys.

---

## 5. Provisioning

1. Clone `red11scout/sheepdogsociety` → `~/Desktop/sheepdogsociety-redesign` (checkout the active
   `migration/authjs-neon-brief` branch that holds the current brand + Phase D/E/F work).
2. Create GitHub repo `red11scout/sheepdogsociety-redesign` (**public**); push a fresh `main`.
3. Create Vercel project `sheepdogsociety-redesign` under `drew-godwins-projects`, linked to the repo.
4. Pull env from prod project (`vercel env pull` against `prj_64hZpjGvQCNW3FExLqH4nhYZAfjb`), then set
   the filtered/safe subset (§4) on the new project.
5. Strip crons from `vercel.json`; add `SANDBOX_READONLY=true`.
6. Build the safety layer, then the design system, then deploy an initial themed homepage; verify;
   then roll out remaining surfaces.

---

## 6. Verification

- `npm run build` clean; `tsc --noEmit` clean; eslint clean.
- Deploy preview loads with **zero** runtime errors (check Vercel logs).
- Playwright/preview pass on: `/`, `/letter`, a group page, `/subscribe`, dashboard, one admin page —
  at 375 / 768 / 1440, in **both** light and dark. Screenshots captured as proof.
- Contrast spot-check on primary text pairs in both themes.
- Confirm no write path is reachable: attempt a guarded action, expect 403/no-op; confirm no crons in
  `vercel.json`; confirm Resend/Twilio keys absent.

---

## 7. Rollout phases (milestone check-ins)

- **P1 Provision + safety** — repo, Vercel, env, guards, banner. *Check-in: sandbox deploys, read-only proven.*
- **P2 Design foundation** — tokens, fonts, primitives, header/footer/hero. *Check-in: themed homepage live, light+dark.*
- **P3 Public site** — all public routes. *Check-in: public site walkthrough.*
- **P4 Member community** — `(app)` member routes. *Check-in.*
- **P5 Admin** — admin chrome/tables/forms. *Check-in.*
- **P6 Polish + a11y + motion + final verification.** *Check-in: final proof.*

Parallelizable page work within P3–P5 may be dispatched to subagents against the shared component library.

---

## 8. Risks & open questions

- **Prod DB reuse (accepted risk).** Mitigated by §4. Residual risk: a write path missed by the guard.
  Backstop = Drizzle non-SELECT rejection wrapper. *If a read-only Neon role can be provisioned, we use it.*
- **Admin visual review without writes.** Admin editors won't persist; we review them as themed read-only.
  Acceptable for a visual redesign; live-editing is validated later against a real branch/DB.
- **Next.js 16 + Turbopack build** must stay green through the retheme; token remap keeps diffs shallow.
- **Scope.** "Everything incl. admin" is large; phased rollout with check-ins keeps it steerable.
- **Resolved:** Sandbox indicator is **hidden** (no UI badge); guards remain fully active.
