# HouseCareWiki.com — Full Product Implementation (v2.0)

Independent English (US) home care encyclopedia, step-by-step cleaning guides, hands-on appliance reviews, interactive smart tools, editorial CMS, and Amazon Associates commerce platform.

**Core Philosophy:** *Solve the problem first. Recommend the product second.*

---

## 1. Implemented Subsystems (Spec v2.0 SYS-01 to SYS-14)

- **SYS-01 Public Website (`src/app/page.tsx`, `src/app/rooms/[slug]`, `src/app/best/[slug]`, `src/app/guides/[slug]`)**:
  - Visual design matching the 3-screen editorial UI specification (Warm Paper `#F7F4EE`, Forest Green `#1E3A2F`, Terracotta Coral `#E26D42`, Serif Display + Handwritten annotations).
- **SYS-02 Content Engine (`src/lib/seed-data.ts`, `src/lib/store.ts`)**:
  - Structured guides, safety warnings, step-by-step instructions, pro tips, FAQs, and primary source citations (IICRC, EPA, TCNA, AHFA).
- **SYS-03 & SYS-04 Product Catalog & Review Engine (`/products`, `/products/[slug]`, `/best/[slug]`, `/compare`)**:
  - Verified specifications, lab sub-scores, `Hands-on Tested` vs `Research-Based Review` badges, and side-by-side comparisons.
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
cd /Users/akbarkhonavazkhonov/.gemini/antigravity/scratch/housecarewiki
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 3. Deploy to the VPS (housecarewiki.com)

DNS is already pointed at the server (`housecarewiki.com` and `www` → `72.62.134.148`).

One command from this machine (asks for the root SSH password unless a key is installed):

```bash
./deploy/deploy.sh
```

What it does:
1. `rsync` the project to `/opt/housecarewiki` on the VPS (without `node_modules`, `.next`, `.data`).
2. Runs `deploy/remote-setup.sh` on the server: installs Docker + Nginx + Certbot, runs `docker compose up -d --build`,
   installs `deploy/nginx/housecarewiki.com.conf`, and issues a Let's Encrypt certificate (HTTP → HTTPS redirect).
3. Smoke-tests `http://72.62.134.148/`, `https://housecarewiki.com/` and `/sitemap.xml`.

Unattended run (password auth): `brew install sshpass` then `SSHPASS='<root password>' ./deploy/deploy.sh`.

Re-deploy after changes: run the same command again (the compose build is cached; the `.data` volume with CMS edits persists).

Manual equivalent on the server:

```bash
cd /opt/housecarewiki
docker compose up -d --build
sudo cp deploy/nginx/housecarewiki.com.conf /etc/nginx/sites-available/housecarewiki.com.conf
sudo ln -sf /etc/nginx/sites-available/housecarewiki.com.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx --redirect -d housecarewiki.com -d www.housecarewiki.com
```
# housecarewiki
