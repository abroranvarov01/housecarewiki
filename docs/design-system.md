# HouseCareWiki design system — "Warm Editorial Home Guide"

**Principle:** Solve the problem first. Recommend the product second.
The site should read like an independent American home-care publication: editorial serif headlines, a honey
highlight on the answer, warm cream paper, and the calm, friendly tone of someone who has cleaned this before.
It evolved from the cooler "Modern Home Field Guide" (Oct 2026): same structure and credibility rules, warmer
palette, softer shapes, fewer mono caps and hard rules. Not an affiliate template.

## Voice and credibility rules (non-negotiable)

- We have **not** hands-on tested any product. Every review is `Research-Based Review`: specs, manuals, published
  standards. Never write "tested", "we tested", "lab", "measured", "verified buyer", "real homes", "hands-on",
  "certified expert", or show invented numbers (noise dB, % moisture, passes, click stats).
- Our 0–10 score is "Our rating": an editorial judgment from specs and documentation, not a measurement. Sub-scores,
  if shown, are labeled "Research assessment" and link to `/methodology`.
- No Amazon star ratings, review counts, Prime badges, prices or availability. CTA: "Check price on Amazon"
  (`AffiliateButton`, which already has `rel="sponsored nofollow noopener noreferrer"` and click tracking).
  Show `AffiliateDisclosureNote` near the first product link on any page with affiliate links.
- Byline is the team: "HouseCareWiki Editors" (`/authors/housecarewiki-editors`). No personas, no stock portraits.
- No internal spec labels in UI ("Spec Section", "SYS-", "Deterministic", "Screen 2"...). Brand is always
  **HouseCareWiki** (one word).
- Plain, specific, friendly copy. Prefer "Blot, don't rub" over "Unlock a spotless home".

## Tokens (tailwind.config.ts)

| Role | Token | Hex | Notes |
| --- | --- | --- | --- |
| Page | `paper` / `paper-light` / `paper-warm` / `paper-deep` / `paper-card` | #F8F4EB / #FCFAF5 / #F1EADC / #EAE0CD / #FFFDF8 | Warm cream. `paper-warm` for inset panels (finder, question panels). |
| Text | `ink` / `ink-secondary` / `ink-muted` | #29322C / #414A43 / #5B635C | Soft charcoal. `ink` is also the primary button color; `ink-deep` #1E2520 for hover. |
| Lines | `rule` / `rule-strong` | #E4DACA / #C8B99F | Decorative only (dividers, card borders). |
| Form controls | `rule-field` | #8C8170 | Input/select outlines; ≥ 3:1 on cream, card and warm (WCAG 1.4.11). |
| Accent | `terracotta` / `terracotta-deep` / `terracotta-soft` | #BC7254 / #9A4E30 / #F6E4DA | `terracotta` = decoration only (strokes, dots, bars). Text and links use `terracotta-deep`. Also warnings. |
| Highlight | `honey` / `honey-deep` / `honey-soft` | #EFCB77 / #E0B456 / #FAEFD2 | The `.mark` word highlight, "short answer" callouts, the main Amazon CTA. Background for dark text only. |
| Safe / compatible | `leaf` / `leaf-deep` / `leaf-soft` | #6FAE5C / #2D7139 / #E8F2E1 | Fresh leaf green (replaced the muted leaf). Use sparingly: "safe to DIY", field notes, success states. Text uses `leaf-deep`. |

The old names (`denim`, `marker`, `brick`, `moss`, `forest`, `coral`, `mist`, `sun`) are gone; don't reintroduce them
or hex literals in components.

### Contrast (WCAG 2.2 AA, measured)

