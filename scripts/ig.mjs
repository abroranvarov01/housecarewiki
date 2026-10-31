#!/usr/bin/env node
// Instagram automation CLI: talks to the site's admin API (/api/admin/instagram) with the admin login.
// Usage: npm run ig -- <command> [options]. Run `npm run ig -- help` for the list.
// Env (read from the shell, then .env.local / .env in the current folder):
//   HCW_URL         site to talk to, default http://localhost:3000 (production: https://housecarewiki.com)
//   ADMIN_USER      default admin
//   ADMIN_PASSWORD  same as on the site
//   IG_APP_SECRET   only for `webhook-test`, which signs a fake webhook like Meta does

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

for (const file of ['.env.local', '.env']) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}

const BASE = (process.env.HCW_URL || 'http://localhost:3000').replace(/\/$/, '');
const AUTH = 'Basic ' + Buffer.from(`${process.env.ADMIN_USER || 'admin'}:${process.env.ADMIN_PASSWORD || ''}`).toString('base64');

const [command, ...rest] = process.argv.slice(2);
const args = { _: [] };
for (let i = 0; i < rest.length; i++) {
  const a = rest[i];
  if (a.startsWith('--')) {
    const key = a.slice(2);
    const next = rest[i + 1];
    if (next === undefined || next.startsWith('--')) args[key] = true;
    else (args[key] = next), i++;
  } else args._.push(a);
}

function die(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

async function api(action, payload = {}) {
  const res = await fetch(`${BASE}/api/admin/instagram`, {
    method: 'POST',
    headers: { Authorization: AUTH, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload }),
  });
  const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
  if (!res.ok) die(`${action}: ${data.error || res.status}`);
  return data.result;
}

const TYPES = { '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png' };

async function upload(file) {
  if (!fs.existsSync(file)) die(`no such file: ${file}`);
  const type = TYPES[path.extname(file).toLowerCase()];
  if (!type) die(`unsupported file type: ${file}`);
  const size = fs.statSync(file).size;
  process.stdout.write(`uploading ${file} (${(size / 1e6).toFixed(1)} MB)... `);
  const res = await fetch(`${BASE}/api/admin/instagram/upload`, {
    method: 'POST',
    headers: { Authorization: AUTH, 'Content-Type': type, 'Content-Length': String(size), 'x-hcw-client': 'ig-cli' },
    body: await fs.openAsBlob(file),
  });
  const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
  if (!res.ok) die(`upload: ${data.error || res.status}`);
  console.log(data.file);
  return data.file;
}

function publishAt() {
  if (!args.at) die('--at is required, e.g. --at 2026-11-03T19:00:00-05:00');
  const d = new Date(args.at);
  if (Number.isNaN(d.getTime())) die(`bad --at date: ${args.at}`);
  if (!/(Z|[+-]\d\d:\d\d)$/.test(args.at)) die('give --at with a time zone, e.g. -05:00 for New York or Z for UTC');
  return d.toISOString();
}

const print = (x) => console.log(JSON.stringify(x, null, 2));

