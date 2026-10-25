# HouseCareWiki overhaul — change report (Oct 2026)

Branch: `seo-affiliate-improvements`. Design rules live in [design-system.md](design-system.md); before/after
screenshots are in [screenshots/](screenshots/).

## Phase 1 — Audit findings (verified in code and on the live site)

| Area | Finding | Where |
| --- | --- | --- |
| Brand | Header logo said **"HomeCare"**; footer said "HouseCareWiki" | `Header.tsx` |
| Fake authors | Three personas (Emily Carter, Marcus Vance, Claire Bennett) with Unsplash stock portraits, an invented IICRC certification, "9+ years lab testing" and "118 tested products" | `seed-data.ts`, `authors/[slug]` |
| Fake reviews | "Verified buyer" before/after testimonials with stock avatars on room pages | `seed-data.ts` (`communityResults`), `RoomSubFilterClient.tsx` |
| Fake testing | Every product and guide was labeled `Hands-on Tested`; a "Tested in real homes" seal; "(Tested)" in SEO titles; "Measured Noise 74 dBA"; "8% more moisture in our extraction tests"; "2 fewer passes"; "submerged brush heads for 30 mins"; "outperformed lint rollers by 4x"; methodology page describing stain panels and tank-weighing that never happened | `seed-data.ts`, `best/[slug]`, `methodology` |
| Unverified stats | "lifts 95% of fur", "fits 95% of US cabinets", "removes 85% of water", "99% compatibility" scores in the equipment finder | `seed-data.ts`, tools |
| Marketing claims | "Zero Sponsored Rankings", "independent product evaluations tested in real homes", "expert tips", "legendary" | `Footer.tsx`, home, seed |
| Internal labels in UI | "Spec Section 9.5 / 6.1 / 25 / 12.3", "SYS-05", "SYS-07", "Deterministic Stain Protocol", "Spec 10.3", "Head-to-Head Lab Comparison", "Overall Lab Score" | trust pages, tools, compare, account |
| Fake analytics | Seeded click log, demo subscriber emails, automation jobs reporting "SUCCESS" with invented Search Console numbers (48,920 impressions…), redirect "hits" | `seed-data.ts`, `store.ts`, admin |
| Data loss risk | Every content version bump **wiped the whole store**, including real subscribers and click logs | `store.ts` |
| Public admin link | Footer linked to "Admin CMS Portal" | `Footer.tsx` |
| Amazon data | Static prices, star ratings, review counts and Prime flags still stored and shipped in the tools' JS bundle | `seed-data.ts`, `tools-engine.ts` |
| Design | Hero → 6 identical photo cards → banner → 4 cards → green banner; handwritten "Life happens. We help." notes; forest green + coral palette; Playfair + Plus Jakarta; heavy rounded shadowed cards everywhere | all templates |
| IA | "Stain Solutions" nav pointed at one coffee guide; "Product Guides" at one buying guide; "Tips & Inspiration" pointed at `/products` | `Header.tsx` |
| Tooling | No ESLint installed, so `npm run lint` could not run | `package.json` |

Confirmed fine: Next 14.2.35 (already patched for CVE-2025-29927), Basic auth with fail-closed default and a CSRF
guard, `rel="sponsored"` on Amazon links, JSON-LD and sitemap generation, no secrets in client code.

## Phase 2–3 — Design strategy and foundation

"Modern Home Field Guide": ruled pages, labeled plates, a marker highlighting the answer.
- **Palette:** warm paper, near-black ink, denim (actions), marker yellow (the answer), brick (warnings), moss (safe).
  Old token names alias the new palette so nothing renders unstyled.
- **Type:** Newsreader (serif headlines), Schibsted Grotesk (reading/UI), IBM Plex Mono (kickers, data, numbering).
  Variable fonts, self-hosted via `next/font`.
- **Shape:** square-ish corners, hairline rules instead of shadows, asymmetric 12-col layouts, ruled lists instead of
  card grids. Motion limited to underline growth and arrow nudges; reduced-motion honored.
- **Components:** `src/components/field/index.tsx` (Container, Kicker, SectionHead, ButtonLink, Breadcrumbs,
  EvidenceLabel, Byline, Callout, FaqList, SourceList, Figure…), restyled `Badges.tsx`, new `BrandMark.tsx`, new favicon
  and app icons.
- **Navigation:** intent-based mega menu (Fix a problem / Choose a product / Rooms & surfaces / Tools) built from the
  content store; full-screen mobile menu with search; skip link; footer without the admin link.

## Phase 4 — Page templates

