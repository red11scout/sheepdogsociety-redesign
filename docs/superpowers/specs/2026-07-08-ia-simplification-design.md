# Five Rooms — IA & Flow Simplification

**Date:** 2026-07-08 · **Status:** Approved (design gate passed)
**Applies to:** `sheepdogsociety-redesign` sandbox (Ridge & Bone visual system already shipped)

## 1. Problem

The site's flow is illogical. An adversarial audit found:

- **The "Join" CTA never reaches the signup.** `/join` — the only real signup form
  (intent-routing `MemberSignup`) — has zero inbound links. The nav's "Join" pill lands
  on `/get-started`, an explainer with no form.
- **Four overlapping explainers** (`/get-started`, `/what-to-expect`, `/how-we-gather`,
  `/faq`) with two duplicate FAQ sets; all dead-end into the same two links.
- **Label/URL/name drift:** Groups = `/locations` = "The outposts" = "Find a group";
  The Letter = `/encouragements`; "New here" points at two different pages (nav vs
  footer); a homepage link reading "What to expect" targets `/get-started`.
- **Orphans & duplicates:** `/giving` and `/partnerships` unreachable and mutually
  redundant; Gallery duplicates Events' past-photos; the Acts 20:28 verse band appears
  on six pages.
- **The homepage links to almost nothing** (no About/Events/Stories/Resources path).

## 2. Decisions (locked at the design gate)

1. **Primary action = one unified Join flow.** The intent-routing signup
   (find me a group / I'll start one / just send the Letter) is THE conversion.
2. **Full consolidation.** Pages merge; URLs are renamed to match their names, with
   redirects from every old path.
3. **Approach B — "Five Rooms."** Five literal top-level destinations + one Join.

## 3. The map (19 public destinations → 11)

### Top level
| Room | URL | Notes |
|---|---|---|
| The Letter | `/letter`, `/letter/[slug]` | renamed from `/encouragements*` |
| Groups | `/groups`, `/groups/[id]` | renamed from `/locations*` |
| Events | `/events`, `/events/[slug]` | absorbs Gallery content (past-event photos on event detail) |
| Resources | `/resources`, `/resources/[slug]` | unchanged |
| About | `/about` (+ `#stories` anchor) | absorbs Stories as a page section |
| **Join** | `/join` | THE conversion; intent-first |

### Supporting
| Page | URL | Notes |
|---|---|---|
| New here | `/new-here` | merges get-started + what-to-expect + how-we-gather + faq |
| The Verse | `/acts-20-28` | the single canonical verse page |
| Support | `/support` | merges giving + partnerships; footer-only |
| Contact | `/contact` | topics trimmed: "Joining"/"Starting" options removed (those route to /join) |
| Legal | `/privacy`, `/sms-terms` | unchanged |

### Redirects (301 stubs; old → new)
- `/encouragements` → `/letter`; `/encouragements/[slug]` → `/letter/[slug]`
- `/locations` → `/groups`; `/locations/[id]` → `/groups/[id]`
- `/locations/request` and `/groups/start` → `/join?intent=start`
- `/get-started`, `/what-to-expect`, `/how-we-gather` → `/new-here`
- `/faq` → `/new-here#faq`
- `/gallery` → `/events`; `/gallery/[id]` → `/events`
- `/giving`, `/partnerships` → `/support`
- Existing legacy stubs (`/letter*` → encouragements, `/groups*` → locations) are
  REPLACED by the real pages / reversed stubs. No redirect chains: every old URL
  points directly at its final destination.

### Verse dedup
Full ember-band verse on `/` and `/acts-20-28` only. Elsewhere: at most a one-line
folio epigraph. (Removes 4 duplicate ember bands.)

## 4. The Join flow

`/join` anatomy, in order:
1. H1: "There is a chair. Sit in it." + two-sentence deck.
2. **Three intent cards** — *Find me a group* / *I'll start one* / *Just send the
   Letter*. Selecting expands the matching `MemberSignup` stage inline (existing
   component and API; restaged, not rewritten).
3. Success → existing covenant "watch card".

Context rules:
- `?intent=join|start|letter` pre-selects a card; `?group=[id]` pre-fills the group
  picker (group detail pages link `/join?intent=join&group=…`).
- Every page's primary CTA points at `/join` (with intent params where context gives
  one). "Join" and "Join the brotherhood" NEVER point anywhere else.
