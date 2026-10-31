import crypto from 'crypto';
import { db } from '../db';
import { igConfig } from './config';
import { GraphClient, refreshLongLivedToken } from './graph';

// The long-lived token starts in IG_ACCESS_TOKEN. Env cannot be rewritten at runtime, so refreshed tokens
// live in the IgCredential row; pasting a new token into env replaces that row on the next read.

const DAY = 24 * 60 * 60 * 1000;
// Refresh once the token is a day old (Meta's minimum) and has less than this left of its 60 days.
const REFRESH_WHEN_LEFT_MS = 45 * DAY;

const hash = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

export async function getCredential() {
  const cfg = igConfig();
  const existing = await db.igCredential.findUnique({ where: { id: 'main' } });
  if (!cfg.accessToken) return existing;
  const envHash = hash(cfg.accessToken);
  if (existing && existing.envTokenHash === envHash) return existing;
  // New token in env: assume it was just issued (60 days) until Meta tells us otherwise on refresh.
  return db.igCredential.upsert({
    where: { id: 'main' },
    create: { accessToken: cfg.accessToken, envTokenHash: envHash, expiresAt: new Date(Date.now() + 60 * DAY) },
    update: {
      accessToken: cfg.accessToken,
      envTokenHash: envHash,
      issuedAt: new Date(),
      refreshedAt: null,
      expiresAt: new Date(Date.now() + 60 * DAY),
      igUserId: null,
      username: null,
      lastError: null,
    },
  });
}

// Client plus our account ID and username, which come from GET /me the first time and are cached.
export async function getAccount() {
  const cfg = igConfig();
  let cred = await getCredential();
  if (!cred) return null;
  const client = new GraphClient(cfg, cred.accessToken);
  if (!cred.igUserId || !cred.username) {
    const me = await client.me();
    cred = await db.igCredential.update({
      where: { id: 'main' },
      data: { igUserId: cfg.igUserId || me.user_id || me.id, username: me.username },
    });
  }
  return { client, igUserId: cfg.igUserId || cred.igUserId!, username: cred.username || '' };
}

export async function refreshTokenIfDue(now = new Date()): Promise<string> {
  const cred = await getCredential();
  if (!cred) return 'no token';
  const age = now.getTime() - (cred.refreshedAt ?? cred.issuedAt).getTime();
  const left = cred.expiresAt ? cred.expiresAt.getTime() - now.getTime() : 0;
  if (age < DAY || left > REFRESH_WHEN_LEFT_MS) return `not due (expires ${cred.expiresAt?.toISOString() ?? 'unknown'})`;
  try {
    const fresh = await refreshLongLivedToken(cred.accessToken);
    await db.igCredential.update({
      where: { id: 'main' },
      data: {
        accessToken: fresh.access_token,
        refreshedAt: now,
        expiresAt: new Date(now.getTime() + (fresh.expires_in || 60 * 24 * 3600) * 1000),
        lastError: null,
      },
    });
    return 'refreshed';
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await db.igCredential.update({ where: { id: 'main' }, data: { lastError: `refresh: ${message}`.slice(0, 500) } });
    return `refresh failed: ${message}`;
  }
}
