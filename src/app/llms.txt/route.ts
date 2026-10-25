import { readStore } from '@/lib/store';
import { SITE, absoluteUrl } from '@/lib/site';

// llms.txt (llmstxt.org): a plain-markdown map of the site for AI assistants and answer engines,
// built from the same store as the sitemap so it never lists unpublished pages.
export const revalidate = 3600;

export function GET() {
  const store = readStore();
  const published = store.articles.filter((a) => a.status === 'Published' && a.seo.indexable);
  const link = (title: string, path: string, note?: string) =>
    `- [${title}](${absoluteUrl(path)})${note ? `: ${note.replace(/\s+/g, ' ').trim()}` : ''}`;

  const sections: [string, string[]][] = [
    ['How-to guides', published.filter((a) => a.routeType === 'guides').map((a) => link(a.title, `/guides/${a.slug}`, a.quickAnswer || a.seo.description))],
    ['Buying guides', published.filter((a) => a.routeType === 'best').map((a) => link(a.title, `/best/${a.slug}`, a.seo.description))],
    ['Product reviews', store.products.map((p) => link(`${p.name} review`, `/products/${p.slug}`, p.summary))],
    ['Comparisons', store.comparisons.map((c) => link(c.title, `/compare/${c.slug}`, c.subtitle))],
    ['Rooms', store.rooms.map((r) => link(r.name, `/rooms/${r.slug}`, r.tagline))],
    ['Surface care', store.surfaces.map((s) => link(s.name, `/surfaces/${s.slug}`, s.summary))],
    [
      'Free tools',
      [
        link('Stain Solution Finder', '/tools/stain-finder', 'Step-by-step removal for a given stain and surface'),
        link('Surface Compatibility Checker', '/tools/surface-checker', 'Whether a cleaner is safe on a surface'),
        link('Cleaning Equipment Finder', '/tools/equipment-finder', 'Which type of cleaning tool fits a room and job'),
        link('Cleaning Routine Planner', '/tools/routine-planner', 'A printable weekly cleaning plan'),
        link('Cleaning Cost Calculator', '/tools/cost-calculator', 'Buy, rent or hire a carpet cleaner'),
      ],
    ],
    [
      'About and policies',
      [
        link('About', '/about'),
        link('How we evaluate products', '/methodology'),
        link('Editorial and safety policy', '/editorial-policy'),
        link('Affiliate disclosure', '/affiliate-disclosure'),
      ],
    ],
  ];

  const body = `# ${SITE.name}

> ${SITE.description}

${SITE.name} is an independent US home-care guide. Every guide lists its sources, and every product review is labeled with the evidence it is based on (research-based, hands-on tested, or specifications overview). Product links go to Amazon as an Amazon Associate.

${sections
  .filter(([, items]) => items.length)
  .map(([title, items]) => `## ${title}\n\n${items.join('\n')}`)
  .join('\n\n')}
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
