import React from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { checkAdminAuth } from '@/lib/admin-auth';
import { overview } from '@/lib/instagram/admin';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Instagram automation | HouseCareWiki',
  robots: { index: false, follow: false },
};

// Read-only status page. Changes go through scripts/ig.mjs (see docs/instagram-automation.md).

const card = 'rounded-sm border border-rule bg-paper-card p-5 sm:p-6 overflow-x-auto';
const h2 = 'font-serif text-xl font-semibold text-ink mb-3';
const th = 'border-b border-rule py-2 pr-4 text-xs font-semibold text-ink-secondary whitespace-nowrap';
const td = 'border-b border-rule/60 py-2 pr-4 align-top';

const when = (d: Date | string | null | undefined) => (d ? new Date(d).toISOString().replace('T', ' ').slice(0, 16) + ' UTC' : '—');

export default async function InstagramAdminPage() {
  if (checkAdminAuth(headers().get('authorization')) !== 'ok') notFound();
  let data: Awaited<ReturnType<typeof overview>>;
  try {
    data = await overview();
  } catch (e) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="font-serif text-2xl font-semibold">Instagram automation</h1>
        <p className="mt-4 text-sm">Database is not reachable: {e instanceof Error ? e.message : String(e)}</p>
      </div>
    );
  }
  const { settings, posts, rules, links, recent } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-sm">
      <div className="bg-ink text-paper-light rounded-sm p-6">
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold">Instagram automation</h1>
        <p className="mt-2 text-xs text-paper-light/80">
          {settings.dryRun ? 'DRY RUN: nothing is published or sent, actions are only logged.' : 'LIVE: replies, DMs and posts go to Instagram.'}{' '}
          Account: {settings.account?.username ? `@${settings.account.username}` : 'not connected'} · token expires{' '}
          {when(settings.account?.expiresAt)} · two-step DM {settings.twoStepDm ? 'on' : 'off'} · comment polling{' '}
          {settings.pollComments ? 'on' : 'off'} · test users {settings.testUsernames.length ? settings.testUsernames.join(', ') : 'none (everyone)'}
          {settings.account?.lastError ? ` · token error: ${settings.account.lastError}` : ''}
        </p>
      </div>

      <section className={card}>
        <h2 className={h2}>Links (/go)</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              {['Short link', 'Goes to', 'Clicks', '24 h', '7 days', 'By source', 'Bot hits'].map((h) => (
                <th key={h} className={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {links.map((l) => (
              <tr key={l.id}>
                <td className={td}><code>{l.shortUrl}</code><div className="text-ink-secondary">{l.label}</div></td>
                <td className={td}>{l.asin ? `Amazon ${l.asin}` : l.url}</td>
                <td className={`${td} font-semibold`}>{l.clicks}</td>
                <td className={td}>{l.clicks24h}</td>
                <td className={td}>{l.clicks7d}</td>
                <td className={td}>{Object.entries(l.bySource).map(([k, v]) => `${k}: ${v}`).join(', ') || '—'}</td>
                <td className={td}>{l.botHits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={card}>
        <h2 className={h2}>Comment rules</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              {['Rule', 'Keyword', 'Post', 'Matched', 'DMs sent', 'Dry-run DMs', 'Follow-ups', 'Failed', 'Link clicks'].map((h) => (
                <th key={h} className={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id} className={r.isActive ? '' : 'opacity-50'}>
                <td className={td}><strong>{r.key}</strong>{r.isActive ? '' : ' (off)'}</td>
                <td className={td}>{r.keyword} <span className="text-ink-secondary">({r.matchMode})</span></td>
                <td className={td}>{r.mediaId ?? (r.scheduledPostId ? 'waits for scheduled post' : 'any post')}</td>
                <td className={td}>{r.matched}</td>
                <td className={`${td} font-semibold`}>{r.dmsSent}</td>
                <td className={td}>{r.dmsDryRun}</td>
                <td className={td}>{r.followUps}</td>
                <td className={td}>{r.failed}</td>
                <td className={`${td} font-semibold`}>{r.clicks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={card}>
        <h2 className={h2}>Scheduled reels</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              {['Publish at', 'Status', 'Caption', 'Media', 'Note'].map((h) => (
                <th key={h} className={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id}>
                <td className={`${td} whitespace-nowrap`}>{when(p.publishAt)}</td>
                <td className={`${td} font-semibold`}>{p.status}</td>
                <td className={td}>{p.caption.slice(0, 80)}{p.caption.length > 80 ? '…' : ''}</td>
                <td className={td}>{p.permalink ? <a className="underline" href={p.permalink}>{p.mediaId}</a> : <a className="underline" href={p.videoUrl}>video</a>}</td>
                <td className={`${td} text-ink-secondary break-all`}>{p.lastError?.slice(0, 300) ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={card}>
        <h2 className={h2}>Latest comments</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              {['Received', 'From', 'Comment', 'Result', 'Public reply', 'DM'].map((h) => (
                <th key={h} className={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.map((e, i) => (
              <tr key={i}>
                <td className={`${td} whitespace-nowrap`}>{when(e.receivedAt)}<div className="text-ink-secondary">{e.source}</div></td>
                <td className={td}>@{e.username}</td>
                <td className={td}>{e.text}</td>
                <td className={td}>
                  {e.status}{e.skipReason ? ` (${e.skipReason})` : ''}{e.rule ? ` · ${e.rule}` : ''}{e.dryRun ? ' · dry-run' : ''}
                  {e.followUpSentAt ? ' · follow-up sent' : ''}
                  {e.lastError ? <div className="text-terracotta-deep">{e.lastError}</div> : null}
                </td>
                <td className={td}>{e.publicReply ?? '—'}</td>
                <td className={`${td} whitespace-pre-wrap`}>{e.dm ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
