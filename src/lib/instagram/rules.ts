// Pure comment → rule decision logic. No database or network here, so it is unit-tested directly
// (src/lib/instagram/__tests__/rules.test.ts).

export type MatchMode = 'word' | 'exact' | 'contains';

export interface RuleLike {
  id: string;
  key: string;
  keyword: string;
  matchMode: string;
  mediaId: string | null;
  // Set while the rule waits for a scheduled post to be published: until then it matches nothing.
  scheduledPostId?: string | null;
  isActive: boolean;
}

export interface IncomingComment {
  commentId: string;
  mediaId: string;
  fromId: string;
  fromUsername: string;
  text: string;
  createdAt: Date;
}

export interface Account {
  igUserId: string;
  username: string;
}

export type SkipReason = 'own_comment' | 'not_test_user' | 'no_match' | 'too_old' | 'already_sent';

export type Decision<R extends RuleLike> = { action: 'reply'; rule: R } | { action: 'skip'; reason: SkipReason; rule?: R };

// Meta allows a private reply within 7 days of the comment's creation.
export const PRIVATE_REPLY_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
// Instagram message text limit is 1000 bytes of UTF-8 (not characters: emoji count as 4).
export const MESSAGE_MAX_BYTES = 1000;

// RegExp constructor: tsconfig has no target, and TS rejects the /u flag on regex literals below ES6.
const LETTER_OR_DIGIT = new RegExp('[\\p{L}\\p{N}]', 'u');
const NOT_WORD_OR_SPACE = new RegExp('[^\\p{L}\\p{N}\\s]', 'gu');

function normalize(text: string): string {
  return text.normalize('NFKC').toLowerCase().trim();
}

export function keywordMatches(text: string, keyword: string, mode: string = 'word'): boolean {
  const t = normalize(text);
  const k = normalize(keyword);
  if (!k) return false;
  if (mode === 'contains') return t.includes(k);
  if (mode === 'exact') return t.replace(NOT_WORD_OR_SPACE, '').trim() === k;
  // word: the keyword must not touch other letters or digits ("cat!" and "CAT 🐈" match, "category" does not).
  let from = 0;
  while (true) {
    const i = t.indexOf(k, from);
    if (i < 0) return false;
    const before = i > 0 ? t[i - 1] : '';
    const after = t[i + k.length] ?? '';
    if (!LETTER_OR_DIGIT.test(before) && !LETTER_OR_DIGIT.test(after)) return true;
    from = i + 1;
  }
}

// Rules bound to this post win over "any post" rules; within a group, the first match wins.
export function findRule<R extends RuleLike>(comment: Pick<IncomingComment, 'mediaId' | 'text'>, rules: R[]): R | undefined {
  const active = rules.filter((r) => r.isActive);
  const specific = active.filter((r) => r.mediaId && r.mediaId === comment.mediaId);
  const anyPost = active.filter((r) => !r.mediaId && !r.scheduledPostId);
  return [...specific, ...anyPost].find((r) => keywordMatches(comment.text, r.keyword, r.matchMode));
}

export function decide<R extends RuleLike>(
  comment: IncomingComment,
  rules: R[],
  ctx: { account: Account; testUsernames: string[]; now: Date; alreadySent: (ruleId: string) => boolean }
): Decision<R> {
  const username = comment.fromUsername.replace(/^@/, '').toLowerCase();
  // Our own public replies come back as comment webhooks too: never answer them.
  if (comment.fromId === ctx.account.igUserId || (ctx.account.username && username === ctx.account.username.toLowerCase())) {
    return { action: 'skip', reason: 'own_comment' };
  }
  if (ctx.testUsernames.length > 0 && !ctx.testUsernames.includes(username)) {
    return { action: 'skip', reason: 'not_test_user' };
  }
  const rule = findRule(comment, rules);
  if (!rule) return { action: 'skip', reason: 'no_match' };
  if (ctx.now.getTime() - comment.createdAt.getTime() > PRIVATE_REPLY_WINDOW_MS) {
    return { action: 'skip', reason: 'too_old', rule };
  }
  // One DM per person per rule, even if they comment the keyword again.
  if (ctx.alreadySent(rule.id)) return { action: 'skip', reason: 'already_sent', rule };
  return { action: 'reply', rule };
}

export function pickPublicReply(replies: string[], random: () => number = Math.random): string | null {
  const options = replies.map((r) => r.trim()).filter(Boolean);
  if (options.length === 0) return null;
  return options[Math.min(options.length - 1, Math.floor(random() * options.length))];
}

// "{go:chomchom}" → "https://housecarewiki.com/go/chomchom?s=cat", so each click is attributed to the rule.
export function expandLinks(text: string, siteUrl: string, ruleKey: string): string {
  return text.replace(/\{go:([a-z0-9-]+)\}/g, (_m, slug: string) => `${siteUrl}/go/${slug}?s=${encodeURIComponent(ruleKey)}`);
}

export function linkSlugsIn(text: string): string[] {
  return Array.from(text.matchAll(/\{go:([a-z0-9-]+)\}/g), (m) => m[1]);
}

export function byteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

// The messages actually sent for a rule, with links expanded. One-step: links go in the private reply.
export function buildMessages(
  rule: { key: string; dmText: string; dmButton: string | null; linkText: string },
  opts: { siteUrl: string; twoStep: boolean }
): { first: string; button: string | null; followUp: string | null } {
  const links = expandLinks(rule.linkText, opts.siteUrl, rule.key);
  const dm = expandLinks(rule.dmText, opts.siteUrl, rule.key);
  if (opts.twoStep && rule.dmButton) return { first: dm, button: rule.dmButton, followUp: links };
  return { first: [dm, links].filter((s) => s.trim()).join('\n\n'), button: null, followUp: null };
}

export function validateRuleInput(input: {
  key?: unknown;
  keyword?: unknown;
  matchMode?: unknown;
  dmText?: unknown;
  linkText?: unknown;
  dmButton?: unknown;
  publicReplies?: unknown;
}): string[] {
  const errors: string[] = [];
  if (typeof input.key !== 'string' || !/^[a-z0-9-]{1,32}$/.test(input.key)) errors.push('key: 1-32 chars, a-z 0-9 -');
  if (typeof input.keyword !== 'string' || !input.keyword.trim()) errors.push('keyword is required');
  if (input.matchMode !== undefined && !['word', 'exact', 'contains'].includes(String(input.matchMode))) {
    errors.push('matchMode: word | exact | contains');
  }
  if (typeof input.dmText !== 'string' || !input.dmText.trim()) errors.push('dmText is required');
  if (typeof input.linkText !== 'string') errors.push('linkText is required');
  if (input.dmButton !== undefined && input.dmButton !== null && (typeof input.dmButton !== 'string' || input.dmButton.length > 20)) {
    errors.push('dmButton: at most 20 characters');
  }
  if (input.publicReplies !== undefined && !Array.isArray(input.publicReplies)) errors.push('publicReplies must be a list');
  if (typeof input.dmText === 'string' && typeof input.linkText === 'string') {
    // Worst case is the one-step message: both parts joined, links expanded to full URLs.
    const longest = buildMessages(
      { key: String(input.key), dmText: input.dmText, dmButton: null, linkText: input.linkText },
      { siteUrl: 'https://housecarewiki.com', twoStep: false }
    ).first;
    if (byteLength(longest) > MESSAGE_MAX_BYTES) errors.push(`DM is ${byteLength(longest)} bytes; Instagram allows ${MESSAGE_MAX_BYTES}`);
  }
  return errors;
}
