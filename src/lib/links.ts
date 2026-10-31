import { SITE, amazonProductUrl } from './site';

// /go/<slug> short links: where they point and which visits count as clicks. Pure functions; the route
// (src/app/go/[slug]/route.ts) does the database work.

export interface ShortLinkTarget {
  asin: string | null;
  url: string | null;
}

// Amazon links always carry the partner tag from SITE, even if the stored URL has another or none.
export function destinationFor(link: ShortLinkTarget): string | null {
  if (link.asin) return amazonProductUrl(link.asin);
  if (!link.url) return null;
  let u: URL;
  try {
    u = new URL(link.url);
  } catch {
    return null;
  }
  if (u.protocol !== 'https:') return null;
  if (/(^|\.)amazon\.[a-z.]+$/.test(u.hostname)) u.searchParams.set('tag', SITE.amazonPartnerTag);
  return u.toString();
}

// Link previews and crawlers (Instagram fetches a URL to draw the DM preview) are logged but not counted.
const BOT_UA = /bot|crawl|spider|slurp|preview|facebookexternalhit|facebookcatalog|meta-externalagent|whatsapp|telegram|discord|embedly|curl|wget|python-requests|headless/i;

export function isBotUserAgent(ua: string | null | undefined): boolean {
  return !ua || BOT_UA.test(ua);
}

// ?s=<source> is set by DM links (rule key) or by hand (bio, story); anything else is dropped.
export function cleanSource(value: string | null | undefined): string | null {
  if (!value) return null;
  const s = value.toLowerCase().slice(0, 40);
  return /^[a-z0-9_-]+$/.test(s) ? s : null;
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]{1,48}$/.test(slug);
}

export function shortLinkUrl(slug: string, source?: string): string {
  return `${SITE.url}/go/${slug}${source ? `?s=${encodeURIComponent(source)}` : ''}`;
}