| Text / foreground | on cream #F8F4EB | on card #FFFDF8 | on paper-warm #F1EADC | on soft tint |
| --- | --- | --- | --- | --- |
| `ink` #29322C | 12.1 | 13.0 | 11.1 | ≥ 10.7 (honey/terracotta/leaf-soft); 8.5 on honey |
| `ink-secondary` #414A43 | 8.4 | 9.0 | 7.7 | ≥ 7.4; 5.9 on honey |
| `ink-muted` #5B635C | 5.7 | 6.1 | 5.2 | 4.7 on paper-deep, 5.0 on terracotta-soft |
| `terracotta-deep` #9A4E30 | 5.5 | 5.9 | 5.0 | 4.9 on terracotta-soft, 5.2 on honey-soft |
| `leaf-deep` #2D7139 | 5.4 | 5.9 | 5.0 | 5.2 on leaf-soft |
| cream on `ink` button | 12.7 | | | |
| `ink` on `honey` / `honey-deep` button | 8.5 / 6.8 | | | |
| `rule-field` #8C8170 (non-text) | 3.5 | 3.8 | 3.2 | |
| `terracotta` #BC7254 (non-text only) | 3.4 | 3.6 | | Fails 4.5 as text: never use for text. |
| `leaf` #6FAE5C | 2.6 on card | | | Decoration only (left borders, dots). |

## Logo

Source sheet: [`docs/brand/logo-sheet.webp`](brand/logo-sheet.webp). Implemented as SVG in `src/components/BrandMark.tsx`
(`BrandMark` + `Wordmark`, `tone="ink"` on cream, `tone="paper"` on forest green).

- Mark: terracotta brush-stroke roof with chimney, honey 2×2 window, three honey rays. On dark surfaces the roof is cream.
- Wordmark: bold serif, "HouseCare" forest green + "Wiki" terracotta; on dark, cream + honey.
- Logo colors are the `brand.*` tokens: forest #285E3E, terracotta #C75E3D, honey #F6C343, cream #F8F4EB, leaf #6FAE5C.
  Use them for the logo and icons. UI text, links and controls keep
  the AA-checked tokens in the table (e.g. text uses `terracotta-deep`, not `brand-terracotta`, which is 3.75:1 on cream;
  logos are exempt from WCAG contrast, body text is not).
- Icons: `public/favicon.svg` (cream tile, terracotta roof) for browser tabs; `public/app-icon.svg` (forest tile, cream
  roof) renders `icon.png` (512) and `apple-icon.png` (180) via the icon step of `scripts/optimize-images.cjs`.
- OG images (`/og`) show the mark and the two-color wordmark; default kicker "The practical home care guide".

## Type

- `font-serif` Newsreader 500/600 (+ italic): headlines, card titles, pull quotes. Keep it; it carries the editorial identity.
- `font-sans` Schibsted Grotesk: body and UI. Body 16–17px, line-height 1.6–1.75, measure ≤ 65ch (`max-w-prose`).
  UI text no smaller than 13px; prefer 14–15px for meta and helper text.
- `.kicker` is now a **sans, sentence-case, 13px semibold** label ("Buying guide · 5 picks"). Write kicker text in
  sentence case; it is no longer uppercased by CSS.
- `.kicker-field` (or `<Kicker field>`) is the one place mono caps survive: a few editorial labels per page such as
  "Field note 01" on the homepage photo and the "Field note" callouts in guides. Not for metadata, tables or buttons.
- `font-mono` otherwise only for data entry where digits must line up (cost calculator inputs, admin ASINs).
- `font-hand` (Caveat 600): at most one short handwritten aside per page, decorative (`aria-hidden`), never carrying
  information or claims. Currently only on the homepage hero.
- `.mark` = honey highlight behind a word or phrase. Once or twice per page, on the thing that matters (H1 keyword).

## Shape, depth, motion

- Soft corners: cards and panels `rounded-2xl` (20px) / `rounded-xl` (16px), callouts `rounded-lg` (12px), inputs
  `rounded-lg` or `rounded-full`, buttons and chips `rounded-full`. (The radius scale is remapped in the config:
  sm 6, DEFAULT 8, md 10, lg 12, xl 16, 2xl 20, 3xl 28.)
- Section heads: a short 3px terracotta stroke above a serif title (`SectionHead`). No 2px ink rules, no "01/02"
  section numbers. Hairline `border-rule` dividers inside lists are fine.
- Depth: `shadow-card` (very light, warm-tinted) on the few cards that hold an answer; `shadow-elevated` only for
  floating layers. Grids of comparison cells keep `gap-px bg-rule`, wrapped in `rounded-2xl overflow-hidden`.
