import { Prisma } from '@prisma/client';
import { db } from '../db';
import { igConfig } from './config';
import { GraphClient, GraphError } from './graph';
import { buildMessages, decide, pickPublicReply } from './rules';
import { getAccount } from './token';
import type { ParsedComment, ParsedMessage } from './webhook';

// Comment → public reply + private reply, and the optional follow-up when the person answers the DM.
// Every comment is stored first (unique comment ID = dedupe for Meta's retries), then claimed and processed.

const MAX_ATTEMPTS = 3;
const FOLLOW_UP_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

const log = (...args: unknown[]) => console.log('[ig]', ...args);
const errText = (e: unknown) => (e instanceof GraphError ? `${e.message} (code ${e.code ?? '-'}/${e.subcode ?? '-'})` : String(e)).slice(0, 500);

// Without a connected token a dry-run still works: replies are only logged, own-comment check uses env.
async function accountOrDryRun() {
  const cfg = igConfig();
  const account = await getAccount().catch((e) => {
    if (!cfg.dryRun) throw e;
    log('no usable token, dry-run continues without it:', errText(e));
    return null;
  });
  if (account) return account;
  if (!cfg.dryRun) throw new Error('Instagram is not connected (IG_ACCESS_TOKEN missing)');
  return { client: new GraphClient(cfg, ''), igUserId: cfg.igUserId || 'dry-run-account', username: cfg.username };
}

export async function ingestComments(comments: ParsedComment[], source: 'webhook' | 'poll' | 'simulate'): Promise<number> {
  if (comments.length === 0) return 0;
  const { count } = await db.igCommentEvent.createMany({
    data: comments.map((c) => ({
      commentId: c.commentId,
      mediaId: c.mediaId,
      fromId: c.fromId,
      fromUsername: c.fromUsername.slice(0, 64),
      text: c.text.slice(0, 2200),
      parentId: c.parentId,
      source,
      commentCreatedAt: c.createdAt,
    })),
    skipDuplicates: true,
  });
  return count;
}

export async function processPendingComments(limit = 25): Promise<{ processed: number; results: string[] }> {
  const cfg = igConfig();
  const pending = await db.igCommentEvent.findMany({ where: { status: 'PENDING' }, orderBy: { receivedAt: 'asc' }, take: limit });
  if (pending.length === 0) return { processed: 0, results: [] };
  const account = await accountOrDryRun();
  const rules = await db.igRule.findMany({ where: { isActive: true }, orderBy: { createdAt: 'asc' } });
  const results: string[] = [];

  for (const ev of pending) {
    // Claim: only one worker (webhook kick or cron tick) processes a given comment.
    const claimed = await db.igCommentEvent.updateMany({ where: { id: ev.id, status: 'PENDING' }, data: { status: 'PROCESSING' } });
    if (claimed.count === 0) continue;

    const sentBefore = await db.igCommentEvent.findMany({
      where: { fromId: ev.fromId, status: 'REPLIED', dryRun: cfg.dryRun, NOT: { id: ev.id } },
      select: { ruleId: true },
    });
    const sentRuleIds = new Set(sentBefore.map((s) => s.ruleId));
    const decision = decide(
      { commentId: ev.commentId, mediaId: ev.mediaId, fromId: ev.fromId, fromUsername: ev.fromUsername, text: ev.text, createdAt: ev.commentCreatedAt },
      rules,
      { account, testUsernames: cfg.testUsernames, now: new Date(), alreadySent: (id) => sentRuleIds.has(id) }
    );

    if (decision.action === 'skip') {
      await db.igCommentEvent.update({
        where: { id: ev.id },
        data: { status: 'SKIPPED', skipReason: decision.reason, ruleId: decision.rule?.id ?? null, dryRun: cfg.dryRun },
      });
      results.push(`${ev.commentId}: skipped (${decision.reason})`);
      continue;
    }

    const rule = decision.rule;
    const { client, igUserId } = account;
    const data: Prisma.IgCommentEventUpdateInput = { rule: { connect: { id: rule.id } }, dryRun: cfg.dryRun, attempts: { increment: 1 } };
    let lastError: string | null = null;

    // Public reply is a nice-to-have: a failure here is logged but does not block the DM.
    if (!ev.publicReplyAt) {
      const text = pickPublicReply(rule.publicReplies);
      if (text) {
        try {
          const r = await client.replyToComment(ev.commentId, text);
          Object.assign(data, { publicReplyText: text, publicReplyId: r.id, publicReplyAt: new Date() });
          log(cfg.dryRun ? 'DRY-RUN would reply' : 'replied', `@${ev.fromUsername}:`, text);
        } catch (e) {
          lastError = `public reply: ${errText(e)}`;
          log('public reply failed', ev.commentId, lastError);
        }
      }
    }

    const msgs = buildMessages(rule, { siteUrl: cfg.siteUrl, twoStep: cfg.twoStepDm });
    try {
      let sentText = msgs.first;
      let followUp = msgs.followUp;
      let sent;
      try {
        sent = await client.sendMessage(
          igUserId,
          { comment_id: ev.commentId },
          msgs.first,
          msgs.button ? { title: msgs.button, payload: `HCW_LINKS:${rule.key}` } : undefined
        );
      } catch (e) {
        // If Instagram refuses the button on a private reply, send everything in one message instead.
        if (!msgs.button) throw e;
        log('DM with button failed, retrying without it:', errText(e));
        const single = buildMessages(rule, { siteUrl: cfg.siteUrl, twoStep: false });
        sentText = single.first;
        followUp = null;
        sent = await client.sendMessage(igUserId, { comment_id: ev.commentId }, single.first);
      }
      Object.assign(data, {
        status: 'REPLIED',
        dmSentText: sentText,
        dmMessageId: sent.message_id,
        dmSentAt: new Date(),
        recipientId: sent.recipient_id,
        followUpPending: Boolean(followUp),
        lastError,
      });
      log(cfg.dryRun ? 'DRY-RUN would DM' : 'DM sent to', `@${ev.fromUsername} (rule ${rule.key}):`, JSON.stringify(sentText));
      results.push(`${ev.commentId}: ${cfg.dryRun ? 'dry-run ' : ''}replied (rule ${rule.key})`);
    } catch (e) {
      lastError = `DM: ${errText(e)}`;
      const attempts = ev.attempts + 1;
      Object.assign(data, { status: attempts >= MAX_ATTEMPTS ? 'FAILED' : 'PENDING', lastError });
      log('DM failed', ev.commentId, lastError);
      results.push(`${ev.commentId}: DM failed (${lastError})`);
    }
    await db.igCommentEvent.update({ where: { id: ev.id }, data });
  }
  return { processed: results.length, results };
}

