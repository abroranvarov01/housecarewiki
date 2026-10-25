import type { DatabaseState } from './store';

// Site navigation is organized by what the visitor is trying to do (fix, choose, browse, use a tool),
// and built from the content store so newly published pages appear without code changes.

export interface NavLink {
  label: string;
  href: string;
  note?: string;
}

export interface NavModel {
  fix: NavLink[];
  choose: NavLink[];
  compare: NavLink[];
  rooms: NavLink[];
  surfaces: NavLink[];
  tools: NavLink[];
}

export const TOOL_LINKS: NavLink[] = [
  { label: 'Stain Solution Finder', href: '/tools/stain-finder', note: 'Steps for your stain and surface' },
  { label: 'Surface Compatibility Checker', href: '/tools/surface-checker', note: 'Is this cleaner safe here?' },
  { label: 'Cleaning Equipment Finder', href: '/tools/equipment-finder', note: 'Which tool fits the job' },
  { label: 'Cleaning Routine Planner', href: '/tools/routine-planner', note: 'A printable weekly plan' },
  { label: 'Cleaning Cost Calculator', href: '/tools/cost-calculator', note: 'Buy, rent or hire?' },
  { label: 'Product Comparison Builder', href: '/compare', note: 'Up to 4 products side by side' },
];

function shortTitle(title: string): string {
  return title.replace(/\s*\(?\b20\d\d\)?\s*$/i, '').replace(/\s+in$/i, '').trim();
}

export function buildNav(store: Pick<DatabaseState, 'articles' | 'comparisons' | 'rooms' | 'products' | 'surfaces'>): NavModel {
  const published = store.articles.filter((a) => a.status === 'Published');
  const name = (id: string) => store.products.find((p) => p.id === id)?.shortName || '';
  return {
    fix: published
      .filter((a) => a.routeType === 'guides')
      .map((a) => ({ label: a.title, href: `/guides/${a.slug}` })),
    choose: published
      .filter((a) => a.routeType === 'best')
      .map((a) => ({ label: shortTitle(a.title), href: `/best/${a.slug}` })),
    compare: store.comparisons.map((c) => ({
      label: `${name(c.productAId)} vs ${name(c.productBId)}`,
      href: `/compare/${c.slug}`,
    })),
    rooms: store.rooms.map((r) => ({ label: r.name, href: `/rooms/${r.slug}` })),
    surfaces: store.surfaces.map((s) => ({ label: s.name, href: `/surfaces/${s.slug}` })),
    tools: TOOL_LINKS,
  };
}
