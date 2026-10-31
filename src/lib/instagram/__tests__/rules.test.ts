import { describe, expect, it } from 'vitest';
import automation from '../../../../marketing/reels/12-cat-hates/automation.json';
import {
  buildMessages,
  byteLength,
  decide,
  expandLinks,
  findRule,
  keywordMatches,
  pickPublicReply,
  validateRuleInput,
  type IncomingComment,
  type RuleLike,
} from '../rules';

const rule = (over: Partial<RuleLike> = {}): RuleLike => ({ id: 'r1', key: 'cat', keyword: 'CAT', matchMode: 'word', mediaId: 'm1', isActive: true, ...over });
const comment = (over: Partial<IncomingComment> = {}): IncomingComment => ({
  commentId: 'c1',
  mediaId: 'm1',
  fromId: 'u1',
  fromUsername: 'someone',
  text: 'CAT',
  createdAt: new Date('2026-11-01T12:00:00Z'),
  ...over,
});
const ctx = (over: Partial<Parameters<typeof decide>[2]> = {}) => ({
  account: { igUserId: 'me', username: 'housecarewiki' },
  testUsernames: [] as string[],
  now: new Date('2026-11-01T12:05:00Z'),
  alreadySent: () => false,
  ...over,
});

describe('keywordMatches (word mode)', () => {
  it.each(['CAT', 'cat', 'Cat!', 'CAT 🐈', '🐈CAT', 'please send CAT', 'cat.', '"cat"', '  cat  ', 'ＣＡＴ'])('matches %j', (text) => {
    expect(keywordMatches(text, 'CAT')).toBe(true);
  });
  it.each(['category', 'cats', 'concatenate', 'scat', 'c a t', 'dog', '', 'cat2'])('does not match %j', (text) => {
    expect(keywordMatches(text, 'CAT')).toBe(false);
  });
  it('finds a later whole-word hit after an embedded one', () => {
    expect(keywordMatches('category of cat', 'cat')).toBe(true);
  });
});

describe('keywordMatches (other modes)', () => {
  it('exact ignores punctuation and emoji but needs nothing else', () => {
    expect(keywordMatches('CAT!! 🐈', 'cat', 'exact')).toBe(true);
    expect(keywordMatches('send cat', 'cat', 'exact')).toBe(false);
  });
  it('contains matches substrings', () => {
    expect(keywordMatches('cats', 'cat', 'contains')).toBe(true);
  });
  it('an empty keyword never matches', () => {
    expect(keywordMatches('anything', ' ')).toBe(false);
  });
});

describe('findRule', () => {
  it('prefers a rule bound to the post over an any-post rule', () => {
    const any = rule({ id: 'any', mediaId: null });
    const specific = rule({ id: 'specific' });
    expect(findRule(comment(), [any, specific])?.id).toBe('specific');
  });
  it('falls back to an any-post rule on other posts', () => {
    const any = rule({ id: 'any', mediaId: null });
    expect(findRule(comment({ mediaId: 'other' }), [rule(), any])?.id).toBe('any');
  });
  it('a rule waiting for its scheduled post matches nothing yet', () => {
    expect(findRule(comment(), [rule({ mediaId: null, scheduledPostId: 'post-1' })])).toBeUndefined();
    expect(findRule(comment(), [rule({ scheduledPostId: 'post-1' })])?.id).toBe('r1');
  });
  it('ignores rules bound to another post and inactive rules', () => {
    expect(findRule(comment({ mediaId: 'other' }), [rule()])).toBeUndefined();
    expect(findRule(comment(), [rule({ isActive: false })])).toBeUndefined();
  });
});

