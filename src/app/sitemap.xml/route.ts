import { readStore } from '@/lib/store';
import { absoluteUrl } from '@/lib/site';
import { isoDate } from '@/lib/schema';

// Hand-built sitemap so every URL can carry its images (image sitemap) and a real lastmod.
// Only indexable 200 pages are listed; lastmod is the newest content date behind each page.
export const revalidate = 3600;

interface Entry {
  path: string;
  lastmod?: string;
  images?: { loc: string; title?: string }[];
}

const TOOL_SLUGS = ['stain-finder', 'equipment-finder', 'routine-planner', 'cost-calculator', 'surface-checker'];
const STATIC_PAGES = ['/products', '/tools', '/about',
  '/methodology', '/editorial-policy', '/affiliate-disclosure', '/privacy', '/terms'];

function newest(dates: (string | undefined)[]): string | undefined {
  const iso = dates.filter(Boolean).map((d) => isoDate(d as string)).sort();
  return iso[iso.length - 1];
}

function esc(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function GET() {
  const store = readStore();
  const articles = store.articles.filter(
    (a) => a.status === 'Published' && a.seo.indexable && (a.routeType === 'guides' || a.routeType === 'best'),
  );
  const productDate = new Map(store.products.map((p) => [p.id, p.updatedAt]));

  const entries: Entry[] = [];
  const allDates = [...articles.map((a) => a.updatedAt), ...store.products.map((p) => p.updatedAt)];

  entries.push({ path: '/', lastmod: newest(allDates) });
  for (const path of STATIC_PAGES) {
    entries.push({ path, lastmod: path === '/products' ? newest(store.products.map((p) => p.updatedAt)) : undefined });
  }
  for (const slug of TOOL_SLUGS) entries.push({ path: `/tools/${slug}` });

  for (const a of articles) {
    entries.push({
      path: `/${a.routeType}/${a.slug}`,
      lastmod: isoDate(a.updatedAt),
      images: [{ loc: a.heroImage, title: a.heroImageAlt }],
    });
  }

  for (const r of store.rooms) {
    const roomArticles = articles.filter((a) => a.roomSlug === r.slug);
    const roomProducts = store.products.filter((p) => p.roomSlugs.includes(r.slug));
    // Empty sections join the sitemap automatically once they get content.
    if (!roomArticles.length && !roomProducts.length) continue;
    entries.push({
      path: `/rooms/${r.slug}`,
      lastmod: newest([...roomArticles.map((a) => a.updatedAt), ...roomProducts.map((p) => p.updatedAt)]),
      images: [{ loc: r.heroImage, title: r.name }],
    });
  }

  for (const p of store.products) {
    entries.push({ path: `/products/${p.slug}`, lastmod: isoDate(p.updatedAt), images: [{ loc: p.image, title: p.name }] });
  }

  for (const s of store.surfaces) {
    entries.push({
      path: `/surfaces/${s.slug}`,
      lastmod: newest(s.recommendedProductIds.map((id) => productDate.get(id))),
      images: s.image ? [{ loc: s.image, title: s.name }] : undefined,
    });
  }

  for (const c of store.comparisons) {
    entries.push({ path: `/compare/${c.slug}`, lastmod: newest([productDate.get(c.productAId), productDate.get(c.productBId)]) });
  }

  for (const au of store.authors) {
    const own = articles.filter((a) => a.authorSlug === au.slug);
    if (!own.length) continue;
    entries.push({ path: `/authors/${au.slug}`, lastmod: newest(own.map((a) => a.updatedAt)) });
  }

  const body = entries
    .map((e) => {
      const images = (e.images || [])
        .map(
          (img) =>
            `<image:image><image:loc>${esc(absoluteUrl(img.loc))}</image:loc>${
              img.title ? `<image:title>${esc(img.title)}</image:title>` : ''
            }</image:image>`,
        )
        .join('');
      return `<url><loc>${esc(absoluteUrl(e.path))}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}${images}</url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${body}
</urlset>
`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
