import path from 'path';
import { SITE } from '../site';

// Instagram automation settings, all from env. Nothing is sent to Instagram users or published
// unless IG_DRY_RUN is explicitly "0": the default is a dry run that only logs what it would do.

const flag = (value: string | undefined, fallback: boolean) =>
  value === undefined || value === '' ? fallback : value === '1' || value.toLowerCase() === 'true';

const list = (value: string | undefined) =>
  (value || '')
    .split(',')
    .map((v) => v.trim().replace(/^@/, '').toLowerCase())
    .filter(Boolean);

export function igConfig() {
  const env = process.env;
  return {
    apiVersion: env.IG_API_VERSION || 'v26.0',
    graphHost: 'https://graph.instagram.com',
    accessToken: env.IG_ACCESS_TOKEN || '',
    // Optional: normally read from GET /me (user_id) and cached with the token.
    igUserId: env.IG_USER_ID || '',
    // Only used when no token is connected yet (local dry-run): our username, to skip our own comments.
    username: (env.IG_USERNAME || 'housecarewiki').replace(/^@/, ''),
    // Webhook payloads are signed with the app secret. Instagram Login apps show an "Instagram app secret"
    // and the Meta app has its own App secret; a signature valid under either is accepted.
    appSecrets: [env.IG_APP_SECRET, env.META_APP_SECRET].filter((s): s is string => Boolean(s)),
    verifyToken: env.IG_VERIFY_TOKEN || '',
    cronSecret: env.CRON_SECRET || '',
    dryRun: flag(env.IG_DRY_RUN, true),
    // When set, only comments from these usernames get replies (for testing with a second account).
    testUsernames: list(env.IG_TEST_USERNAMES),
    // Two-step DM: first message with a button, links after the user replies (needs the messages webhook).
    twoStepDm: flag(env.IG_TWO_STEP_DM, false),
    // Poll /<media>/comments for rule-bound posts, for when comment webhooks are not delivered yet.
    pollComments: flag(env.IG_POLL_COMMENTS, false),
    // Our own cap on API-published posts per 24 h, on top of what content_publishing_limit reports.
    maxPostsPerDay: Number(env.IG_MAX_POSTS_PER_DAY || 25),
    siteUrl: (env.IG_PUBLIC_BASE_URL || SITE.url).replace(/\/$/, ''),
    mediaDir: path.join(process.cwd(), '.data', 'ig-media'),
  };
}

export type IgConfig = ReturnType<typeof igConfig>;
