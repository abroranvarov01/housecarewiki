# Warm refinement report — "Warm Editorial Home Guide"

Date: 2026-10-25. Scope: an evolution of the "Modern Home Field Guide" redesign, not a new design. Roughly 70% is
unchanged (serif headlines, problem-first structure, honey highlight on the answer, research-based labeling,
layouts and page patterns); about 30% is warmer: palette, shapes, labels and some copy.
Rules live in [`design-system.md`](design-system.md). Screenshots: `docs/screenshots/warm-before-*` and
`warm-after-*` (home, room, guide, best, product, compare, tools, stain finder; desktop 1440px and mobile 500px).

## 1. Audit: what felt cold, what we kept

Cold or technical:
- Denim blue + near-black on cool off-white read as a manual, and the stain finder was a full-bleed dark denim band.
- Mono, ALL-CAPS 11px labels everywhere (156 kickers): metadata, table heads, form labels, "PLATE 01".
- 2px black rules on top of every section, plus "01 / 02 / 03" section numbers and numbered link lists.
- Square corners on cards, inputs and buttons; 2px black search box; grayscale room thumbnails.
- Small 36px buttons (compact Amazon button, Save, small `ButtonLink`), 20px breadcrumb links.
- The homepage showed the same coffee-sofa photo twice (hero plate and lead guide).

Kept: Newsreader serif headlines, the `.mark` highlight, the problem-first hero with search and common messes, the
answer-first guide layout, research-based labels, disclosures, specs tables, the room index, all copy in guides
and reviews.

## 2. Visual system

- Tokens in `tailwind.config.ts`: `paper` cream #F8F4EB, `ink` soft charcoal #29322C, `terracotta` #BC7254
  (+ `-deep` #9A4E30 for text), `honey` #EFCB77, `sage` #98AA92 (+ `-deep` #4A6145 for text), plus `rule-field`
  #8C8170 for form-control outlines. The legacy names (denim, marker, brick, moss, forest, coral, mist, sun) were
  renamed across `src/` with a scripted, token-aware replacement and removed from the config.
- Contrast was checked for every text/background pair in use (table in `design-system.md`). Findings: terracotta
  (3.4:1) and sage (2.3:1) fail as text, so they're decoration only and text uses the `-deep` variants (5.5:1 and
  6.2:1 on cream). The old `rule-strong` input borders were 2.1:1, below the 3:1 needed for form controls, so inputs
  now use `rule-field` (3.5:1 on cream).
- `.kicker` is now sentence-case sans 13px semibold. Mono caps remain only as `.kicker-field`: "Field note 01" on
  the homepage photo and the "Field note" callouts in guides.
- `SectionHead`: a short terracotta stroke over the serif title instead of a 2px black rule and an index number.
- Radius scale remapped (cards 16–20px, callouts 12px, buttons and chips pill-shaped). A light warm `shadow-card` on
  answer cards. `gap-px` comparison grids are kept, now inside rounded containers.
- Buttons: charcoal pill (primary), outlined pill (secondary), honey pill (main Amazon CTA). Min 48px, small 44px.
- Brand mark and favicon recolored to charcoal and honey; `icon.png` / `apple-icon.png` regenerated from
  `favicon.svg` with sharp (only the icon step: the full `optimize-images` script was not run, so the WebP photos
  were not re-encoded). OG image colors and `themeColor` updated.

## 3. Homepage (`src/app/page.tsx`)

- Hero layout unchanged (copy + search + examples on the left, photo on the right). The photo is no longer
  full-bleed: it's a rounded image with a "Field note 01" caption, 4:3 on mobile so the hero stays moderate.
