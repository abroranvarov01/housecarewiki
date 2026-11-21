# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

US adults dealing with a specific home-care problem right now: a fresh coffee spill on the sofa, dog hair on
everything, grimy grout, a cast-iron pan that went through the dishwasher. Most arrive from a Google search on a
phone, mid-problem, wanting the safe fix in the first screen. A smaller group arrives while choosing a cleaning
product type (carpet cleaner, spin scrubber, steam mop) and wants to know what matters before buying.

## Product Purpose

HouseCareWiki (housecarewiki.com) is an independent English (US) home-care publication: step-by-step cleaning and
stain guides, surface-safety guidance, six free interactive tools, and research-based product reviews with Amazon
Associates links. Success: the visitor fixes the problem without damaging the surface, trusts the site enough to
come back, and, when a product helps, buys through our link.

Core philosophy: solve the problem first, recommend the product second.

## Positioning

Every page says exactly what it is based on: manufacturer specs, manuals, published standards (IICRC, EPA, TCNA,
AHFA, CPSC). No pretend testing. The answer comes first, with the mistake to avoid and the surface-safety check,
before any product.

## Operating Context

- Next.js 14 app (App Router, Tailwind), Docker on a VPS behind nginx; content in `src/lib/seed-data.ts`, served
  from a JSON store. ~200 published guides, indexed by Google; URLs must not change.
- Routes: `/guides/*`, `/best/*`, `/products/*`, `/compare/*`, `/rooms/*`, `/surfaces/*`, `/tools/*`, `/search`,
  `/account` (local bookmarks), trust pages (`/about`, `/methodology`, `/editorial-policy`, `/affiliate-disclosure`,
  `/privacy`, `/terms`), `/admin` CMS.
- Sister sites (Drivovio, Campovio, TrainVoya, GlossVoya) run the same editorial rules on a separate codebase and
  must not look like HouseCareWiki.
- Instagram Reels marketing uses the HouseCareWiki name.

## Capabilities and Constraints

- Six tools: Stain Solution Finder, Surface Compatibility Checker, Cleaning Equipment Finder, Cleaning Routine
  Planner, Cleaning Cost Calculator, Product Comparison Builder.
- Full-text search with synonyms; local bookmarks with export/delete; cookie consent gates GTM analytics.
- Static photos in `public/images` (warm lifestyle photos: rooms, pets, stains, tools).

## Brand Commitments

- Name stays **HouseCareWiki** (one word) and the domain stays housecarewiki.com (confirmed by the owner,
  2026-11-20).
- The warm editorial identity stays (cream paper, warm lifestyle photos). On 2026-11-21 the owner rejected a
  replacement visual world and asked for a noticeable refresh of this one instead: the "Peach & Teal" palette
  (cream, teal, coral, peach) and the soap-bubble logo.
- Byline: "HouseCareWiki Editors". No personas, no stock portraits.
- Voice: plain, specific, friendly, short sentences. "Blot, don't rub" over "Unlock a spotless home". No marketing
  filler.

## Evidence on Hand

- Real content: guides with steps, warnings, FAQs and source citations; product spec data; tool logic.
- Absent and never to be invented: hands-on testing, lab measurements, user counts, testimonials, star ratings,
  review counts, prices, "verified" claims.

## Product Principles

1. The answer before the product.
2. Say what every claim is based on; never imply testing.
3. Surface safety is part of the answer, not a footnote.
4. A mid-problem visitor on a phone finds the fix within one screen.

## Accessibility & Inclusion

WCAG 2.2 AA: text contrast, visible focus, 44px targets, skip link, reduced motion respected.
