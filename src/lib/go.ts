import { cleanSource, destinationFor, isBotUserAgent, isValidSlug } from './links';

// Request handling for /go/<slug>, with the database passed in so it can be tested without one.

export interface GoDeps {
  findLink(slug: string): Promise<{ id: string; asin: string | null; url: string | null; isActive: boolean } | null>;
  findRuleByKey(key: string): Promise<{ id: string; mediaId: string | null } | null>;
  recordClick(click: {
    linkId: string;
    source: string | null;
    ruleId: string | null;
    mediaId: string | null;
    referrer: string | null;
    userAgent: string | null;
    isBot: boolean;
  }): Promise<void>;
}

const HEADERS = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' };

export async function handleGo(request: Request, slug: string, deps: GoDeps): Promise<Response> {
  const link = isValidSlug(slug) ? await deps.findLink(slug) : null;
  const destination = link && link.isActive ? destinationFor(link) : null;
  if (!link || !destination) return new Response('Link not found', { status: 404, headers: HEADERS });

  // HEAD requests are link checkers, not people: redirect without counting.
  if (request.method === 'GET') {
    const source = cleanSource(new URL(request.url).searchParams.get('s'));
    const rule = source ? await deps.findRuleByKey(source) : null;
    const userAgent = request.headers.get('user-agent');
    try {
      await deps.recordClick({
        linkId: link.id,
        source,
        ruleId: rule?.id ?? null,
        mediaId: rule?.mediaId ?? null,
        referrer: request.headers.get('referer')?.slice(0, 300) ?? null,
        userAgent: userAgent?.slice(0, 300) ?? null,
        isBot: isBotUserAgent(userAgent),
      });
    } catch (e) {
      // Losing one click is better than a broken link to Amazon.
      console.error('[go] click not recorded', slug, e);
    }
  }
  return new Response(null, { status: 302, headers: { ...HEADERS, Location: destination } });
}
