# Five Rooms IA & Flow Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse 19 public destinations to 11 (five rooms + Join), wire the orphaned signup as THE conversion, rename URLs to match their names, and eliminate every duplicate/orphan page.

**Architecture:** Route renames are folder moves; ALL old-URL forwarding lives in `next.config.ts` `redirects()` (permanent, no chains, handles dynamic params) — the existing in-app redirect stub folders are deleted. New merged pages (`/new-here`, `/support`) and the restaged `/join` reuse existing components (`MemberSignup`, `NewsletterForm`, `LetterCover`) and existing server queries. A grep-driven link sweep re-points every internal href.

**Tech Stack:** Next.js 16 App Router (Turbopack), TypeScript strict, Tailwind v4 + Ridge & Bone vocabulary (`docs/superpowers/specs/RIDGE_AND_BONE_BRIEF.md`), Drizzle (read-only sandbox).

## Global Constraints

- Repo: `/Users/drewgodwin/Desktop/sheepdogsociety-redesign` — work on `main`, commit per task.
- NEVER touch: `src/lib/sandbox.ts`, `src/db/index.ts`, `src/lib/email.ts`, `src/lib/sms/**`, `vercel.json`, `src/app/api/sandbox-status/**`, `src/emails/**`, `src/app/(app)/_legacy_member_area/**`, `src/app/(app)/_resources_legacy/**`.
- Visual language: Ridge & Bone brief vocabulary only (`display-xl`, `display-soft`, `section-mark`, `folio`, `hairline`, `rule-double`, `dropcap`, `ember-band` max one per page, `paper-card`, `link-editorial`, `font-serif`, `font-pullquote`). Semantic theme classes (`text-foreground`, `border-foreground/15`) — no raw hexes outside ember internals.
- Invariants (verified in Task 10): one label = one destination sitewide; `/join` reachable in ≤1 click from every public page; every old URL redirects directly (no chains).
- Copy voice: pastoral, short sentences. NEVER: delve, leverage, navigate, robust, journey (n.), real men, alpha. No em-dashes where commas work.
- Gates per task: `npx tsc --noEmit` clean; `npm run build` clean before commit.
- Intent param vocabulary (used across Tasks 2, 6, 8, 9): `/join?intent=join|start|letter` (+ optional `&group=<id>`). `letter` maps to MemberSignup's internal `just_keep_posted`.

---

### Task 1: Letter rename (`/encouragements*` → `/letter*`) + central redirects

**Files:**
- Delete: `src/app/(public)/letter/page.tsx`, `src/app/(public)/letter/[slug]/page.tsx`, `src/app/(public)/letter/archive/page.tsx` (legacy stubs pointing at encouragements)
- Move: `src/app/(public)/encouragements/` → `src/app/(public)/letter/`
- Modify: `next.config.ts` (add `redirects()`), `src/app/(public)/letter/page.tsx` (self-links), `src/app/(public)/letter/[slug]/page.tsx` (self-links)

**Interfaces:**
- Produces: route `/letter` + `/letter/[slug]`; `next.config.ts` `redirects()` array that Tasks 2–5 APPEND to (single source of truth for all old URLs).

- [ ] **Step 1: Delete the legacy stub folder and move the real pages**

```bash
cd /Users/drewgodwin/Desktop/sheepdogsociety-redesign
git rm -r "src/app/(public)/letter"
git mv "src/app/(public)/encouragements" "src/app/(public)/letter"
```

- [ ] **Step 2: Add the central redirects block to `next.config.ts`**

