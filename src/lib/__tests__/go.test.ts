import { describe, expect, it } from 'vitest';
import { handleGo, type GoDeps } from '../go';
import { cleanSource, destinationFor, isBotUserAgent } from '../links';

const IPHONE_IG =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0.0.0 (iPhone15,2; iOS 18_1)';

function fakeDb() {
  const clicks: Parameters<GoDeps['recordClick']>[0][] = [];
  const deps: GoDeps = {
    findLink: async (slug) =>
      ({
        chomchom: { id: 'l1', asin: 'B09125RRXD', url: null, isActive: true },
        off: { id: 'l2', asin: 'B0016HF5GK', url: null, isActive: false },
        other: { id: 'l3', asin: null, url: 'https://www.amazon.com/dp/B0016HF5GK?tag=someone-else-20&th=1', isActive: true },
      })[slug] ?? null,
    findRuleByKey: async (key) => (key === 'cat' ? { id: 'rule-cat', mediaId: 'reel12' } : null),
    recordClick: async (c) => {
      clicks.push(c);
    },
  };
  return { deps, clicks };
}

const req = (url: string, init: RequestInit & { ua?: string } = {}) =>
  new Request(url, { ...init, headers: { 'user-agent': init.ua ?? IPHONE_IG, referer: 'https://l.instagram.com/' } });

describe('/go/<slug>', () => {
  it('logs the click with rule and post, then 302s to Amazon with our tag', async () => {
    const { deps, clicks } = fakeDb();
    const res = await handleGo(req('https://housecarewiki.com/go/chomchom?s=cat'), 'chomchom', deps);
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('https://www.amazon.com/dp/B09125RRXD?tag=housecare0a-20');
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(clicks).toEqual([
      { linkId: 'l1', source: 'cat', ruleId: 'rule-cat', mediaId: 'reel12', referrer: 'https://l.instagram.com/', userAgent: IPHONE_IG, isBot: false },
    ]);
  });

  it('keeps a free-form source without a rule', async () => {
    const { deps, clicks } = fakeDb();
    await handleGo(req('https://housecarewiki.com/go/chomchom?s=bio'), 'chomchom', deps);
    expect(clicks[0]).toMatchObject({ source: 'bio', ruleId: null, mediaId: null });
  });

  it('flags link-preview bots instead of counting them', async () => {
    const { deps, clicks } = fakeDb();
    const res = await handleGo(req('https://housecarewiki.com/go/chomchom?s=cat', { ua: 'facebookexternalhit/1.1' }), 'chomchom', deps);
    expect(res.status).toBe(302);
    expect(clicks[0].isBot).toBe(true);
  });

  it('does not log HEAD requests', async () => {
    const { deps, clicks } = fakeDb();
    const res = await handleGo(req('https://housecarewiki.com/go/chomchom', { method: 'HEAD' }), 'chomchom', deps);
    expect(res.status).toBe(302);
    expect(clicks).toHaveLength(0);
  });

  it('404s unknown, inactive and malformed slugs without logging', async () => {
    const { deps, clicks } = fakeDb();
    for (const slug of ['nope', 'off', '../etc', 'UPPER']) {
      expect((await handleGo(req(`https://housecarewiki.com/go/${slug}`), slug, deps)).status).toBe(404);
    }
    expect(clicks).toHaveLength(0);
  });

  it('still redirects when the click cannot be saved', async () => {
    const { deps } = fakeDb();
    deps.recordClick = async () => {
      throw new Error('db down');
    };
    const res = await handleGo(req('https://housecarewiki.com/go/chomchom'), 'chomchom', deps);
    expect(res.status).toBe(302);
  });

  it('replaces another partner tag on stored Amazon URLs', async () => {
    const { deps } = fakeDb();
    const res = await handleGo(req('https://housecarewiki.com/go/other'), 'other', deps);
    expect(res.headers.get('location')).toBe('https://www.amazon.com/dp/B0016HF5GK?tag=housecare0a-20&th=1');
  });
});

describe('link helpers', () => {
  it('destinationFor refuses non-https and broken URLs', () => {
    expect(destinationFor({ asin: null, url: 'http://example.com' })).toBeNull();
    expect(destinationFor({ asin: null, url: 'not a url' })).toBeNull();
    expect(destinationFor({ asin: null, url: 'https://housecarewiki.com/guides/x' })).toBe('https://housecarewiki.com/guides/x');
  });
  it('cleanSource keeps short slug-like values only', () => {
    expect(cleanSource('CAT')).toBe('cat');
    expect(cleanSource('<script>')).toBeNull();
    expect(cleanSource(null)).toBeNull();
  });
  it('isBotUserAgent treats empty agents and crawlers as bots, phones as people', () => {
    expect(isBotUserAgent('')).toBe(true);
    expect(isBotUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1)')).toBe(true);
    expect(isBotUserAgent('meta-externalagent/1.1')).toBe(true);
    expect(isBotUserAgent(IPHONE_IG)).toBe(false);
  });
});