- Copy decisions on the suggested lines:
  - **H1 kept: "What needs fixing today?"** It names the visitor's problem; "What's going on at home?" is warmer but
    vaguer as the page's main heading.
  - **"What's going on at home?"** used as the search label (replacing "DESCRIBE THE MESS"). A friendly question
    fits right where people type.
  - **"Here's what to do"** replaces "THE SHORT ANSWER" on the homepage lead-guide card: it introduces actual steps.
    Guide pages keep "The short answer", which matches the featured-snippet style of the content.
  - **"Let's sort it out"** used in the stain finder heading: "Spilled something? Let's sort it out."
  - **"Show me how"** kept as the finder's button (already there).
  - **"More helpful guides"** used as the list heading next to the lead guide.
  - **"Let's take care of that."** not used: before the visitor has said what's wrong it doesn't answer anything,
    and in a heading it would replace a descriptive one.
  - "Fix it now" became "Popular fixes", which matches what the section is.
- Common messes are 44px pill chips instead of a numbered ruled list.
- Duplicate photo removed: the lead guide is now a text card (title, answer, "See all 5 steps"); the hero photo
  links to that guide.
- Stain finder: inset `paper-warm` panel with plain labels ("What spilled?", "On what?") and a honey button,
  instead of a full-bleed dark band. One charcoal button and one honey button per screen; no wall of buttons.
- Buying guides: three rounded cards (not six identical ones), rooms with full-color thumbnails, tools list without
  numbers, "How we work" in a soft card.

## 4. Internal pages

Most internal pages changed through the shared components and tokens. Specific edits:
- **Guides:** field notes use the sage callout with a mono "Field note" label; step numbers stay large serif
  (terracotta-deep). Product links in "Tools that help" have 44px targets.
- **Best / product reviews:** research-assessment bars are rounded terracotta bars; scores are sans tabular figures.
  "Research-based · Not hands-on tested", "Our rating", "Editorial judgment… Not a measurement", "We have not
  measured these", "How we score" / "How we evaluate" links and all disclosures are unchanged.