Replace the whole file with:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip type checking during build (handled in CI)
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow Clerk/Supabase images
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  // Five Rooms IA — every retired URL forwards DIRECTLY to its final home.
  // Central so no in-app stub pages exist and no redirect chains form.
  // Spec: docs/superpowers/specs/2026-07-08-ia-simplification-design.md
  async redirects() {
    return [
      // The Letter (was /encouragements; ancient /letter/archive variant too)
      { source: "/encouragements", destination: "/letter", permanent: true },
      { source: "/encouragements/:slug", destination: "/letter/:slug", permanent: true },
      { source: "/letter/archive", destination: "/letter", permanent: true },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 3: Fix self-references inside the moved pages**

In `src/app/(public)/letter/page.tsx` and `src/app/(public)/letter/[slug]/page.tsx`, update every internal `href="/encouragements..."` to `/letter...` and any `metadataBase`/OG url mentioning encouragements. Also change the sidebar link `href="/get-started"` ("Get it by email") to `href="/join?intent=letter"` in `letter/page.tsx` (the explainer dies in Task 3; this link's job is capture).

```bash
grep -rn "encouragements" "src/app/(public)/letter" || echo "CLEAN"
```
Expected: `CLEAN` (component names like `EncouragementsListPage` MAY remain — only routes/hrefs must be clean; renaming the function to `LetterListPage` is encouraged but optional).

- [ ] **Step 4: Verify no other page 404s from the move, then gate**

```bash
npx tsc --noEmit && npm run build 2>&1 | tail -3
```
Expected: build lists `/letter` and `/letter/[slug]` routes; zero errors. (Other files still linking `/encouragements` keep WORKING via the redirect — they are re-pointed in Task 9.)

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(ia): rename /encouragements to /letter with central permanent redirects"
```

---

### Task 2: Groups rename (`/locations*` → `/groups*`) and start-a-group folds into Join

**Files:**
- Delete: `src/app/(public)/groups/page.tsx`, `src/app/(public)/groups/[slug]/page.tsx`, `src/app/(public)/groups/start/page.tsx` (legacy stubs), `src/app/(public)/locations/request/page.tsx` (form replaced by `/join?intent=start`)
- Move: `src/app/(public)/locations/` → `src/app/(public)/groups/` (keeps `[id]/page.tsx`)
- Modify: `next.config.ts`, `src/app/(public)/groups/page.tsx`, `src/app/(public)/groups/[id]/page.tsx`, `src/components/LocationsPreview.tsx`

**Interfaces:**
- Consumes: `next.config.ts` `redirects()` from Task 1.
- Produces: routes `/groups`, `/groups/[id]`; group detail links `/join?intent=join&group=<id>` (Task 6 reads `group` param).

- [ ] **Step 1: Delete stubs + the request form, move the folder**

```bash
git rm -r "src/app/(public)/groups" "src/app/(public)/locations/request"
git mv "src/app/(public)/locations" "src/app/(public)/groups"
```

- [ ] **Step 2: Append groups redirects in `next.config.ts`** (inside the returned array)

```ts
      // Groups (was /locations); the separate plant-a-group form folds into Join
      { source: "/locations", destination: "/groups", permanent: true },
      { source: "/locations/request", destination: "/join?intent=start", permanent: true },
      { source: "/locations/:id", destination: "/groups/:id", permanent: true },
      { source: "/groups/start", destination: "/join?intent=start", permanent: true },
```
NOTE: `/locations/request` MUST be listed BEFORE `/locations/:id` so the static segment wins.

- [ ] **Step 3: Update self-references in the moved pages + preview component**

In `src/app/(public)/groups/page.tsx` and `groups/[id]/page.tsx`: every `href="/locations..."` → `/groups...`; every `href="/locations/request"` (e.g. "Plant a group") → `/join?intent=start`. On the group DETAIL page, point its join CTA at `/join?intent=join&group=${id}`. In `src/components/LocationsPreview.tsx`: `/locations` → `/groups`, `/locations/request` → `/join?intent=start`.

```bash
grep -rn "locations" "src/app/(public)/groups" src/components/LocationsPreview.tsx | grep -v "LocationsPreview\|locationId\|location\." || echo "CLEAN"
```
Expected: `CLEAN` (variable/component identifiers containing "location" are fine; route strings are not).

- [ ] **Step 4: Gate**

```bash
npx tsc --noEmit && npm run build 2>&1 | tail -3
```
Expected: `/groups` + `/groups/[id]` in route list; `/locations*` absent; zero errors.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(ia): rename /locations to /groups; fold plant-a-group form into /join?intent=start"
```

---

### Task 3: `/new-here` — the one explainer (merges get-started + what-to-expect + how-we-gather + faq)

**Files:**
- Create: `src/app/(public)/new-here/page.tsx`
- Delete: `src/app/(public)/get-started/page.tsx`, `src/app/(public)/what-to-expect/page.tsx`, `src/app/(public)/how-we-gather/page.tsx`, `src/app/(public)/faq/page.tsx`
- Modify: `next.config.ts`, `src/middleware.ts`

**Interfaces:**
- Consumes: content read from the four pages BEFORE deleting (open each, port the copy listed below).
- Produces: route `/new-here` with a `#faq` anchor; Tasks 7–9 link `"New here" → /new-here` exclusively.

- [ ] **Step 1: Read the four source pages and build the merged page**

Open `get-started/page.tsx` (port: welcome framing + the 5 principles), `what-to-expect/page.tsx` (port: the 5-step table rhythm — Sit/Read/Speak/Pray/Leave — and its 8 FAQ items), `how-we-gather/page.tsx` (port: the four cadences, CONDENSED to a 4-row ruled list), `faq/page.tsx` (port: its 12 accordion questions; then MERGE with the 8, dropping duplicates on cost/Bible/denomination — target ~12 total, keep the sharper phrasing of each duplicate pair).

Create `src/app/(public)/new-here/page.tsx` with this structure (real copy from the ports; skeleton below is the required layout, not placeholder content — fill every `{...ported...}` slot from the source pages while porting):

```tsx
import Link from "next/link";
import { Icon } from "@/components/icons/Icon";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const metadata = {
  title: "New here — Sheepdog Society",
  description:
    "What to expect at the table: how we gather, what we do, and how to take a seat.",
};

export default function NewHerePage() {
  return (
    <>
      {/* Lead — welcome (from get-started) */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 pb-14 pt-12 md:px-10 md:pb-20 md:pt-20">
          <div className="flex items-center gap-4">
            <span className="folio">New here</span>
            <div className="hairline flex-1 text-foreground" />
            <span className="folio">Start where you are</span>
          </div>
          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-8">
              <h1 className="display-xl text-[clamp(2.2rem,6vw,4.5rem)] text-foreground">
                Welcome, <em className="text-oxblood">brother.</em>
              </h1>
              <p className="dropcap mt-8 max-w-2xl font-serif text-lg leading-[1.75] text-foreground/85 md:text-xl">
                {/* ported opening paragraph from get-started */}
              </p>
            </div>
            <aside className="border-t-2 border-foreground/60 pt-6 lg:col-span-4 lg:border-l lg:border-t-0 lg:border-foreground/15 lg:pl-10 lg:pt-2">
              <p className="section-mark">The five principles</p>
              <ul className="mt-6 space-y-4">{/* ported 5 principles, roman-numeral rows as on homepage */}</ul>
            </aside>
          </div>
        </div>
      </section>

      {/* The table — 5-step rhythm (from what-to-expect) */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
          <div className="rule-double text-foreground/70" />
          <p className="section-mark mt-10">At the table</p>
          <h2 className="display-soft mt-4 text-[clamp(1.6rem,4vw,2.6rem)]">One hour. Five movements.</h2>
          <ol className="mt-8 grid gap-px border border-foreground/15 bg-foreground/15 md:grid-cols-5">
            {/* ported Sit / Read / Speak / Pray / Leave cells: bg-background p-6, folio number, display-soft title, font-serif body */}
          </ol>
        </div>
      </section>

      {/* Cadences (condensed from how-we-gather) */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
          <p className="section-mark">The rhythm of the year</p>
          <ul className="mt-6 divide-y divide-foreground/10 border-y border-foreground/15">
            {/* 4 rows: Weekly / Monthly / Quarterly / Annual — folio label left, font-serif line right */}
          </ul>
        </div>
      </section>

      {/* FAQ — merged, deduped (~12 questions) */}
      <section id="faq" className="scroll-mt-20 bg-background text-foreground">
        <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">
          <p className="section-mark">Questions, answered</p>
          <Accordion type="single" collapsible className="mt-6">
            {/* one AccordionItem per merged question; display-soft trigger, font-serif content */}
          </Accordion>
        </div>
      </section>

      {/* Closing Join band — the page's single ember moment */}
      <section className="ember-band">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center md:py-24">
          <p className="section-mark">Take a seat</p>
          <p className="mt-6 font-pullquote text-2xl italic leading-snug md:text-3xl">
            There is a chair at the table. It has been empty long enough.
          </p>
          <Link
            href="/join"
            className="lift mt-9 inline-flex h-12 items-center gap-3 bg-bone px-8 text-[0.95rem] font-medium text-iron"
          >
            Join the brotherhood
            <Icon name="arrow-right" size={15} />
          </Link>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Delete the four source pages and add redirects**

```bash
git rm -r "src/app/(public)/get-started" "src/app/(public)/what-to-expect" "src/app/(public)/how-we-gather" "src/app/(public)/faq"
```
Append to `next.config.ts` redirects:
```ts
      // One explainer to rule them all
      { source: "/get-started", destination: "/new-here", permanent: true },
      { source: "/what-to-expect", destination: "/new-here", permanent: true },
      { source: "/how-we-gather", destination: "/new-here", permanent: true },
      { source: "/faq", destination: "/new-here#faq", permanent: true },
```

- [ ] **Step 3: Add `/new-here` to the middleware public allowlist**

In `src/middleware.ts` PUBLIC_ROUTES, after the `/what-to-expect` line, add:
```ts
  /^\/new-here(\/.*)?$/,
  /^\/support(\/.*)?$/, // added now for Task 4
```
(Leave the old route patterns in place — harmless, and the config redirects fire first.)

- [ ] **Step 4: Gate**

```bash
npx tsc --noEmit && npm run build 2>&1 | tail -3
```
Expected: `/new-here` in routes; the four old routes absent; zero errors.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(ia): merge four explainers into /new-here with anchored FAQ"
```

---

### Task 4: `/support` — merged giving + partnerships (footer-only page)

**Files:**
- Create: `src/app/(public)/support/page.tsx`
- Delete: `src/app/(public)/giving/page.tsx`, `src/app/(public)/partnerships/page.tsx`
- Modify: `next.config.ts`

**Interfaces:**
- Produces: route `/support`; Task 7's footer links it ("Support the work").

- [ ] **Step 1: Read both source pages, create the merged page**

Port from `giving/page.tsx`: the giving framing + ways-to-give rows. Port from `partnerships/page.tsx`: the five partnership lanes (church / men's group / community / school / athletics) CONDENSED to a ruled 5-row list. Structure: lead (folio strip + `display-xl` "Fuel the <em>work.</em>") → "Ways to give" ruled rows → "Partner with us" 5 rows → closing paper-card CTA to `/contact` ("Write to us about partnering"). NO ember band (the page is quiet, footer-reached). All CTAs → `/contact`. Same section skeleton as Task 3; port real copy.

- [ ] **Step 2: Delete sources + redirects**

```bash
git rm -r "src/app/(public)/giving" "src/app/(public)/partnerships"
```
Append:
```ts
      // Support absorbs giving + partnerships (both were orphaned duplicates)
      { source: "/giving", destination: "/support", permanent: true },
      { source: "/partnerships", destination: "/support", permanent: true },
```

- [ ] **Step 3: Gate + commit**

```bash
npx tsc --noEmit && npm run build 2>&1 | tail -3
git add -A && git commit -m "feat(ia): merge giving + partnerships into /support"
```

---

### Task 5: Gallery folds into Events

**Files:**
- Delete: `src/app/(public)/gallery/page.tsx`, `src/app/(public)/gallery/[id]/page.tsx`
- Modify: `next.config.ts`
- Verify (no change expected): `src/app/(public)/events/page.tsx` past-events photo section still renders photos.

- [ ] **Step 1: Delete + redirect**

```bash
git rm -r "src/app/(public)/gallery"
```
Append:
```ts
      // Gallery content lives on event pages now
      { source: "/gallery", destination: "/events", permanent: true },
      { source: "/gallery/:id", destination: "/events", permanent: true },
```

- [ ] **Step 2: Confirm events still owns the photos + check PhotoGrid consumers**

```bash
grep -rn "PhotoGrid\|photos" "src/app/(public)/events" | head -5
grep -rln "components/gallery" src/app src/components | grep -v "(public)/events" || echo "NO OTHER CONSUMERS"
```
Expected: events references remain; if `src/components/gallery/*` now has zero consumers outside events, leave the components in place (events uses them). If literally zero consumers anywhere, `git rm -r src/components/gallery` too.

- [ ] **Step 3: Gate + commit**

```bash
npx tsc --noEmit && npm run build 2>&1 | tail -3
git add -A && git commit -m "feat(ia): fold /gallery into /events"
```

---

### Task 6: Restage `/join` — intent cards + context params; trim contact topics; NewsletterForm next-step

**Files:**
- Modify: `src/app/(public)/join/page.tsx`, `src/components/MemberSignup.tsx`, `src/app/(public)/contact/page.tsx`, `src/components/public/newsletter-form.tsx`

**Interfaces:**
- Consumes: `/join?intent=join|start|letter&group=<id>` links produced by Tasks 2, 7, 8, 9.
- Produces: `MemberSignup` new optional props: `initialIntent?: "join" | "start" | "just_keep_posted"`, `initialGroupId?: string`.

- [ ] **Step 1: Extend `MemberSignup` with initial-state props**

In `src/components/MemberSignup.tsx`: add to `MemberSignupProps`:
```ts
  /** Pre-select the intent segment (e.g. from /join?intent=start). */
  initialIntent?: "join" | "start" | "just_keep_posted";
  /** Pre-select a group in the picker (e.g. from a group detail page). */
  initialGroupId?: string;
```
And initialize state from them (line ~49):
```ts
  const [intent, setIntent] = useState<Intent>(initialIntent ?? "join");
  const [groupId, setGroupId] = useState(initialGroupId ?? "");
```
(Match the existing state-variable names — if the group state is named differently, e.g. `selectedGroup`, initialize THAT one; check lines 45-60.)

- [ ] **Step 2: Rebuild `/join/page.tsx` around intent + searchParams**

The page is a server component reading `searchParams` (Next 16: `searchParams` is a Promise — `const { intent, group } = await searchParams;`). Map `intent` `"letter"` → `"just_keep_posted"`, pass through `"join"`/`"start"`, default undefined. Keep the page's existing group-options fetching exactly as-is and pass `initialIntent`/`initialGroupId={group}` into `<MemberSignup/>`. Above the form, add the three intent cards ONLY as anchor links that re-render the page with the param (server-side, no client state):

```tsx
const INTENTS = [
  { key: "join", title: "Find me a group", line: "Point me to a table near me. I will show up." },
  { key: "start", title: "I will start one", line: "No table nearby. Give me the playbook and the backing." },
  { key: "letter", title: "Just send the Letter", line: "Not ready to sit down yet. Write to me on Sundays." },
] as const;
```
Render as a 3-up `paper-card` grid (folio number, `display-soft` title, `font-serif` line); the selected card gets `border-brass`; each links `/join?intent=<key>` (preserving `group` param when present). H1 stays "There is a chair. Sit in it." with the existing deck.

- [ ] **Step 3: Trim contact topics + NewsletterForm next step**

`src/app/(public)/contact/page.tsx`: remove the `{ value: "joining", ... }` and `{ value: "starting", ... }` topic entries (those intents belong to `/join` now). Above the form add one folio line: `Looking to join or start a group? <Link className="link-editorial" href="/join">That path is here.</Link>`

`src/components/public/newsletter-form.tsx`: in the `status === "success"` branch, append under the existing confirmation:
```tsx
<p className="folio mt-3">
  Want a seat at a table?{" "}
  <Link href="/join" className="link-editorial !text-brass">Join the brotherhood</Link>
</p>
```
(add `import Link from "next/link";` if missing).

- [ ] **Step 4: Gate + commit**

```bash
npx tsc --noEmit && npm run build 2>&1 | tail -3
git add -A && git commit -m "feat(ia): restage /join with intent cards + context params; route join/start intents out of contact"
```

---

### Task 7: Nav + footer — Five Rooms, one label = one destination

**Files:**
- Modify: `src/components/public/public-nav.tsx`, `src/components/public/public-footer.tsx`

**Interfaces:**
- Consumes: routes from Tasks 1–6.

- [ ] **Step 1: Rewrite the nav model in `public-nav.tsx`**

Replace the `navLinks` array (drop the About dropdown entirely — no `children` anywhere):
```ts
const navLinks: NavLink[] = [
  { href: "/letter", label: "The Letter" },
  { href: "/groups", label: "Groups" },
  { href: "/events", label: "Events" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About" },
];
```
Rail CTA: `href="/join"` label "Join". Folio strip: keep "The Verse" → `/acts-20-28`; "New here" → `/new-here`. Mobile drawer: the five links + a "New here" row + the full-width CTA "Join the brotherhood" → `/join`. Since no `children` remain, the dropdown branch is dead — DELETE the dropdown JSX branch, the `openMenu` state, `scheduleClose`/`cancelClose`, and the Escape-key effect (YAGNI).

- [ ] **Step 2: Rewrite footer columns in `public-footer.tsx`**

Columns become: **Begin** — "New here"→`/new-here`, "Join the brotherhood"→`/join`, "The Verse"→`/acts-20-28`. **The Society** — "About"→`/about`, "Stories"→`/about#stories`, "Events"→`/events`, "Support the work"→`/support`, "Contact"→`/contact`. **The Letter** — copy + `NewsletterForm` (unchanged). Delete the old "Find a group"/"Start a group" column entries (Groups lives in the rail; starting is a Join intent).

- [ ] **Step 3: Grep the invariant, gate, commit**

```bash
grep -rn 'href="/get-started"\|href="/what-to-expect"\|href="/locations' src/components/public && echo "FAIL: stale links" || echo "CLEAN"
npx tsc --noEmit && npm run build 2>&1 | tail -3
git add -A && git commit -m "feat(ia): five-rooms nav + footer; Join finally points at /join"
```

---

### Task 8: Homepage — Join-first narrative + latest-letter teaser + "This week" band

**Files:**
- Modify: `src/app/(public)/page.tsx`

**Interfaces:**
- Consumes: `listPublishedEncouragements` from `@/server/encouragements` (returns rows with `slug`, `title`, `excerpt`/body, `publishedAt` — check the type at `src/server/encouragements.ts` and use its actual field names); `LetterCover` from `@/components/letters/LetterCover`; `db` + `events`/`testimonies`/`users` schema for the closing band (copy the exact query shapes from `src/app/(public)/events/page.tsx:18-40` and `src/app/(public)/stories/page.tsx:16-30`, with `.limit(1)`).

- [ ] **Step 1: Make the page async + fetch band data (each in try/catch → null)**

```tsx
export default async function HomePage() {
  const [latestLetter, nextEvent, latestStory] = await Promise.all([
    listPublishedEncouragements().then((r) => r[0] ?? null).catch(() => null),
    getNextEvent(), // local helper: events query, gte(startTime, new Date()), asc, limit 1, catch -> null
    getLatestStory(), // local helper: testimonies isApproved, desc createdAt, limit 1, catch -> null
  ]);
```

- [ ] **Step 2: Re-point the lead CTAs**

Primary: `href="/join"`, label "Join the brotherhood" (keep `bg-foreground text-background` treatment, swap the `map-pin` icon for `arrow-right` only at the end — one icon per button). Secondary link: `href="/letter"` "Read this week's Letter". Sidebar "How we gather" link → `href="/new-here"` label "New here? What to expect".

- [ ] **Step 3: Letter section gains the real teaser**

Above the subscribe column, when `latestLetter` exists render a `paper-card` teaser row: `LetterCover` thumb (small), folio dateline (`format(publishedAt, "MMMM d, yyyy")` — date-fns already imported by the letter page, import here), `display-soft` title linking `/letter/${slug}`, one-line `font-serif` excerpt. When null, section renders exactly as today (no empty frame). The section's trailing "What to expect" link → `/new-here` (label now truthful).

- [ ] **Step 4: Groups section + NEW closing "This week" band**

Groups section: "See every group" → `/groups`; add a second folio link "Start one" → `/join?intent=start`. After the Letter section, add the closing band:
```tsx
{(nextEvent || latestStory) && (
  <section className="bg-background text-foreground">
    <div className="mx-auto max-w-7xl px-6 pb-16 md:px-10 md:pb-24">
      <div className="flex items-center gap-4">
        <span className="section-mark">This week</span>
        <div className="hairline flex-1 text-foreground" />
      </div>
      <div className="mt-8 grid gap-px border border-foreground/15 bg-foreground/15 md:grid-cols-2">
        {nextEvent && (
          <Link href={`/events/${nextEvent.id}`} className="bg-background p-7 transition-colors hover:bg-foreground/5">
            <p className="folio">Next gathering · {format(nextEvent.startTime, "EEE MMM d")}</p>
            <h3 className="display-soft mt-3 text-xl">{nextEvent.title}</h3>
            {nextEvent.location && <p className="mt-2 font-serif text-[0.95rem] text-muted-foreground">{nextEvent.location}</p>}
          </Link>
        )}
        {latestStory && (
          <Link href="/about#stories" className="bg-background p-7 transition-colors hover:bg-foreground/5">
            <p className="folio">Latest story</p>
            <h3 className="display-soft mt-3 text-xl">{latestStory.title}</h3>
            <p className="mt-2 line-clamp-2 font-serif text-[0.95rem] text-muted-foreground">{latestStory.content}</p>
          </Link>
        )}
      </div>
    </div>
  </section>
)}
```
(If the events detail route keys on a slug field rather than `id`, use the field the events page's own links use — copy it.)

- [ ] **Step 5: Gate + commit**

```bash
npx tsc --noEmit && npm run build 2>&1 | tail -3
git add -A && git commit -m "feat(ia): homepage joins the funnel — /join primary CTA, letter teaser, This-week band"
```

---

### Task 9: Stories → About section + full-repo link sweep

**Files:**
- Modify: `src/app/(public)/about/page.tsx`, delete `src/app/(public)/stories/page.tsx`, `next.config.ts`
- Modify: every file the sweep greps out (public pages, member area, admin — NOT `src/emails/**`, NOT `_legacy*`).

**Interfaces:**
- Consumes: all routes final as of Task 8.

- [ ] **Step 1: Move Stories into About**

Port the testimonies query + card list from `stories/page.tsx` into `about/page.tsx` as a new section BEFORE any closing section: `<section id="stories" className="scroll-mt-20 ...">` with `section-mark` "Stories · What God has done", the same ruled card list (cap at 6, `.limit(6)`), and a folio link "Share your story" → `/contact`. About also gains a closing CTA row (the audit flagged it has none): a `rule-double` then two links — "New here? Start here" → `/new-here` and "Join the brotherhood" → `/join`. Then:
```bash
git rm -r "src/app/(public)/stories"
```
Append redirect: `{ source: "/stories", destination: "/about#stories", permanent: true },`
Remove "Stories" from the nav array in `public-nav.tsx`? NO — Task 7 already excluded it (nav shows five rooms; verify it did not include Stories).

- [ ] **Step 2: The sweep — find every stale internal href**

```bash
grep -rn --include="*.tsx" --include="*.ts" -E 'href=["'"'"'`]/(locations|encouragements|get-started|what-to-expect|how-we-gather|faq|gallery|giving|partnerships|stories|groups/start)' src | grep -v "_legacy\|src/emails" | sort
```
For EVERY hit, re-point per this table: `/locations`→`/groups` · `/locations/request` & `/groups/start`→`/join?intent=start` · `/locations/<dyn>`→`/groups/<dyn>` · `/encouragements*`→`/letter*` · `/get-started`,`/what-to-expect`,`/how-we-gather`→`/new-here` · `/faq`→`/new-here#faq` · `/gallery*`→`/events` · `/giving`,`/partnerships`→`/support` · `/stories`→`/about#stories`. Admin files: re-point view/preview deep-links (e.g. admin encouragements "view on site" → `/letter/${slug}`); do NOT touch server actions or API paths (`/api/...` are not page routes — leave them).

- [ ] **Step 3: Re-run until silent, then gate**

```bash
grep -rn --include="*.tsx" -E 'href=["'"'"'`]/(locations|encouragements|get-started|what-to-expect|how-we-gather|faq|gallery|giving|partnerships|stories|groups/start)' src | grep -v "_legacy\|src/emails" || echo "SWEEP CLEAN"
npx tsc --noEmit && npm run build 2>&1 | tail -3
```
Expected: `SWEEP CLEAN`, zero errors.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(ia): stories join about; sweep every stale internal link to the five-rooms map"
```

---

### Task 10: Verification crawl + deploy (definition of done)

**Files:**
- Create: `scripts/verify-ia.mjs` (crawl assertions; committed for reuse)

**Interfaces:**
- Consumes: the deployed sandbox at `https://sheepdogsociety-redesign.vercel.app`.

- [ ] **Step 1: Deploy**

```bash
cd /Users/drewgodwin/Desktop/sheepdogsociety-redesign
git push origin main
vercel --prod --yes --scope drew-godwins-projects 2>&1 | tail -5
```
Expected: `readyState: READY`.

- [ ] **Step 2: Write and run the crawl script**

`scripts/verify-ia.mjs` — plain Node (no deps), asserts the spec's §8:
```js
const BASE = process.env.BASE ?? "https://sheepdogsociety-redesign.vercel.app";
const REDIRECTS = {
  "/encouragements": "/letter",
  "/locations": "/groups",
  "/locations/request": "/join?intent=start",
  "/groups/start": "/join?intent=start",
  "/get-started": "/new-here",
  "/what-to-expect": "/new-here",
  "/how-we-gather": "/new-here",
  "/faq": "/new-here#faq",
  "/gallery": "/events",
  "/giving": "/support",
  "/partnerships": "/support",
  "/stories": "/about#stories",
  "/letter/archive": "/letter",
};
const PAGES = ["/", "/letter", "/groups", "/events", "/resources", "/about", "/join", "/new-here", "/support", "/contact", "/acts-20-28"];
let fail = 0;
const check = (ok, msg) => { console.log(`${ok ? "ok " : "FAIL"} ${msg}`); if (!ok) fail++; };

// a) every old URL redirects DIRECTLY (single hop, 30x, exact destination)
for (const [from, to] of Object.entries(REDIRECTS)) {
  const res = await fetch(BASE + from, { redirect: "manual" });
  const loc = res.headers.get("location") ?? "";
  const norm = loc.replace(BASE, "").split("#")[0];
  check([301, 302, 307, 308].includes(res.status) && norm === to.split("#")[0], `${from} -> ${to} (got ${res.status} ${loc})`);
}
// b) every room is 200 and c) links /join within one click
for (const p of PAGES) {
  const res = await fetch(BASE + p, { redirect: "manual" });
  const html = res.status === 200 ? await res.text() : "";
  check(res.status === 200, `${p} is 200 (got ${res.status})`);
  if (p !== "/join") check(html.includes('href="/join'), `${p} links /join in one click`);
  // d) no stale internal links leak into rendered HTML
  const stale = html.match(/href="\/(locations|encouragements|get-started|what-to-expect|how-we-gather|faq|gallery|giving|partnerships|stories)[/"]/);
  check(!stale, `${p} has no stale hrefs${stale ? ` (found ${stale[0]})` : ""}`);
}
// e) safety guard still active
const s = await (await fetch(BASE + "/api/sandbox-status")).json();
check(s.sandbox === true && s.writeBlocked === true && s.readWorks === true, `sandbox-status ${JSON.stringify(s)}`);
console.log(fail ? `\n${fail} FAILURES` : "\nALL CHECKS PASSED");
process.exit(fail ? 1 : 0);
```
Run: `node scripts/verify-ia.mjs`
Expected: `ALL CHECKS PASSED`.

- [ ] **Step 3: Visual pass (Playwright MCP or preview tools)**

Screenshot `/`, `/letter`, `/groups`, `/join`, `/new-here` at 1440px and 375px, light AND dark. Confirm: intent cards on /join render and pre-select via `?intent=start`; /new-here FAQ accordion opens; homepage This-week band renders (or absent gracefully when no data); nav shows THE LETTER · GROUPS · EVENTS · RESOURCES · ABOUT | JOIN.

- [ ] **Step 4: Commit the script + final push**

```bash
git add scripts/verify-ia.mjs && git commit -m "test(ia): five-rooms crawl verification script"
git push origin main
```

---

## Self-Review (completed)

- **Spec coverage:** §3 map → Tasks 1–5, 9; §4 Join → Task 6; §5 nav/footer → Task 7; §6 homepage → Task 8; §7 sweep/middleware → Tasks 3, 9 (sitemap/feed confirmed nonexistent — no-op); §8 verification → Task 10; §9 risks — start-intent data path documented in Task 2/spec, deliberately deferred. Verse dedup (§3): enforced by construction — the pages carrying duplicate ember verse bands (get-started, what-to-expect, giving) are deleted; /about keeps at most an epigraph (Task 9 port rule: do NOT port any ember verse band into about).
- **Placeholder scan:** `{/* ported ... */}` slots are explicit port instructions naming exact source files and content — the only intentionally deferred content is copy that already exists in the repo. No TBDs.
- **Type consistency:** `initialIntent`/`initialGroupId` (Task 6 Step 1) match Task 6 Step 2's usage; `?intent=join|start|letter` + `&group=` vocabulary is identical across Tasks 2, 6, 7, 8, 9 and the Global Constraints; redirect table in Task 10 matches every `next.config.ts` entry added in Tasks 1–5, 9.
