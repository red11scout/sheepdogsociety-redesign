# Ridge & Bone — page-pass design brief

The redesign inverts the old identity. The old site was a **dark aurora poster**
(Barlow Condensed 900, blue-iron ground, glow washes, glass cards, mono
tickers). Ridge & Bone is a **printed broadsheet**: warm paper, warm ink,
serif-first, rules instead of glow. Light is the default theme; dark mode is
candlelit (warm brown-black), never blue.

## Foundation (already shipped — do not re-implement)
- Tokens in `src/app/globals.css`: warm oklch light + dark palettes; brand
  constants `--c-iron #211a11` (warm ink), `--c-bone #f4edde`, `--c-brass`,
  `--c-oxblood`, `--c-olive`, `--c-stone`, `--c-navy`.
- Fonts in `src/app/layout.tsx`: `--font-fraunces` (display), `--font-newsreader`
  (body serif), plus legacy Inter/Cormorant/Merriweather/Barlow/JetBrains vars.
- Default theme is **light**.

## The vocabulary — use these, nothing else
| Class | Use |
|---|---|
| `.display-xl` | Fraunces display headlines (opsz 144, WONK). `text-[clamp(...)]` for size |
| `.display-soft` | Smaller Fraunces headings, card titles |
| `.brand-wordmark` | Brand lockups only |
| `.section-mark` | Small-caps Inter eyebrow (brass). Pair with `.hairline` |
| `.folio` | Dateline/metadata small-caps (stone) |
| `.hairline` | 1px rule (currentColor at 16%) |
| `.rule-double` | Broadsheet double rule — section dividers |
| `.dropcap` | Oxblood Fraunces first-letter on lead paragraphs |
| `.ember-band` | THE one dark cinematic surface (constant warm-ink + ember radial). Use at most once per page |
| `.paper-card` / `.glass-card` | Solid paper card, hairline border (glass is a legacy alias — same look) |
| `.link-editorial` | Underlined ink link that warms to brass |
| `.lift` | 2px hover lift on CTAs |
| `.font-serif` (Tailwind) | Newsreader body text |
| `.font-pullquote` | Cormorant italic — scripture/pull-quotes |
| `.reveal` | Scroll fade-up (existing IO wiring) |

## Rules
1. **Paper first.** Sections sit on `bg-background`. No full-viewport dark
   heroes. The only dark surface is `.ember-band`, max one per page, for a
   verse/charge moment.
2. **Serif hierarchy.** Headlines `.display-xl`/`.display-soft` (Fraunces),
   body text `font-serif` (Newsreader) at `text-base`→`text-lg`,
   `leading-relaxed`+. UI strings (buttons, labels, forms) stay Inter.
3. **Rules structure the page.** `section-mark + hairline` opens sections;
   `rule-double` divides major blocks; sidebar columns get `border-l
   border-ink/15` + `pl-*`. No drop shadows except `.paper-card`'s hover.
4. **Kill the old effects on sight**: remove `aurora`, `dotted-grid`,
   `spotlight`, `breathe`, `Magnetic` wrappers (keep the child), glassy
   translucent backgrounds, `display-xl` at 9rem poster scale, mono
   `section-mark` assumptions. The CSS makes most of them no-ops, but strip
   the markup when touching a file.
5. **Color discipline.** Ink for text, brass for eyebrows/links/accents,
   oxblood for the single emphatic word (italic `<em>` in a headline) or
   drop caps, olive only for tags/status. Never brass body text.
6. **Buttons**: primary = `bg-ink text-bone` (or `bg-bone text-iron` inside
   `.ember-band`); secondary = `border border-ink/70` small-caps. 2px radius
   comes from tokens — don't add `rounded-*`.
7. **Both themes.** Everything must read in light AND dark (`.dark` flips
   tokens automatically if you use semantic classes — `text-foreground`,
   `bg-background`, `border-ink/15`, `text-muted-foreground`). Never hardcode
   hexes except inside `.ember-band` internals.
8. **Responsive**: mobile-first, test 375/768/1440 mentally; grids collapse
   `lg:grid-cols-12` → single column; keep touch targets ≥44px.
9. **A11y**: keep aria-*, focus states, alt text; body min 16px;
   `prefers-reduced-motion` is already respected by the shared classes.
10. **Never touch**: `src/lib/sandbox.ts`, `src/db/index.ts`, `src/lib/email.ts`,
    `src/lib/sms/**`, `vercel.json`, auth/middleware, any server action logic.
    This is a visual pass only — className/markup/copy-structure changes.

## Reference implementations (already converted — copy their patterns)
- `src/app/(public)/page.tsx` — front page: folio strip, display lead,
  standing-orders sidebar, ember band, ruled sections.
- `src/components/public/public-nav.tsx` — three-tier masthead.
- `src/components/public/public-footer.tsx` — colophon.