- **Compare:** rounded verdict grid, softer table rules, scenario-winner pills raised to 44px.
- **Tools / pickers:** questions are full sentences with a numbered dot ("What did it land on?", "How long ago?",
  "What letter is on the sofa tag?"), each with one short hint ("Pick the closest match.", "The material decides
  which cleaners are safe to use.", "Fresh stains come out most easily."). Options are 44px pills in a soft panel
  titled "Tell us about the stain". Results stay in a rounded card that explains first ("Why these steps",
  "Why it fits") and lists steps after. The tool logic and rule sets were not touched.
- **Search, 404, newsletter, header, footer:** pill search fields, the newsletter is a honey-soft inset panel
  (`NewsletterBox` isn't used on any page at the moment), the footer is charcoal with a rounded top and 44px link rows
  on mobile.

## 5. Mobile pass (375px, checked in the browser)

- Horizontal overflow: none on home, room, guide, best, product, compare, tools, stain finder. Fixed one existing
  bug: the room hero image (`aspect-ratio: 16/3` with `min-height`) was 597px wide at 375px; `body { overflow-x:
  hidden }` was hiding it.
- Tap targets: header search and menu buttons 44px (were 40px); breadcrumbs, the evidence chip, "How we score",
  Amazon compact buttons, Save, small buttons, scenario pills and guide product links are all ≥ 44px now. Inline text
  links inside sentences are exempt, as WCAG 2.5.8 allows.
- Comparison tables keep `.table-scroll` (horizontal scroll inside the table only).

## 6. Verification

- `npx tsc --noEmit`: pass. `npm run lint`: no warnings or errors. `npm run build`: pass (all routes generated,
  including sitemap, robots, OG and all SSG pages).
- Not changed: routes, metadata, JSON-LD, canonicals, sitemap, internal links, admin/CMS, auth, middleware,
  affiliate link attributes (`rel="sponsored nofollow noopener noreferrer"`), click tracking, analytics, search
  logic, tool rules, guide and review text. No new dependencies.
- Process note: the dev server on :3100 was serving a stale Tailwind config, so it was restarted (via the `web`
  launch config) and stopped once during `npm run build`, because both write to `.next`. It's running again on :3100.

## 7. New logo (follow-up)

- Rebuilt the logo from the brand sheet (`docs/brand/logo-sheet.webp`) as inline SVG in `BrandMark.tsx`: terracotta
  roof with chimney, honey window and rays, two-color serif wordmark (forest + terracotta; cream + honey on dark).
- Added `brand.*` tokens for the logo colors. The UI palette was not shifted to them: the brand terracotta is
  3.75:1 on cream, so text keeps `terracotta-deep`.
- Footer is now forest green (the sheet's dark-mode logo surface); its small text was raised to 75% opacity to
  keep ≥ 4.5:1 on green.
- Favicon (cream tile), app/PWA icons (forest tile, regenerated PNGs), manifest background and OG image updated.
- The full lockup with the tagline and the honey swoosh is not used on the site yet (no place needs it); the
  stacked/social variants exist only in the sheet.

## 8. "Make it feel like home" pass (follow-up)

Feedback: the site was fine but not inviting; a reference mockup felt cozy mainly because of a lived-in photo
(dog next to a spilled mug in a sunny living room). Changes, homepage only:
- Hero uses the existing, previously unused `public/images/hero-dog-coffee.webp`: on desktop it fills the right
  two-thirds with a cream fade so the text stays on a plain background; on phones it's a rounded photo under the
  search, visible on the first screen. One handwritten note, "Life happens. We'll help." (Caveat, desktop only, decorative).
- Lede rewritten around everyday mishaps; H1 unchanged.
- New "Where's the mess?" row of room photo cards right under the hero (swipe row on phones). The old text room
  index lower on the page was removed to avoid duplication.
- Featured guide is a large photo card (coffee-sofa photo) with the short answer; other guides are photo cards.
- Common-mess chips and guide cards scroll sideways on phones, so the page is shorter.
- No claims added: the photos are illustrations and aren't captioned as our tests.
- Next step for more warmth: the room-card photos are tight cleaning close-ups. `docs/brand/cozy-photo-shot-list.md`
  has prompts for whole-room lifestyle shots and a 2400 px version of the hero (the current one is 1376 px).
- Screenshots: `docs/screenshots/warm-cozy-home-desktop.jpg`, `warm-cozy-home-mobile.jpg`.

## 9. Real room photos + fresher green (follow-up)

- Six new lifestyle room photos (generated by the user in ChatGPT, reviewed: no logos, text or faces) were renamed
  from Russian to `public/images/room-{bathroom,kitchen,floor-carpet,laundry,pet-hair,organization}.png` and
  converted to WebP (87–120 KB). They're now each room's `cardImage` and `heroImage` in `src/lib/seed-data.ts`
  and in the local CMS store `.data/store.json`. The old `cat-*.webp` / `bathroom-hero.webp` files are kept (unused).
- **Production note:** rooms live in the persisted CMS store. A server that already has a `.data/store.json`
  keeps the old image paths until they're changed in admin or the store is re-seeded. Bumping `STORE_VERSION` would
  re-seed but also replace any content edited in admin, so it wasn't done.
- The muted sage was replaced by a fresher leaf green: `leaf` #6FAE5C (decoration), `leaf-deep` #2D7139 (text,
  5.4:1 on cream), `leaf-soft` #E8F2E1. The logo/footer green `brand.forest` moved from #1F4D37 to a livelier
  #285E3E (cream text 7.3:1, honey 4.9:1); app icons regenerated.

## 10. Light footer (follow-up)

- Feedback: the all-green footer was too heavy. The footer is now light (`paper-warm`, rounded top, hairline
  border) with the normal-color logo and small leaf-green accents only: a short green stroke and green heading per
  link column, a leaf icon by the tagline, links that turn green on hover, a green dot by the copyright.
- On phones the link columns sit two side by side, so the footer is about a third shorter.
- Contrast: `leaf-deep` headings 5.0:1 and `ink-muted` disclosure text 5.2:1 on `paper-warm`.

## Open items

- Product image mismatch (unchanged, needs real Amazon images): `chomchom-roller-pet-hair-remover` and
  `two-tier-sliding-under-sink-organizer` use guide illustrations as product images.
- The 14 source PNGs in `public/images/` are still untracked and undecided.
- The admin portal picked up the new tokens but didn't get its own design pass.
- `docs/redesign-report.md` still describes the earlier denim palette; this report supersedes its color notes.