- `NewsletterForm` (home + footer) remains zero-friction email capture; its success
  state gains one line: "Want a seat at a table? → Join."

## 5. Navigation & footer

- **Rail:** THE LETTER · GROUPS · EVENTS · RESOURCES · ABOUT | **JOIN**. No dropdowns.
- **Folio strip (desktop):** verse line · "The Verse" → `/acts-20-28` · "New here" →
  `/new-here` · theme toggle.
- **Mobile drawer:** the same five + Join + New here. Nothing desktop-only that
  matters (New here must be reachable on mobile).
- **Footer:** *Begin* (New here, Join, The Verse) · *The Society* (About, Stories →
  `/about#stories`, Events, Support, Contact) · *The Letter* (subscribe form) ·
  colophon verse + folio line.
- **Invariant:** one label = one destination, sitewide. "New here" always
  `/new-here`; "Join" always `/join`; "Find a group" always `/groups`.

## 6. Homepage narrative

1. **Lead** — "Find your brothers." Primary CTA **"Join the brotherhood" → `/join`**;
   secondary "Read this week's Letter" → `/letter`. Standing-orders sidebar links
   `/new-here`.
2. **Ember verse** (unchanged).
3. **The Letter** — latest letter teaser (title, first line, cover via existing
   query/`LetterCover`) above the subscribe form.
4. **Groups map** — section → `/groups`; "Start one" → `/join?intent=start`.
5. **NEW "This week" closing band** — next upcoming event + latest story, linking
   `/events` and `/about#stories`.

## 7. Execution notes

- Route renames = folder moves + new redirect stubs; update `middleware.ts`
  PUBLIC_ROUTES (add `/new-here`, `/support`, keep old patterns for the stubs),
  `sitemap.xml`, `feed.xml`, per-page metadata/OG.
- Full-repo link sweep: every href matching
  `locations|encouragements|get-started|what-to-expect|how-we-gather|faq|gallery|giving|partnerships`
  re-pointed (public, member, admin, emails EXCLUDED — emails are outbound templates
  left untouched in the sandbox).
- `/new-here` content merge: welcome (from get-started) → the 5-step table rhythm
  (from what-to-expect) → cadences condensed (from how-we-gather) → single merged
  FAQ (~12 questions, deduped from 12+8) → closing Join band.
- Safety layer untouched (`sandbox.ts`, `db/index.ts`, `email.ts`, `sms/`,
  `vercel.json` are out of scope).

## 8. Verification (definition of done)

- `tsc --noEmit` and `next build` clean.
- Playwright crawl of the deployed sandbox asserting:
  a. every nav/footer label lands on a URL whose slug matches the label's meaning;
  b. zero orphan public pages (every page has ≥1 inbound link from nav/footer/home);
  c. `/join` reachable in ≤1 click from every public page;
  d. every old URL 301s directly to its final destination (no chains);
  e. light + dark, 375px + 1440px on the six top-level rooms.
- `/api/sandbox-status` still `{sandbox:true,readWorks:true,writeBlocked:true}`.

## 9. Risks

- **Start-a-group data path:** folding `/locations/request` into `/join?intent=start`
  means new start-leads land in `members` (existing intent flow), not
  `location_requests` (which the admin Location Requests screen reads). Moot in the
  read-only sandbox; a production merge must choose: dual-write, or repoint that
  admin screen. Documented, deliberately deferred.
- **SEO of renamed URLs:** mitigated by direct 301s + sitemap update; sandbox domain
  carries no equity anyway.
- **Gallery fold:** `/gallery/[id]` redirects to `/events` (not per-event mapping);
  acceptable because gallery ids don't map 1:1 to event slugs. Past-event photos
  remain visible on event detail pages.