// A message from someone we sent a two-step DM to: their reply (or button tap) opens the 24 h window,
// so the links go out now. Anything else in the inbox is left for a human.
export async function handleInboundMessages(messages: ParsedMessage[]): Promise<string[]> {
  const cfg = igConfig();
  const results: string[] = [];
  for (const m of messages) {
    if (m.isEcho) continue;
    try {
      await db.igInboundMessage.create({
        data: { mid: m.mid, senderId: m.senderId, text: m.text?.slice(0, 1000), payload: m.payload?.slice(0, 200), outcome: 'received' },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') continue; // duplicate delivery
      throw e;
    }

    const account = await accountOrDryRun();
    if (m.senderId === account.igUserId) continue;
    const ev = await db.igCommentEvent.findFirst({
      where: {
        followUpPending: true,
        dryRun: cfg.dryRun,
        dmSentAt: { gte: new Date(Date.now() - FOLLOW_UP_WINDOW_MS) },
        OR: [{ recipientId: m.senderId }, { fromId: m.senderId }],
      },
      orderBy: { dmSentAt: 'desc' },
      include: { rule: true },
    });
    let outcome = 'ignored';
    if (ev?.rule) {
      const claimed = await db.igCommentEvent.updateMany({ where: { id: ev.id, followUpPending: true }, data: { followUpPending: false } });
      if (claimed.count > 0) {
        const text = buildMessages(ev.rule, { siteUrl: cfg.siteUrl, twoStep: true }).followUp ?? '';
        try {
          await account.client.sendMessage(account.igUserId, { id: m.senderId }, text);
          await db.igCommentEvent.update({ where: { id: ev.id }, data: { followUpSentAt: new Date() } });
          outcome = 'followed_up';
          log(cfg.dryRun ? 'DRY-RUN would send follow-up' : 'follow-up sent', `to ${m.senderId}:`, JSON.stringify(text));
        } catch (e) {
          await db.igCommentEvent.update({ where: { id: ev.id }, data: { followUpPending: true, lastError: `follow-up: ${errText(e)}` } });
          outcome = 'failed';
        }
      }
    }
    await db.igInboundMessage.update({ where: { mid: m.mid }, data: { outcome } });
    results.push(`${m.mid}: ${outcome}`);
  }
  return results;
}

// Fallback while comment webhooks are not delivered (app not Live / no Advanced Access yet):
// read the latest comments of every post that has an active rule.
export async function pollRuleComments(): Promise<string> {
  const account = await getAccount();
  if (!account) return 'no token';
  const mediaIds = Array.from(
    new Set((await db.igRule.findMany({ where: { isActive: true, mediaId: { not: null } }, select: { mediaId: true } })).map((r) => r.mediaId!))
  );
  let added = 0;
  for (const mediaId of mediaIds) {
    const res = await account.client.mediaComments(mediaId);
    added += await ingestComments(
      res.data.map((c) => ({
        accountId: account.igUserId,
        commentId: c.id,
        mediaId,
        fromId: c.from?.id ?? '',
        fromUsername: c.from?.username ?? c.username ?? '',
        text: c.text ?? '',
        parentId: null,
        createdAt: c.timestamp ? new Date(c.timestamp) : new Date(),
      })),
      'poll'
    );
  }
  return `polled ${mediaIds.length} post(s), ${added} new comment(s)`;
}
