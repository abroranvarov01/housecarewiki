#!/usr/bin/env node
// Pings IndexNow (Bing, Yandex, Seznam, Naver...) with every URL in the live sitemap, so changed pages
// are recrawled within minutes instead of days. Google does not use IndexNow; it reads the sitemap.
// Run after a deploy:  node scripts/indexnow.cjs   (deploy/deploy.sh does this; INDEXNOW=0 skips it)
// The key file public/4154d4c6dd616ddb2a053efff8114ea6.txt proves we own the host.

const HOST = process.env.DOMAIN || 'housecarewiki.com';
const KEY = '4154d4c6dd616ddb2a053efff8114ea6';

async function main() {
  const res = await fetch(`https://${HOST}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml: HTTP ${res.status}`);
  const xml = await res.text();
  const urlList = [...xml.matchAll(/<url><loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&'));
  if (!urlList.length) throw new Error('sitemap.xml has no URLs');

  const ping = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
  });
  // 200 = accepted, 202 = accepted, key validation pending.
  console.log(`IndexNow: submitted ${urlList.length} URLs -> HTTP ${ping.status}`);
  if (ping.status >= 400) process.exitCode = 1;
}

main().catch((err) => {
  console.error(`IndexNow failed: ${err.message}`);
  process.exitCode = 1;
});
