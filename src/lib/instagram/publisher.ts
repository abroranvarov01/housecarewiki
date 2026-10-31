import { db } from '../db';
import { igConfig } from './config';
import { GraphError } from './graph';
import { getAccount } from './token';

// Scheduled Reels: at publish time create a REELS container from our public video URL, wait until
// Instagram has processed it (status_code FINISHED), then media_publish. Runs from the cron tick.
// Steps and limits: developers.facebook.com/docs/instagram-platform/content-publishing

const DAY = 24 * 60 * 60 * 1000;
// Meta suggests polling the container once a minute for at most 5 minutes; large reels can take longer.
const CONTAINER_TIMEOUT_MS = 30 * 60 * 1000;
const MAX_ATTEMPTS = 3;

const log = (...args: unknown[]) => console.log('[ig:publish]', ...args);
const errText = (e: unknown) => (e instanceof GraphError ? `${e.message} (code ${e.code ?? '-'})` : String(e)).slice(0, 500);

export function mediaUrl(file: string) {
  return `${igConfig().siteUrl}/api/instagram/media/${file}`;
}

// Remaining API posts in the rolling 24 h: Instagram's own count, capped further by IG_MAX_POSTS_PER_DAY.
async function publishingRoom(account: NonNullable<Awaited<ReturnType<typeof getAccount>>>): Promise<{ room: number; detail: string }> {
  const cfg = igConfig();
  const ours = await db.igScheduledPost.count({ where: { status: 'PUBLISHED', publishedAt: { gte: new Date(Date.now() - DAY) } } });
  let room = cfg.maxPostsPerDay - ours;
  let detail = `local ${ours}/${cfg.maxPostsPerDay}`;
  try {
    const limit = (await account.client.publishingLimit(account.igUserId)).data[0];
    if (limit) {
      // Docs list both 100 and 50 as the limit; trust the number the API reports, else assume the lower one.
      const total = limit.config?.quota_total ?? 50;
      room = Math.min(room, total - limit.quota_usage);
      detail += `, instagram ${limit.quota_usage}/${total}`;
    }
  } catch (e) {
    detail += `, content_publishing_limit unavailable: ${errText(e)}`;
  }
  return { room, detail };
}

export async function runPublisher(now = new Date()): Promise<string[]> {
  const cfg = igConfig();
  const results: string[] = [];
  const due = await db.igScheduledPost.findMany({ where: { status: 'SCHEDULED', publishAt: { lte: now } }, orderBy: { publishAt: 'asc' } });
  const processing = await db.igScheduledPost.findMany({ where: { status: 'PROCESSING' } });
  if (due.length === 0 && processing.length === 0) return results;

  const account = await getAccount().catch(() => null);
  if (!account && !cfg.dryRun) return ['publisher: Instagram is not connected'];

  if (due.length > 0) {
    const { room, detail } = account ? await publishingRoom(account) : { room: due.length, detail: 'no token (dry-run)' };
    let left = room;
    for (const post of due) {
      if (left <= 0) {
        await db.igScheduledPost.update({ where: { id: post.id }, data: { lastError: `waiting for publishing quota (${detail})` } });
        results.push(`${post.id}: waiting for quota (${detail})`);
        continue;
      }
      const params = {
        videoUrl: mediaUrl(post.videoFile),
        caption: post.caption,
        coverUrl: post.coverFile ? mediaUrl(post.coverFile) : undefined,
        shareToFeed: post.shareToFeed,
      };
      if (cfg.dryRun) {
        // Check that Instagram would be able to fetch the video, then stop: nothing is created on Instagram.
        const reachable = await fetch(params.videoUrl, { method: 'HEAD', cache: 'no-store' })
          .then((r) => `${r.status} ${r.headers.get('content-type')} ${r.headers.get('content-length')} bytes`)
          .catch((e) => `unreachable: ${e}`);
        await db.$transaction([
          db.igScheduledPost.update({
            where: { id: post.id },
            data: { status: 'DRY_RUN', lastError: `dry-run: would create REELS container ${JSON.stringify(params)}; video HEAD ${reachable}; quota ${detail}` },
          }),
          // A stand-in media ID so the post's rules can be tried with simulated comments; the real publish
          // later replaces it with the real one.
          db.igRule.updateMany({ where: { scheduledPostId: post.id }, data: { mediaId: `dry-run-${post.id}` } }),
        ]);
        log('DRY-RUN would publish', post.id, params, 'video:', reachable);
        results.push(`${post.id}: dry-run (video ${reachable})`);
        left--;
        continue;
      }
      try {
        const container = await account!.client.createReelContainer(account!.igUserId, params);
        await db.igScheduledPost.update({
          where: { id: post.id },
          data: { status: 'PROCESSING', containerId: container.id, attempts: { increment: 1 }, lastError: null },
        });
        results.push(`${post.id}: container ${container.id} created`);
        left--;
      } catch (e) {
        const attempts = post.attempts + 1;
        await db.igScheduledPost.update({
          where: { id: post.id },
          data: { attempts, status: attempts >= MAX_ATTEMPTS ? 'FAILED' : 'SCHEDULED', lastError: `container: ${errText(e)}` },
        });
        results.push(`${post.id}: container failed (${errText(e)})`);
      }
    }
  }

  for (const post of processing) {
    if (!account || !post.containerId) continue;
    try {
      const status = await account.client.containerStatus(post.containerId);
      if (status.status_code === 'FINISHED') {
        const published = await account.client.publish(account.igUserId, post.containerId);
        const media = await account.client.get<{ permalink?: string }>(published.id, { fields: 'permalink' }).catch(() => ({ permalink: undefined }));
        await db.$transaction([
          db.igScheduledPost.update({
            where: { id: post.id },
            data: { status: 'PUBLISHED', mediaId: published.id, permalink: media.permalink ?? null, publishedAt: new Date(), lastError: null },
          }),
          // Rules written for this post before it existed start matching its comments now.
          db.igRule.updateMany({ where: { scheduledPostId: post.id }, data: { mediaId: published.id } }),
        ]);
        log('published', post.id, published.id, media.permalink);
        results.push(`${post.id}: published ${published.id}`);
      } else if (status.status_code === 'ERROR' || status.status_code === 'EXPIRED') {
        await db.igScheduledPost.update({ where: { id: post.id }, data: { status: 'FAILED', lastError: `container ${status.status_code}: ${status.status ?? ''}` } });
        results.push(`${post.id}: container ${status.status_code}`);
      } else if (Date.now() - post.updatedAt.getTime() > CONTAINER_TIMEOUT_MS) {
        await db.igScheduledPost.update({ where: { id: post.id }, data: { status: 'FAILED', lastError: 'container still IN_PROGRESS after 30 min' } });
        results.push(`${post.id}: container timed out`);
      } else {
        results.push(`${post.id}: container ${status.status_code}`);
      }
    } catch (e) {
      await db.igScheduledPost.update({ where: { id: post.id }, data: { lastError: `status/publish: ${errText(e)}` } });
      results.push(`${post.id}: ${errText(e)}`);
    }
  }
  return results;
}