const commands = {
  async help() {
    console.log(`Commands (HCW_URL=${BASE}):
  status                                   settings, links with clicks, rules with counts, posts, latest comments
  whoami                                   check the token: account, token expiry, publishing quota
  subscribe [--fields comments,messages]   turn on webhooks for the account (POST /<IG_ID>/subscribed_apps)
  link <slug> --asin <ASIN> [--label ..]   add/update a /go/<slug> link to Amazon (tag added automatically)
  link <slug> --url <https://..>           same, for any other URL
  rule <rule.json>                         add/update a comment rule (see marketing/reels/12-cat-hates/automation.json)
  rule-off <key> | rule-on <key>           pause or resume a rule
  schedule --video f.mp4 [--cover c.jpg] --caption-file caption.txt --at <ISO time with zone> [--no-feed]
  reel <folder> --at <ISO time>            links + rule + schedule from <folder>/automation.json, caption.txt, reel.mp4, cover.jpg
  reschedule <post-id> --at <ISO time>     move a scheduled, failed or dry-run post
  cancel <post-id>                         cancel a scheduled post
  simulate-comment --text CAT [--user name] [--rule cat]   dry-run only: fake a comment and process it
  simulate-dm --sender <recipientId> [--text hi]           dry-run only: fake a DM reply (two-step follow-up)
  webhook-test --text CAT [--user name] [--media <id>]     dry-run: send a signed fake comment webhook (needs IG_APP_SECRET)
  tick                                     run the scheduler/token/comment pass once now`);
  },

  async status() {
    const res = await fetch(`${BASE}/api/admin/instagram`, { headers: { Authorization: AUTH } });
    if (!res.ok) die(`status: HTTP ${res.status}`);
    const d = await res.json();
    const s = d.settings;
    console.log(`mode: ${s.dryRun ? 'DRY RUN' : 'LIVE'} · account: ${s.account?.username ? '@' + s.account.username : 'not connected'} · token expires ${s.account?.expiresAt ?? '-'}`);
    console.log(`two-step DM: ${s.twoStepDm} · polling: ${s.pollComments} · test users: ${s.testUsernames.join(', ') || 'everyone'} · webhook secrets: ${s.webhookConfigured} · cron: ${s.cronConfigured}`);
    console.log('\nlinks');
    for (const l of d.links) console.log(`  ${l.shortUrl.padEnd(44)} clicks ${l.clicks} (24h ${l.clicks24h}, 7d ${l.clicks7d}) bots ${l.botHits} ${JSON.stringify(l.bySource)}`);
    console.log('\nrules');
    for (const r of d.rules)
      console.log(`  ${r.key.padEnd(12)} "${r.keyword}" post ${r.mediaId ?? (r.scheduledPostId ? 'pending' : 'any')} · matched ${r.matched} · DMs ${r.dmsSent} (dry-run ${r.dmsDryRun}) · follow-ups ${r.followUps} · failed ${r.failed} · clicks ${r.clicks}${r.isActive ? '' : ' · OFF'}`);
    console.log('\nposts');
    for (const p of d.posts) console.log(`  ${p.id} ${p.publishAt} ${p.status}${p.permalink ? ' ' + p.permalink : ''}${p.lastError ? '\n      ' + p.lastError.slice(0, 200) : ''}`);
    console.log('\nlatest comments');
    for (const e of d.recent.slice(0, 10))
      console.log(`  ${e.receivedAt} @${e.username}: ${JSON.stringify(e.text)} → ${e.status}${e.skipReason ? ' (' + e.skipReason + ')' : ''}${e.rule ? ' rule ' + e.rule : ''}${e.dryRun ? ' [dry-run]' : ''}`);
  },

  whoami: async () => print(await api('WHOAMI')),
  subscribe: async () => print(await api('SUBSCRIBE', { fields: typeof args.fields === 'string' ? args.fields : undefined })),
  tick: async () => print(await api('TICK')),

  async link() {
    const slug = args._[0] || die('link <slug> --asin <ASIN>');
    print(await api('UPSERT_LINK', { slug, asin: args.asin, url: args.url, label: args.label }));
  },

  async rule() {
    const file = args._[0] || die('rule <rule.json>');
    const rule = JSON.parse(fs.readFileSync(file, 'utf8'));
    print(await api('UPSERT_RULE', rule.rule ?? rule));
  },
  'rule-off': async () => print(await api('SET_RULE_ACTIVE', { key: args._[0], isActive: false })),
  'rule-on': async () => print(await api('SET_RULE_ACTIVE', { key: args._[0], isActive: true })),

  async schedule() {
    if (!args.video || !args['caption-file']) die('schedule needs --video and --caption-file');
    const at = publishAt();
    const caption = fs.readFileSync(args['caption-file'], 'utf8');
    const videoFile = await upload(args.video);
    const coverFile = args.cover ? await upload(args.cover) : undefined;
    print(await api('SCHEDULE_POST', { videoFile, coverFile, caption, publishAt: at, shareToFeed: !args['no-feed'] }));
  },

  async reel() {
    const dir = args._[0] || die('reel <folder> --at <ISO time>');
    const at = publishAt();
    const config = JSON.parse(fs.readFileSync(path.join(dir, 'automation.json'), 'utf8'));
    for (const l of config.links || []) {
      const link = await api('UPSERT_LINK', l);
      console.log(`link ${link.shortUrl} → ${l.asin ? 'Amazon ' + l.asin : l.url}`);
    }
    const caption = fs.readFileSync(path.join(dir, 'caption.txt'), 'utf8');
    const videoFile = await upload(path.join(dir, config.video || 'reel.mp4'));
    const cover = path.join(dir, config.cover || 'cover.jpg');
    const coverFile = fs.existsSync(cover) ? await upload(cover) : undefined;
    const post = await api('SCHEDULE_POST', { videoFile, coverFile, caption, publishAt: at, shareToFeed: config.shareToFeed !== false });
    console.log(`scheduled post ${post.id} for ${post.publishAt}`);
    if (config.rule) {
      const rule = await api('UPSERT_RULE', { ...config.rule, scheduledPostId: post.id });
      console.log(`rule "${rule.key}" (keyword ${rule.keyword}) starts matching once the post is published`);
    }
  },

  reschedule: async () => print(await api('RESCHEDULE_POST', { id: args._[0], publishAt: publishAt() })),
  cancel: async () => print(await api('CANCEL_POST', { id: args._[0] })),

  async 'simulate-comment'() {
    print(await api('SIMULATE_COMMENT', { text: args.text, username: args.user, ruleKey: args.rule, mediaId: args.media }));
  },
  async 'simulate-dm'() {
    print(await api('SIMULATE_MESSAGE', { senderId: args.sender, text: args.text }));
  },

  async 'webhook-test'() {
    const secret = process.env.IG_APP_SECRET || die('IG_APP_SECRET is needed to sign the test webhook');
    const id = `test-${Date.now()}`;
    const body = JSON.stringify({
      object: 'instagram',
      entry: [
        {
          id: process.env.IG_USER_ID || 'test-account',
          time: Math.floor(Date.now() / 1000),
          changes: [
            {
              field: 'comments',
              value: {
                id,
                from: { id: `test-user-${args.user || 'tester'}`, username: args.user || 'tester' },
                media: { id: args.media || 'test-media', media_product_type: 'REELS' },
                text: args.text || 'CAT',
              },
            },
          ],
        },
      ],
    });
    const signature = 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex');
    const res = await fetch(`${BASE}/api/instagram/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Hub-Signature-256': signature },
      body,
    });
    console.log(res.status, await res.text());
  },
};

const run = commands[command || 'help'];
if (!run) die(`unknown command "${command}". Try: npm run ig -- help`);
await run();