describe('decide', () => {
  it('replies to a matching comment', () => {
    expect(decide(comment(), [rule()], ctx())).toEqual({ action: 'reply', rule: rule() });
  });
  it('never answers our own comments (by id or by username)', () => {
    expect(decide(comment({ fromId: 'me' }), [rule()], ctx())).toMatchObject({ action: 'skip', reason: 'own_comment' });
    expect(decide(comment({ fromUsername: 'HouseCareWiki' }), [rule()], ctx())).toMatchObject({ action: 'skip', reason: 'own_comment' });
  });
  it('with a test-user list, answers only those users', () => {
    const c = ctx({ testUsernames: ['tester'] });
    expect(decide(comment(), [rule()], c)).toMatchObject({ reason: 'not_test_user' });
    expect(decide(comment({ fromUsername: '@Tester' }), [rule()], c).action).toBe('reply');
  });
  it('skips comments without the keyword', () => {
    expect(decide(comment({ text: 'love this' }), [rule()], ctx())).toMatchObject({ reason: 'no_match' });
  });
  it('skips comments older than the 7-day private reply window', () => {
    const old = comment({ createdAt: new Date('2026-10-25T12:00:00Z') });
    expect(decide(old, [rule()], ctx())).toMatchObject({ action: 'skip', reason: 'too_old' });
  });
  it('sends one DM per person per rule', () => {
    expect(decide(comment(), [rule()], ctx({ alreadySent: (id) => id === 'r1' }))).toMatchObject({ reason: 'already_sent' });
  });
});

describe('messages', () => {
  it('picks one of the public replies and skips blanks', () => {
    expect(pickPublicReply(['a', ' ', 'b'], () => 0.99)).toBe('b');
    expect(pickPublicReply(['a', 'b'], () => 0)).toBe('a');
    expect(pickPublicReply(['  '])).toBeNull();
  });
  it('expands {go:slug} into tracked short links', () => {
    expect(expandLinks('x {go:chomchom} y {go:little-green}', 'https://housecarewiki.com', 'cat')).toBe(
      'x https://housecarewiki.com/go/chomchom?s=cat y https://housecarewiki.com/go/little-green?s=cat'
    );
  });
  it('one-step puts the links in the private reply, two-step holds them for the follow-up', () => {
    const r = { key: 'cat', dmText: 'hi', dmButton: 'send', linkText: 'link {go:a}' };
    expect(buildMessages(r, { siteUrl: 'https://s', twoStep: false })).toEqual({ first: 'hi\n\nlink https://s/go/a?s=cat', button: null, followUp: null });
    expect(buildMessages(r, { siteUrl: 'https://s', twoStep: true })).toEqual({ first: 'hi', button: 'send', followUp: 'link https://s/go/a?s=cat' });
    expect(buildMessages({ ...r, dmButton: null }, { siteUrl: 'https://s', twoStep: true }).followUp).toBeNull();
  });
  it('counts bytes, not characters, for the 1000-byte limit', () => {
    expect(byteLength('🐈')).toBe(4);
    const errors = validateRuleInput({ key: 'x', keyword: 'x', dmText: '🐈'.repeat(260), linkText: '' });
    expect(errors.join()).toMatch(/1000/);
  });
  it('rejects bad rule input', () => {
    expect(validateRuleInput({ key: 'Bad Key', keyword: '', dmText: '', linkText: 1 as unknown as string })).toHaveLength(4);
  });
});

describe('reel 12 automation (CAT)', () => {
  const r = { id: 'cat', mediaId: 'reel12', isActive: true, ...automation.rule };
  it('is valid and fits in one Instagram message', () => {
    expect(validateRuleInput(automation.rule)).toEqual([]);
  });
  it('answers "CAT" on reel 12 with a DM containing both tracked links', () => {
    const d = decide(comment({ mediaId: 'reel12', text: 'CAT 😹' }), [r], ctx());
    expect(d.action).toBe('reply');
    const msg = buildMessages(r, { siteUrl: 'https://housecarewiki.com', twoStep: false }).first;
    expect(msg).toContain('https://housecarewiki.com/go/chomchom?s=cat');
    expect(msg).toContain('https://housecarewiki.com/go/little-green?s=cat');
  });
  it('the button title fits the 20-character quick reply limit', () => {
    expect(automation.rule.dmButton.length).toBeLessThanOrEqual(20);
  });
});
