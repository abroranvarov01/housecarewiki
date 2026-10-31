import fs from 'fs';
import path from 'path';
import { db } from '../db';
import { isValidSlug, shortLinkUrl } from '../links';
import { igConfig } from './config';
import { handleInboundMessages, ingestComments, processPendingComments } from './processor';
import { mediaUrl } from './publisher';
import { linkSlugsIn, validateRuleInput } from './rules';
import { runTick } from './tick';
import { getAccount, getCredential } from './token';

// Data and actions behind /admin/instagram and POST /api/admin/instagram (used by scripts/ig.mjs).

const DAY = 24 * 60 * 60 * 1000;

export class AdminInputError extends Error {}

const s = (v: unknown, max = 5000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export async function overview() {
  const cfg = igConfig();
  const cred = await getCredential().catch(() => null);
  const since24h = new Date(Date.now() - DAY);
  const since7d = new Date(Date.now() - 7 * DAY);

  const [posts, rules, links, recent, ruleCounts, ruleClicks, linkClicks, linkClicks24h, linkClicks7d, bySource] = await Promise.all([
    db.igScheduledPost.findMany({ orderBy: { publishAt: 'desc' }, take: 50 }),
    db.igRule.findMany({ orderBy: { createdAt: 'asc' } }),
    db.shortLink.findMany({ orderBy: { createdAt: 'asc' } }),
    db.igCommentEvent.findMany({ orderBy: { receivedAt: 'desc' }, take: 30, include: { rule: { select: { key: true } } } }),
    db.igCommentEvent.groupBy({ by: ['ruleId', 'status', 'dryRun'], _count: { _all: true }, where: { ruleId: { not: null } } }),
    db.linkClick.groupBy({ by: ['ruleId'], _count: { _all: true }, where: { isBot: false, ruleId: { not: null } } }),
    db.linkClick.groupBy({ by: ['linkId', 'isBot'], _count: { _all: true } }),
    db.linkClick.groupBy({ by: ['linkId'], _count: { _all: true }, where: { isBot: false, createdAt: { gte: since24h } } }),
    db.linkClick.groupBy({ by: ['linkId'], _count: { _all: true }, where: { isBot: false, createdAt: { gte: since7d } } }),
    db.linkClick.groupBy({ by: ['linkId', 'source'], _count: { _all: true }, where: { isBot: false } }),
  ]);
  const followUps = await db.igCommentEvent.groupBy({ by: ['ruleId'], _count: { _all: true }, where: { followUpSentAt: { not: null } } });

  const count = <T extends { _count: { _all: number } }>(rows: T[], pred: (r: T) => boolean) =>
    rows.filter(pred).reduce((n, r) => n + r._count._all, 0);

  return {
    settings: {
      dryRun: cfg.dryRun,
      twoStepDm: cfg.twoStepDm,
      pollComments: cfg.pollComments,
      testUsernames: cfg.testUsernames,
      webhookConfigured: Boolean(cfg.verifyToken && cfg.appSecrets.length),
      cronConfigured: Boolean(cfg.cronSecret),
      account: cred
        ? { username: cred.username, igUserId: cred.igUserId, expiresAt: cred.expiresAt, refreshedAt: cred.refreshedAt, lastError: cred.lastError }
        : null,
    },
    posts: posts.map((p) => ({ ...p, videoUrl: mediaUrl(p.videoFile) })),
    rules: rules.map((r) => ({
      ...r,
      matched: count(ruleCounts, (c) => c.ruleId === r.id),
      dmsSent: count(ruleCounts, (c) => c.ruleId === r.id && c.status === 'REPLIED' && !c.dryRun),
      dmsDryRun: count(ruleCounts, (c) => c.ruleId === r.id && c.status === 'REPLIED' && c.dryRun),
      failed: count(ruleCounts, (c) => c.ruleId === r.id && c.status === 'FAILED'),
      followUps: count(followUps, (c) => c.ruleId === r.id),
      clicks: count(ruleClicks, (c) => c.ruleId === r.id),
    })),
    links: links.map((l) => ({
      ...l,
      shortUrl: shortLinkUrl(l.slug),
      clicks: count(linkClicks, (c) => c.linkId === l.id && !c.isBot),
      botHits: count(linkClicks, (c) => c.linkId === l.id && c.isBot),
      clicks24h: count(linkClicks24h, (c) => c.linkId === l.id),
      clicks7d: count(linkClicks7d, (c) => c.linkId === l.id),
      bySource: Object.fromEntries(bySource.filter((c) => c.linkId === l.id).map((c) => [c.source ?? '(none)', c._count._all])),
    })),
    recent: recent.map((e) => ({
      receivedAt: e.receivedAt,
      source: e.source,
      username: e.fromUsername,
      text: e.text,
      status: e.status,
      skipReason: e.skipReason,
      rule: e.rule?.key ?? null,
      dryRun: e.dryRun,
      publicReply: e.publicReplyText,
      dm: e.dmSentText,
      followUpSentAt: e.followUpSentAt,
      lastError: e.lastError,
    })),
  };
}

function captionErrors(caption: string): string[] {
  const errors: string[] = [];
  if (caption.length > 2200) errors.push(`caption is ${caption.length} characters; Instagram allows 2200`);
  if ((caption.match(new RegExp('#[\\p{L}\\p{N}_]+', 'gu')) || []).length > 30) errors.push('caption has more than 30 hashtags');
  if ((caption.match(/@[\w.]+/g) || []).length > 20) errors.push('caption has more than 20 @ tags');
  return errors;
}

function requireDryRun(what: string) {
  if (!igConfig().dryRun) throw new AdminInputError(`${what} only works with IG_DRY_RUN on (it would call Instagram with fake IDs)`);
}

export async function runAction(action: string, p: Record<string, unknown>): Promise<unknown> {
  const cfg = igConfig();
  switch (action) {
    case 'UPSERT_LINK': {
      const slug = s(p.slug, 48).toLowerCase();
      const asin = s(p.asin, 10).toUpperCase() || null;
      const url = s(p.url, 1000) || null;
      if (!isValidSlug(slug)) throw new AdminInputError('slug: a-z 0-9 -, up to 48 characters');
      if (!asin === !url) throw new AdminInputError('give exactly one of asin or url');
      if (asin && !/^[A-Z0-9]{10}$/.test(asin)) throw new AdminInputError('asin must be 10 letters/digits');
      if (url && !/^https:\/\//.test(url)) throw new AdminInputError('url must start with https://');
      const data = { label: s(p.label, 120) || slug, asin, url, isActive: p.isActive !== false };
      const link = await db.shortLink.upsert({ where: { slug }, create: { slug, ...data }, update: data });
      return { ...link, shortUrl: shortLinkUrl(slug) };
    }

    case 'UPSERT_RULE': {
      const errors = validateRuleInput(p);
      if (errors.length) throw new AdminInputError(errors.join('; '));
      const linkText = s(p.linkText);
      const dmText = s(p.dmText);
      const slugs = [...linkSlugsIn(linkText), ...linkSlugsIn(dmText)];
      const known = new Set((await db.shortLink.findMany({ where: { slug: { in: slugs } }, select: { slug: true } })).map((l) => l.slug));
      const missing = slugs.filter((x) => !known.has(x));
      if (missing.length) throw new AdminInputError(`unknown short links: ${missing.join(', ')} (add them with UPSERT_LINK first)`);
      const scheduledPostId = s(p.scheduledPostId, 36) || null;
      let mediaId = s(p.mediaId, 40) || null;
      if (scheduledPostId) {
        const post = await db.igScheduledPost.findUnique({ where: { id: scheduledPostId } });
        if (!post) throw new AdminInputError('scheduledPostId not found');
        mediaId = post.mediaId ?? mediaId;
      }
      const key = s(p.key, 32);
      const data = {
        keyword: s(p.keyword, 60),
        matchMode: s(p.matchMode, 10) || 'word',
        mediaId,
        scheduledPostId,
        publicReplies: (Array.isArray(p.publicReplies) ? p.publicReplies : []).map((r) => s(r, 300)).filter(Boolean),
        dmText,
        dmButton: s(p.dmButton, 20) || null,
        linkText,
        isActive: p.isActive !== false,
      };
      return db.igRule.upsert({ where: { key }, create: { key, ...data }, update: data });
    }

    case 'SET_RULE_ACTIVE': {
      return db.igRule.update({ where: { key: s(p.key, 32) }, data: { isActive: p.isActive === true } });
    }

    case 'SCHEDULE_POST': {
      const videoFile = s(p.videoFile, 60);
      const coverFile = s(p.coverFile, 60) || null;
      for (const f of [videoFile, coverFile].filter(Boolean) as string[]) {
        if (!/^[0-9a-f-]{36}\.\w+$/.test(f) || !fs.existsSync(path.join(cfg.mediaDir, f))) throw new AdminInputError(`file not uploaded: ${f}`);
      }
      const caption = typeof p.caption === 'string' ? p.caption.trim() : '';
      const publishAt = new Date(s(p.publishAt, 40));
      const errors = captionErrors(caption);
      if (!videoFile) errors.push('videoFile is required');
      if (Number.isNaN(publishAt.getTime())) errors.push('publishAt must be an ISO date, e.g. 2026-11-03T19:00:00-05:00');
      if (errors.length) throw new AdminInputError(errors.join('; '));
      return db.igScheduledPost.create({ data: { videoFile, coverFile, caption, publishAt, shareToFeed: p.shareToFeed !== false } });
    }

    case 'RESCHEDULE_POST': {
      const publishAt = new Date(s(p.publishAt, 40));
      if (Number.isNaN(publishAt.getTime())) throw new AdminInputError('publishAt must be an ISO date');
      const post = await db.igScheduledPost.findUnique({ where: { id: s(p.id, 36) } });
      if (!post) throw new AdminInputError('post not found');
      if (['PUBLISHED', 'PROCESSING'].includes(post.status)) throw new AdminInputError(`post is ${post.status}`);
      return db.igScheduledPost.update({ where: { id: post.id }, data: { publishAt, status: 'SCHEDULED', attempts: 0, lastError: null } });
    }

    case 'CANCEL_POST': {
      const updated = await db.igScheduledPost.updateMany({ where: { id: s(p.id, 36), status: 'SCHEDULED' }, data: { status: 'CANCELLED' } });
      if (updated.count === 0) throw new AdminInputError('no scheduled post with that id');
      return { cancelled: true };
    }

    case 'SIMULATE_COMMENT': {
      requireDryRun('SIMULATE_COMMENT');
      const rule = p.ruleKey ? await db.igRule.findUnique({ where: { key: s(p.ruleKey, 32) } }) : null;
      const username = s(p.username, 64) || 'test_user';
      const commentId = `sim-${Date.now()}`;
      await ingestComments(
        [
          {
            accountId: 'simulate',
            commentId,
            mediaId: s(p.mediaId, 40) || rule?.mediaId || 'sim-media',
            fromId: s(p.fromId, 40) || `sim-user-${username}`,
            fromUsername: username,
            text: s(p.text, 2200) || 'CAT',
            parentId: null,
            createdAt: new Date(),
          },
        ],
        'simulate'
      );
      const result = await processPendingComments();
      const ev = await db.igCommentEvent.findUnique({ where: { commentId } });
      return { result, event: ev };
    }

    case 'SIMULATE_MESSAGE': {
      requireDryRun('SIMULATE_MESSAGE');
      const senderId = s(p.senderId, 60);
      if (!senderId) throw new AdminInputError('senderId is required (the recipientId shown on the simulated comment)');
      return handleInboundMessages([
        { accountId: 'simulate', mid: `sim-mid-${Date.now()}`, senderId, text: s(p.text, 1000) || 'send the links', payload: null, isEcho: false },
      ]);
    }

    case 'WHOAMI': {
      const account = await getAccount();
      if (!account) throw new AdminInputError('IG_ACCESS_TOKEN is not set');
      const cred = await getCredential();
      const limit = await account.client.publishingLimit(account.igUserId).catch((e) => ({ error: String(e) }));
      return { igUserId: account.igUserId, username: account.username, tokenExpiresAt: cred?.expiresAt, publishingLimit: limit };
    }

    case 'SUBSCRIBE': {
      const account = await getAccount();
      if (!account) throw new AdminInputError('IG_ACCESS_TOKEN is not set');
      const fields = s(p.fields, 200) || 'comments,messages';
      return account.client.subscribeApp(account.igUserId, fields);
    }

    case 'TICK':
      return runTick();

    default:
      throw new AdminInputError(`unknown action ${action}`);
  }
}