- Interactive moments (stain finder, newsletter) are **inset rounded panels** (`paper-warm`, `honey-soft`) inside
  the container, not full-bleed dark bands. There are no dark page surfaces: the footer is light (`paper-warm`,
  rounded top) with small leaf-green accents (a short stroke and green heading per column, a leaf icon by the tagline,
  a green dot by the copyright). Green stays an accent, never a large fill.
- Motion: underline growth (`.hover-title` inside a `.group`), arrow nudge, color transitions ≤ 200ms.
  No entrance animations. `prefers-reduced-motion` is handled globally.

## Voice

- Friendly, direct American English. Second person, contractions OK ("You'll get…", "Let's sort it out").
- Friendliness lives in headings, labels and helper text. Cleaning instructions, safety warnings and review criteria
  stay exact and are never softened for tone.
- No AI-marketing words: revolutionary, ultimate, transform your home, unleash, game-changing, effortless.

## Components (src/components/field/index.tsx)

`Container`, `Kicker` (tone `muted | accent | ink`, `field` for mono caps), `SectionHead` (terracotta stroke + serif
title + link; `index` accepted but not rendered), `ButtonLink` / `buttonClasses` (primary = charcoal pill | secondary
= outlined pill | honey | ghost; min 48px, `sm` 44px), `Breadcrumbs` (44px link targets), `EvidenceLabel`,
`EVIDENCE_COPY`, `Byline`, `formatDate`, `Callout` (safety = terracotta | note = leaf with "Field note" mono label |
answer = honey | info), `FaqList` (native `<details>`), `SourceList`, `Figure` (fixed aspect ratio, rounded-xl,
lazy by default, `priority` for LCP), `articleMeta`, `articleHref`, `labelCase`.

From `src/components/ui/Badges.tsx`: `AffiliateButton` (forest = charcoal pill, coral = honey pill, compact =
outlined pill; all ≥ 44px), `EditorScore` (honey-soft pill, "Our rating"), `PriceNote`, `AffiliateDisclosureNote`,
`SaveItemButton`.

Tool pickers (`InteractiveToolsClient`): questions are plain sentences with a numbered terracotta dot, one short
hint under the options, answers as 44px pills inside a `paper-warm` panel. Results sit in a rounded card and always
say why ("Why these steps", "Why it fits") before the steps or products.

## Page patterns

- **Homepage:** a lived-in hero scene (`hero-dog-coffee.webp`: dog, tipped mug, sunny room) on the right with a cream
  fade, the question + search + common-mess chips on the cream side, and one handwritten note ("Life happens. We'll
  help.", `font-hand` Caveat, desktop only); "Where's the mess?" room photo cards (swipe row on phones); "Popular
  fixes" featured photo card with its answer + "More helpful guides" photo cards; inset stain finder panel; buying
  guides with top pick; head-to-heads; tools + "How we work".
- **Problem guide:** answer first (honey callout), then safety, supplies checklist, numbered steps with field notes,
  "if it didn't work", tools only where useful, FAQ, sources. Sticky step index on desktop.
- **Buying guide:** verdict and top pick summary up top, quick picks list, comparison table (scrolls on mobile),
  per-product write-ups with pros/cons and "who should skip", what we compared and how, FAQ.
- **Product review:** verdict, who it's for / skip, research assessment, specs table with source note, related guides.
- **Comparison:** two-column verdict, key differences, scenario winners, spec table.
- **Tools:** question → answer on one screen, results explain why, inputs stay editable.
- **Trust pages:** plain long-form text, `max-w-prose`, no cards.

## Accessibility & performance

- Targets: WCAG 2.2 AA, LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1.
- Every interactive element ≥ 44×44px on touch, visible focus (global `:focus-visible`, terracotta-deep outline), labels on all inputs.
- Images: fixed aspect ratio wrappers, `loading="lazy"` except the LCP image (`priority`), meaningful `alt`
  (empty `alt=""` for decorative thumbnails next to a text link).
- Tables: wrap in `.table-scroll`, use `<th scope>`; caption or heading.
- Keep pages server components; client components only for real interactivity.
