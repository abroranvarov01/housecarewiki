# Instagram automation (replaces Chatplace)

This is our own system for @housecarewiki on the official **Instagram API with Instagram Login** (`graph.instagram.com`, API `v26.0`). It does three things:

1. **Scheduled Reels.** You upload an mp4, a caption, a cover and a time. At that time it creates a `REELS` container from our public video URL and calls `media_publish`.
2. **Comment keyword → public reply + DM.** For example, a comment with `CAT` on reel 12 gets one of three random public replies and a private reply with the two product links.
3. **Click tracking.** DM links are `housecarewiki.com/go/<slug>?s=<rule>`. Each visit is logged (time, rule, post, referrer, bot or not) and then sent to Amazon with a 302 and the tag `housecare0a-20` from `src/lib/site.ts`.

**It is a dry run by default (`IG_DRY_RUN=1`).** In a dry run nothing is published or sent. Every reply, DM and post is only logged. Nothing goes to real people until you set `IG_DRY_RUN=0`.

## Where it runs and why

Everything is part of the Next.js site on the VPS, plus one tiny container:

- `POST /api/instagram/webhook`: Meta sends comment and DM events here.
- `POST /api/instagram/tick`: one pass of all periodic work: publish due reels, refresh the token, process the comment queue, and poll comments if polling is on.
- `ig-cron` (in `docker-compose.yml`): a `curl` loop that calls the tick once a minute with `CRON_SECRET`.
- `GET /go/<slug>`: the click-counting redirect.
- `GET /api/instagram/media/<file>`: the public HTTPS URL that Instagram downloads the reel and cover from.
- `/admin/instagram`: a read-only status page (same admin login as `/admin`).
- `npm run ig -- …` (`scripts/ig.mjs`): a CLI that adds links, rules and scheduled reels through the admin API. It works from your Mac against the live site.

Why it lives in the site and not in a separate service:

- The site already has HTTPS through nginx, a domain, the Postgres container and the admin login.
- `/go` has to be on our domain anyway.
- One codebase and one deploy. The cron container only holds a timer, no logic.

The data is in Postgres through Prisma (`prisma/schema.prisma`, migrations in `prisma/migrations`). The rest of the site still uses `.data/store.json` as before.

## What Meta requires (checked against the docs on 2026-10-31)

| Feature | Endpoint | Permission (Instagram Login) |
|---|---|---|
| Read account, refresh token | `GET /me`, `GET /refresh_access_token` | `instagram_business_basic` |
| Publish reels | `POST /<IG_ID>/media` (`media_type=REELS`, `video_url`, `caption`, `cover_url`, `share_to_feed`), `GET /<container>?fields=status_code`, `POST /<IG_ID>/media_publish`, `GET /<IG_ID>/content_publishing_limit` | `instagram_business_content_publish` |
| Public reply to a comment | `POST /<comment_id>/replies?message=…` | `instagram_business_manage_comments` |
| Private reply (DM to a commenter) | `POST /<IG_ID>/messages` with `{"recipient":{"comment_id":…},"message":{"text":…}}` | `instagram_business_manage_comments` (+ `instagram_business_manage_messages` for the follow-up and the `messages` webhook) |
| Comment webhook | field `comments` | `instagram_business_basic`, `instagram_business_manage_comments` |
| DM webhook (follow-ups) | field `messages` | `instagram_business_basic`, `instagram_business_manage_messages` |

Limits the code enforces:

- **One private reply per comment, within 7 days** of the comment. Older comments are skipped as `too_old`. On top of that, each person gets at most one DM per rule, even if they comment the keyword again (`already_sent`).
- **Follow-ups only after the person replies**, sent right away, so they stay inside the 24 h window.
- **Publishing limit.** The docs say both "100 posts per 24 h" and `quota_total: 50`. Before each publish the code reads `content_publishing_limit` and uses the number the API reports. If that call fails, it assumes 50. `IG_MAX_POSTS_PER_DAY` (default 25) is our own cap on top.
- **DM text is at most 1000 bytes** (emoji count as 4). Rules longer than that are refused when you save them.
- **Caption limits:** 2200 characters, 30 hashtags, 20 @ tags. These are checked when you schedule.
- **Reel file:** MP4 or MOV, H.264 or HEVC, AAC audio, 23–60 fps, 3 s to 15 min, at most 300 MB, 9:16 recommended.
- **No replies to our own comments.** Our public replies come back as comment webhooks too, so comments from our account ID or username are skipped (`own_comment`).
- **Deduplication.** Meta retries webhooks for up to 36 h. The comment ID is unique in the database, so a repeated delivery is ignored.

### Is App Review needed for our own account?