| Template | What changed |
| --- | --- |
| Homepage | Problem-first question + search + six common messes; lead guide with its short answer + ruled index; working two-question stain finder band; buying guides with top pick; head-to-heads; typographic room index; tools list; "How we work" |
| Problem guide | Short answer first, safety callout, sticky step index (collapsible on mobile), supplies checklist, numbered steps with field notes, "if that didn't work", tools only after the method, FAQ, sources, related guides |
| Surface guide | "Safe to use" vs "Never use" comparison as the centerpiece, routine care, deep clean steps, matching guides |
| Buying guide | Verdict + top pick up top, picks at a glance, spec table (scrolls on mobile), per-product notes with pros/cons/"skip it if" and research assessment, "what we compared", FAQ |
| Product review | Verdict-first header, fit / skip, highlights, assessment, specs with source note, where we recommend it |
| Comparison | Face-off columns with "our pick for most homes", verdict, key differences, scenario winners, spec-by-spec table |
| Comparison builder | Toggle picker with count, sticky-column matrix, no price/rating rows |
| Tools | Index led by the two problem tools; each tool uses fieldset/radio chips, live answer with "why", safety, steps, pros; URL prefill (`?stain=&surface=`); budget filter removed (no verified prices) |
| Search | Big field, room chips, results grouped Guides → Buying guides & reviews → Surfaces, helpful empty state; doubles as "All guides" |
| Room hub | Compact header, "Start here" guide, topic filter (all links server-rendered), honest "still writing" state, room tools, surfaces |
| About / Methodology / Team / policies | New `/about`; methodology rewritten to describe what we actually do; team byline page; calm long-form policy pages |

## Phase 5 — Credibility and content

- Single honest byline **HouseCareWiki Editors** (`kind: 'team'` → Organization in JSON-LD). Old persona URLs 301 to it.
- All reviews relabeled **Research-based · Not hands-on tested**, with an explanation linked to `/methodology#evidence`.
- "Our rating" is described everywhere as an editorial judgment, not a measurement.
- Removed testimonials, invented measurements, percentages, test procedures, "(Tested)" titles, hype words.
- Price, Amazon rating, review count and Prime fields deleted from the data model entirely.
- Rewrote generic subtitles/excerpts into specific ones.

## Phase 6 — SEO, security, performance

**SEO preserved:** every existing URL still returns 200; canonicals, robots rules, JSON-LD, sitemap and OG are intact.
Added: 301s for retired author URLs and the two legacy redirects listed in the CMS; `/about` in the sitemap; brand-name
titles no longer get a duplicate "| HouseCareWiki" suffix. New pages: only `/about` (brand intent).

**Security (no critical vulnerability found; hardening applied):**
- Admin page and admin API now re-check Basic auth on the server (`src/lib/admin-auth.ts`), not only in middleware.
- nginx strips `x-middleware-subrequest` (defense in depth for the CVE-2025-29927 class).
- `/api/affiliate/click` only records known product IDs with length-capped fields (was: arbitrary strings into the store).
- `/api/newsletter/subscribe` validates email, caps list size, stores addresses as `UNCONFIRMED` (no confirmation mail exists).
- Admin API validates editorial status, redirect paths and whitelists config keys.
- Admin "run job" no longer reports a fake success; jobs show "Not connected".
- Store migrations keep real subscribers, clicks, redirects and audit history and drop only the old demo rows.

**Performance:** variable fonts (5 font files), fixed-ratio images (CLS 0.000 measured on the homepage), LCP image
eager + `fetchPriority=high`, pages stay server components; content pages ~98 KB first-load JS.

## Phase 7 — Verification

- `npm run build` (includes content validation): passes.
- `npm run typecheck`: passes. `npm run lint` (ESLint now installed, `next/core-web-vitals`): no warnings or errors.
- Crawl of all 49 sitemap URLs + 6 extra routes against the production build: correct status, one `<h1>`, canonical and
  JSON-LD on every page, no banned claims, every Amazon link `rel="sponsored…"` with a disclosure on the page.
- Auth: `/admin` and `/api/admin/state` → 401 anonymous, with the bypass header, and with a wrong password; 200 with
  credentials; cross-origin POST → 403.
- Visual checks at 1280px and 375px on the main templates; no page-level horizontal scroll.
- There is no automated test suite in this repo, so no unit tests were run.

## Remaining issues / follow-ups

1. **Photography.** Current images are the existing illustrative set. Real process and result photos (or clearly
   labeled illustrations) would do more for credibility than any layout change. No images were generated in this pass.
2. **Real people.** If real editors exist, add them as `kind: 'person'` authors with their own photos and bios.
3. **Hands-on testing.** The evidence system supports `Hands-on Tested`; use it only once a product is actually tested.
4. **CMS redirects** are stored but not served (nothing reads `store.redirects` at request time). The two seeded ones are
   now in `next.config.mjs`.
5. **Newsletter** has no confirmation email or unsubscribe flow yet; the privacy page describes the intended behavior.
6. **Field Core Web Vitals** (LCP/INP on real devices) should be checked in Search Console / PageSpeed after deploy.
7. The coffee-on-sofa guide sits in the "Floor & Carpet Care" room; moving it would change its breadcrumb.
