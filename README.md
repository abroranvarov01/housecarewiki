# HouseCareWiki.com — Full Product Implementation (v2.0)

Independent English (US) home care guide: step-by-step cleaning guides, research-based product reviews (clearly labeled; no hands-on testing claims), interactive tools, editorial CMS and Amazon Associates links.

Design system: [docs/design-system.md](docs/design-system.md). Latest overhaul and audit: [docs/redesign-report.md](docs/redesign-report.md).

**Core Philosophy:** *Solve the problem first. Recommend the product second.*

---

## 1. Implemented Subsystems (Spec v2.0 SYS-01 to SYS-14)

- **SYS-01 Public Website (`src/app/page.tsx`, `src/app/rooms/[slug]`, `src/app/best/[slug]`, `src/app/guides/[slug]`)**:
  - "Modern Home Field Guide" design system (paper, ink, denim, marker yellow, brick; Newsreader + Schibsted Grotesk + IBM Plex Mono). See docs/design-system.md.
- **SYS-02 Content Engine (`src/lib/seed-data.ts`, `src/lib/store.ts`)**:
  - Structured guides, safety warnings, step-by-step instructions, pro tips, FAQs, and primary source citations (IICRC, EPA, TCNA, AHFA).
- **SYS-03 & SYS-04 Product Catalog & Review Engine (`/products`, `/products/[slug]`, `/best/[slug]`, `/compare`)**:
  - Manufacturer specifications, research-based ratings, evidence labels (`Research-Based Review` until a product is actually tested), and side-by-side comparisons.
- **SYS-05 Six Interactive Smart Tools (`/tools/*`, `/compare`)**:
  1. **Stain Solution Finder** (`/tools/stain-finder`)
  2. **Cleaning Equipment Finder** (`/tools/equipment-finder`)
  3. **Product Comparison Builder** (`/compare`)
  4. **Cleaning Routine Planner** (`/tools/routine-planner`)
  5. **Cleaning Cost Calculator** (`/tools/cost-calculator`)
  6. **Surface Compatibility Checker** (`/tools/surface-checker`)
- **SYS-06 Full-Text Search Engine (`/search`, `/api/search`)**:
  - Synonym expansion (`couch ↔ sofa`, `dog ↔ pet`, `rug ↔ carpet`), category filtering, and trending queries.
- **SYS-07 User Workspace (`/account`)**:
  - Local bookmarking for articles and products, one-click JSON personal data export, and instant data deletion.
- **SYS-08 to SYS-14 Editorial Admin CMS, SEO, AI Assistant & Operations (`/admin`)**:
  - 11-stage editorial workflow (`Idea → ... → Published`), AI Research & Chemical Safety Guardrails, 12-point SEO Audit, 301 Redirect Manager, Live Affiliate Click Attribution, and Background Job controls.

---

## 2. Quick Local Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 3. SEO & Operations Notes

- **Site config:** `src/lib/site.ts` is the single source for URL, name, locale and contacts. Metadata (`src/lib/seo.ts` → `buildMetadata`) and JSON-LD (`src/lib/schema.ts`) read only from it.
- **Content validation:** `npm run validate:content` runs automatically before every build and fails it on missing fields, duplicate titles/intents, broken product references or missing images.
- **Images:** put new photos in `public/images` and run `npm run optimize:images` (needs `sharp`) to create compressed WebP files and app icons.
- **Admin:** `/admin` uses HTTP Basic auth, checked in the middleware and again by the page and API (`src/lib/admin-auth.ts`) (`ADMIN_USER`, default `admin`, and `ADMIN_PASSWORD` from `.env`). Without `ADMIN_PASSWORD` the admin area stays closed.
- **Sitemap:** `/sitemap.xml` (with image entries) is generated from content data; lastmod is the newest content date behind each URL.
