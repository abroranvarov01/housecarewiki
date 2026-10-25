import { readStore } from '@/lib/store';
import { SITE, absoluteUrl } from '@/lib/site';
import { isoDate } from '@/lib/schema';

// RSS 2.0 feed of published guides and buying guides, newest first. Linked from every page's <head>
// so feed readers and aggregators pick up new articles without waiting for a sitemap crawl.
export const revalidate = 3600;

function esc(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const rfc822 = (date: string) => new Date(`${isoDate(date)}T00:00:00Z`).toUTCString();

export function GET() {
  const store = readStore();
  const articles = store.articles
    .filter((a) => a.status === 'Published' && a.seo.indexable && (a.routeType === 'guides' || a.routeType === 'best'))
    .sort((a, b) => isoDate(b.updatedAt).localeCompare(isoDate(a.updatedAt)));

  const items = articles
    .map((a) => {
      const url = absoluteUrl(`/${a.routeType}/${a.slug}`);
      const author = store.authors.find((au) => au.slug === a.authorSlug);
      return `<item>
<title>${esc(a.title)}</title>
<link>${url}</link>
<guid isPermaLink="true">${url}</guid>
<description>${esc(a.seo.description)}</description>
<category>${esc(a.categoryLabel)}</category>
${author ? `<dc:creator>${esc(author.name)}</dc:creator>\n` : ''}<pubDate>${rfc822(a.publishedAt)}</pubDate>
</item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
<title>${esc(SITE.name)}</title>
<link>${SITE.url}</link>
<description>${esc(SITE.description)}</description>
<language>${SITE.lang.toLowerCase()}</language>
<atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml" />
${articles[0] ? `<lastBuildDate>${rfc822(articles[0].updatedAt)}</lastBuildDate>\n` : ''}${items}
</channel>
</rss>
`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
