#!/usr/bin/env node
// Pings IndexNow (Bing, Yandex, Seznam, Naver...) with the pages that are new, changed or removed since the
// last confirmed submission, so they are recrawled within minutes instead of days. Google does not use
// IndexNow; it reads the sitemap.
//
//   npm run indexnow               after a deploy: only what changed
//   npm run indexnow -- --dry-run  print the plan, send nothing, keep state
//   npm run indexnow -- --all      resubmit every sitemap URL (e.g. after a site-wide template change)
//
// A page's fingerprint is its sitemap <lastmod>, which the content model only bumps on substantive edits, so
// unchanged pages are never resubmitted (search engines discount sites that ping everything on every deploy).
// State lives in .data/indexnow-state.json and a page is marked sent only after HTTP 200/202, so an
// interrupted or failed run is simply repeated next time.
// The key file public/4154d4c6dd616ddb2a053efff8114ea6.txt proves we own the host.

const fs = require('fs');
const path = require('path');

const HOST = process.env.DOMAIN || 'housecarewiki.com';
const KEY = '4154d4c6dd616ddb2a053efff8114ea6';
const STATE_FILE = path.join(__dirname, '..', '.data', 'indexnow-state.json');
const BATCH = 10000; // IndexNow limit per request

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const all = args.has('--all');

function loadState() {
  try {
    return { pages: {}, history: [], ...JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8')) };
  } catch {
    return { pages: {}, history: [] };
  }
}

function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);
}

async function sitemapPages() {
  const res = await fetch(`https://${HOST}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml: HTTP ${res.status}`);
  const xml = await res.text();
  const pages = new Map();
  for (const [, block] of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = /<loc>([^<]+)<\/loc>/.exec(block);
    if (!loc) continue;
    const lastmod = /<lastmod>([^<]+)<\/lastmod>/.exec(block);
    pages.set(loc[1].replace(/&amp;/g, '&'), lastmod ? lastmod[1] : 'static');
  }
  if (!pages.size) throw new Error('sitemap.xml has no URLs');
  return pages;
}

function plan(pages, state) {
  const out = { new: [], changed: [], deleted: [], unchanged: 0 };
  for (const [url, hash] of pages) {
    const known = state.pages[url];
    if (!all && known === hash) out.unchanged += 1;
    else out[known === undefined ? 'new' : 'changed'].push(url);
  }
  for (const url of Object.keys(state.pages)) if (!pages.has(url)) out.deleted.push(url);
  return out;
}

async function submit(urlList) {
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
  });
  return res.status;
}

async function main() {
  const pages = await sitemapPages();
  const state = loadState();
  const p = plan(pages, state);
  const urls = [...p.new, ...p.changed, ...p.deleted];
  console.log(
    `IndexNow plan: ${p.new.length} new, ${p.changed.length} changed, ${p.deleted.length} removed, ${p.unchanged} unchanged`,
  );
  for (const url of urls) console.log(`  ${url}`);
  if (dryRun || !urls.length) return;

  let failed = false;
  for (let i = 0; i < urls.length; i += BATCH) {
    const batch = urls.slice(i, i + BATCH);
    const status = await submit(batch);
    // 200 = accepted, 202 = accepted, key validation pending. Anything else: leave unsent for the next run.
    console.log(`IndexNow: submitted ${batch.length} URLs -> HTTP ${status}`);
    if (status !== 200 && status !== 202) {
      failed = true;
      continue;
    }
    for (const url of batch) {
      if (pages.has(url)) state.pages[url] = pages.get(url);
      else delete state.pages[url];
    }
  }
  state.history = [
    { at: new Date().toISOString(), new: p.new.length, changed: p.changed.length, deleted: p.deleted.length, ok: !failed },
    ...state.history,
  ].slice(0, 50);
  saveState(state);
  if (failed) process.exitCode = 1;
}

main().catch((err) => {
  console.error(`IndexNow failed: ${err.message}`);
  process.exitCode = 1;
});