- **API calls: no.** Meta's App Review page says: if the app "is only for a business I own or manage", Standard Access applies and App Review is not required. That covers publishing, public replies and private replies on @housecarewiki.
- **Comment webhooks: probably yes.** The webhook setup page says the app must be **Live** and lists **Advanced Access** as required for `comments`. Advanced Access needs App Review, and production access needs **Business Verification**. Developers report mixed results with app-role accounts. So try step 8 below first. If real comments do not arrive, there are two ways forward:
  - **Without review: polling.** Set `IG_POLL_COMMENTS=1`. Every minute the tick reads `GET /<media_id>/comments` for each post that has an active rule and feeds new comments into the same pipeline. This only needs Standard Access. The `messages` webhook (two-step DMs) will not work in this mode, so keep `IG_TWO_STEP_DM=0`. The links then go in the first DM.
  - **With review:** submit App Review for `instagram_business_manage_comments` and `instagram_business_manage_messages`. You need a screencast of the flow, a privacy policy URL (`https://housecarewiki.com/privacy`), a 1024×1024 app icon and Business Verification.

## Setup: your steps (credentials stay with you)

You do these yourself. Claude never logs in, accepts permissions or handles tokens.

1. **Make sure @housecarewiki is a public Professional account** (Business or Creator). Private accounts do not get comment webhooks.
2. **Create the app.** Go to [developers.facebook.com/apps](https://developers.facebook.com/apps) → **Create App** → use case **Other** → app type **Business** → give it a name (for example "HouseCareWiki automation") and a contact email.
3. **Add Instagram.** On the Instagram product, click **Set up**. **API setup with Instagram login** is added.
4. **Note the app keys.** Under Instagram → API setup with Instagram login you see the **Instagram app ID** and **Instagram app secret**. Put the secret in the server `.env` as `IG_APP_SECRET`. Also copy **App settings → Basic → App secret** into `META_APP_SECRET`. Webhooks are signed with one of the two, and the code accepts either.
5. **Connect the account and get a token.** In "Generate access tokens", click **Add account**, log in as @housecarewiki, and accept the four permissions:
   - `instagram_business_basic`
   - `instagram_business_content_publish`
   - `instagram_business_manage_comments`
   - `instagram_business_manage_messages`

   Click **Generate token** and copy it into the server `.env` as `IG_ACCESS_TOKEN`. The site refreshes it automatically before its 60 days run out. If you ever paste a new token, the site switches to it on the next request.
6. **Fill the rest of the server `.env`** (`/opt/housecarewiki/.env`, next to `ADMIN_PASSWORD`):

   ```
   IG_ACCESS_TOKEN=<from step 5>
   IG_APP_SECRET=<Instagram app secret>
   META_APP_SECRET=<App settings > Basic > App secret>
   IG_VERIFY_TOKEN=<any long random string, also typed into the dashboard in step 8>
   CRON_SECRET=<another long random string>
   IG_DRY_RUN=1
   IG_TEST_USERNAMES=<your second Instagram account, for the live test>
   ```

   You can make random strings with `openssl rand -hex 32`.
7. **Deploy:** `docker compose up -d --build`.
   - On start, the web container runs `prisma migrate deploy` (it creates the tables), and `ig-cron` starts ticking.
   - If the migration stops with error `P3005` (the database already has tables), run this once, then start again: `docker compose run --rm web ./node_modules/.bin/prisma migrate resolve --applied 0_init`
   - **nginx:** reel uploads go through it, and nginx's default body limit is 1 MB. Add `client_max_body_size 300m;` to the `housecarewiki.com` server block and reload nginx.
8. **Webhooks.** In the dashboard, under "Configure webhooks":
   - Callback URL: `https://housecarewiki.com/api/instagram/webhook`
   - Verify token: the `IG_VERIFY_TOKEN` from step 6
   - Click **Verify and save**, then subscribe the fields `comments` and `messages`.
   - Then turn webhooks on for the account from your Mac: `HCW_URL=https://housecarewiki.com npm run ig -- subscribe` (this calls `POST /<IG_ID>/subscribed_apps?subscribed_fields=comments,messages`).
   - Webhooks only reach a **Live** app. Switching to Live asks for a privacy policy URL (`https://housecarewiki.com/privacy`) and possibly a data deletion URL. See the App Review section above.
9. **Check the connection:** `HCW_URL=https://housecarewiki.com npm run ig -- whoami`. It should show `@housecarewiki`, the token expiry and the publishing quota.

The CLI reads `HCW_URL`, `ADMIN_USER` and `ADMIN_PASSWORD` from your shell or a local `.env`. Run it from the repo folder.

## Dry run after connecting (nothing reaches real people)

With `IG_DRY_RUN=1` still set:

```bash
export HCW_URL=https://housecarewiki.com
# 1. Links, rule and the reel 12 schedule from marketing/reels/12-cat-hates/automation.json
npm run ig -- reel marketing/reels/12-cat-hates --at 2026-11-03T19:00:00-05:00
# 2. A test comment: the log shows the public reply and the DM it would send
npm run ig -- simulate-comment --text "CAT 😹" --user tester --rule cat
# 3. Open one of the links from that DM on your phone, then check the counts
npm run ig -- status
```

- Real comments that arrive through the webhook are also processed in dry-run mode, and their would-be replies show on `/admin/instagram` under "Latest comments".
- The rule for reel 12 waits for the reel to be published. A dry-run publish gives the rule a stand-in media ID (`dry-run-<post id>`), so `simulate-comment --rule cat` can match it.
- To test the publisher, move the post to now with `npm run ig -- reschedule <id> --at <now>`. The next tick checks that Instagram could download the video and marks the post `DRY_RUN`. Then move it back to the real time with `reschedule` again.

## Going live

1. **Test with your second account first.** Set `IG_DRY_RUN=0` and keep `IG_TEST_USERNAMES=<your second account>`, then `docker compose up -d`.
   - Only that account gets replies. Comment `CAT` from it and check the public reply, the DM and that the links open.
   - Also check whether the DM landed in **Requests** and whether its links are clickable there.
2. **Remove `IG_TEST_USERNAMES`** to answer everyone.
3. **Two-step DM (optional).** With `IG_TWO_STEP_DM=1`, the first DM has a "send the links" button, and the links follow after the tap. Like the Chatplace flow, this opens the conversation first. It needs the `messages` webhook. If Instagram refuses the button on a private reply, the code sends a single DM with the links instead.
4. **Publishing the scheduled reel needs no extra step.** It goes out at its time once `IG_DRY_RUN=0` is set. Check `npm run ig -- status` or `/admin/instagram` afterwards: the post becomes `PUBLISHED` with a permalink, and the `cat` rule now carries the real media ID.

## Everyday commands

```bash
npm run ig -- help
npm run ig -- link roller --asin B09125RRXD --label "ChomChom roller"   # → https://housecarewiki.com/go/roller
npm run ig -- rule my-rule.json          # same shape as "rule" in automation.json; mediaId = an existing post's ID, or leave it out for any post
npm run ig -- rule-off cat               # pause a rule
npm run ig -- schedule --video reel.mp4 --cover cover.jpg --caption-file caption.txt --at 2026-11-05T19:00:00-05:00
npm run ig -- cancel <post-id>
npm run ig -- status                     # clicks per link (24 h / 7 days / by source), DMs and clicks per rule, posts, latest comments
```

- **Links in DM text:** write `{go:<slug>}` in a rule's `dmText` or `linkText`. It becomes `https://housecarewiki.com/go/<slug>?s=<rule key>`, so clicks count against that rule and its post.
- **Other places:** for a bio link, use something like `?s=bio`.
- **What counts as a click:** link previews and crawlers (for example the fetch Instagram makes to draw the DM preview) are logged as bot hits and not counted. `HEAD` requests are not logged.

## Environment variables

| Variable | Default | Meaning |
|---|---|---|
| `IG_DRY_RUN` | `1` | `0` = really publish and send |
| `IG_ACCESS_TOKEN` | — | long-lived Instagram user token (refreshed automatically, stored in the `IgCredential` table) |
| `IG_APP_SECRET`, `META_APP_SECRET` | — | webhook signature check (either may be the one Meta uses) |
| `IG_VERIFY_TOKEN` | — | webhook verification handshake |
| `CRON_SECRET` | — | protects `/api/instagram/tick` |
| `IG_TEST_USERNAMES` | empty | comma-separated; if set, only these users get replies |
| `IG_TWO_STEP_DM` | `0` | first DM with a button, links after the reply (needs the `messages` webhook) |
| `IG_POLL_COMMENTS` | `0` | read comments every minute instead of relying on webhooks |
| `IG_MAX_POSTS_PER_DAY` | `25` | our own cap below Instagram's limit |
| `IG_API_VERSION` | `v26.0` | Graph API version |
| `IG_USER_ID`, `IG_USERNAME` | from `/me` | only needed without a token (local dry run) |
| `IG_PUBLIC_BASE_URL` | `https://housecarewiki.com` | base for video URLs and DM links (local dev: `http://localhost:3100`) |

## Local development

```bash
npx prisma generate
DATABASE_URL=postgresql://… npx prisma migrate deploy
npm test                      # rule matching, webhook signatures and parsing, /go redirect + click log
```

- Put `DATABASE_URL`, `IG_APP_SECRET`, `IG_VERIFY_TOKEN`, `CRON_SECRET` and `IG_PUBLIC_BASE_URL=http://localhost:3100` in `.env.local`.
- With the dev server running, `HCW_URL=http://localhost:3100 IG_APP_SECRET=… npm run ig -- webhook-test --text CAT --media <id>` sends a signed fake comment webhook, the same way Meta does.
