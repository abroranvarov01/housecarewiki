import fs from 'fs';
import path from 'path';
import {
  AUTHORS,
  PRODUCTS,
  ROOM_CATEGORIES,
  ARTICLES,
  SURFACE_GUIDES,
  COMPARISONS,
  SCHEDULED_AUTOMATIONS,
  INITIAL_REDIRECTS,
  INITIAL_AFFILIATE_CLICKS,
} from './seed-data';
import {
  Author,
  Product,
  RoomCategory,
  Article,
  SurfaceGuide,
  ComparisonEntry,
  ScheduledAutomation,
  RedirectRule,
  AffiliateClickEvent,
} from './types';

export interface AuditLogEntry {
  id: string;
  actor: string;
  role: string;
  action: string;
  resource: string;
  details: string;
  timestamp: string;
}

export interface SiteConfiguration {
  siteName: string;
  domain: string;
  amazonPartnerTag: string;
  creatorsApiConnected: boolean;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroHandwritten: string;
  featuredGuideSlug: string;
}

export interface DatabaseState {
  config: SiteConfiguration;
  authors: Author[];
  products: Product[];
  rooms: RoomCategory[];
  articles: Article[];
  surfaces: SurfaceGuide[];
  comparisons: ComparisonEntry[];
  automations: ScheduledAutomation[];
  redirects: RedirectRule[];
  affiliateClicks: AffiliateClickEvent[];
  subscribers: { email: string; subscribedAt: string; status: string }[];
  auditLogs: AuditLogEntry[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');
const STORE_VERSION = '3.1-editorial';

// Seed demo records shipped by earlier versions; they are dropped on migration so admin only shows real data.
const DEMO_IDS = new Set(['clk-1', 'clk-2', 'clk-3', 'aud-1', 'aud-2']);
const DEMO_EMAILS = new Set(['sarah.k@example.com', 'mike.r@example.com']);

function getInitialState(): DatabaseState & { version: string } {
  return {
    version: STORE_VERSION,
    config: {
      siteName: 'HouseCareWiki',
      domain: 'housecarewiki.com',
      amazonPartnerTag: 'housecarewiki-20',
      creatorsApiConnected: false,
      heroBadge: 'The home field guide',
      heroTitle: 'What needs fixing today?',
      heroSubtitle:
        'Step-by-step fixes for stains, grime and clutter, with honest notes on which tools are worth buying.',
      heroHandwritten: '',
      featuredGuideSlug: 'how-to-remove-coffee-stains-from-fabric-sofa',
    },
    authors: AUTHORS,
    products: PRODUCTS,
    rooms: ROOM_CATEGORIES,
    articles: ARTICLES,
    surfaces: SURFACE_GUIDES,
    comparisons: COMPARISONS,
    automations: SCHEDULED_AUTOMATIONS,
    redirects: INITIAL_REDIRECTS,
    affiliateClicks: INITIAL_AFFILIATE_CLICKS,
    subscribers: [],
    auditLogs: [],
  };
}

// New content versions replace seeded content, but data collected at runtime (subscribers, affiliate clicks,
// redirects and audit history added through the CMS) is carried over instead of being wiped.
function migrateStore(old: Partial<DatabaseState>): DatabaseState & { version: string } {
  const fresh = getInitialState();
  const seededRedirects = new Set(fresh.redirects.map((r) => r.fromPath));
  return {
    ...fresh,
    config: {
      ...fresh.config,
      amazonPartnerTag: old.config?.amazonPartnerTag || fresh.config.amazonPartnerTag,
      creatorsApiConnected: Boolean(old.config?.creatorsApiConnected),
    },
    subscribers: (old.subscribers || []).filter((s) => !DEMO_EMAILS.has(s.email)),
    affiliateClicks: (old.affiliateClicks || []).filter((c) => !DEMO_IDS.has(c.id)),
    auditLogs: (old.auditLogs || []).filter((a) => !DEMO_IDS.has(a.id)),
    redirects: [...fresh.redirects, ...(old.redirects || []).filter((r) => !seededRedirects.has(r.fromPath))],
  };
}

export function readStore(): DatabaseState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_PATH)) {
      const initial = getInitialState();
      fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as DatabaseState & { version?: string };
    if (parsed.version !== STORE_VERSION) {
      const migrated = migrateStore(parsed);
      fs.writeFileSync(STORE_PATH, JSON.stringify(migrated, null, 2), 'utf-8');
      return migrated;
    }
    return parsed;
  } catch {
    return getInitialState();
  }
}

export function writeStore(state: DatabaseState): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist store:', err);
  }
}

export function getArticleBySlug(slug: string): Article | undefined {
  const store = readStore();
  return store.articles.find((a) => a.slug === slug);
}

export function getProductBySlug(slug: string): Product | undefined {
  const store = readStore();
  return store.products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  const store = readStore();
  return store.products.find((p) => p.id === id);
}

export function getRoomBySlug(slug: string): RoomCategory | undefined {
  const store = readStore();
  return store.rooms.find((r) => r.slug === slug);
}

export function getSurfaceBySlug(slug: string): SurfaceGuide | undefined {
  const store = readStore();
  return store.surfaces.find((s) => s.slug === slug);
}

export function getAuthorBySlug(slug: string): Author | undefined {
  const store = readStore();
  return store.authors.find((a) => a.slug === slug);
}

export function searchEverything(query: string, categoryFilter?: string) {
  const store = readStore();
  const q = query.trim().toLowerCase();

  const synonyms: Record<string, string[]> = {
    couch: ['sofa', 'upholstery', 'cushion', 'furniture'],
    sofa: ['couch', 'upholstery', 'furniture'],
    dog: ['pet', 'fur', 'hair', 'urine'],
    cat: ['pet', 'fur', 'hair'],
    shower: ['bathroom', 'tub', 'tile', 'grout', 'mold', 'glass'],
    rug: ['carpet', 'floor', 'extractor'],
    sink: ['kitchen', 'under sink', 'organizer', 'cabinet'],
  };

  const expandedTerms = new Set<string>(q.split(/\s+/).filter(Boolean));
  expandedTerms.forEach((term) => {
    if (synonyms[term]) {
      synonyms[term].forEach((syn) => expandedTerms.add(syn));
    }
  });

  const terms = Array.from(expandedTerms);

  const matchedArticles = store.articles.filter((art) => {
    if (categoryFilter && categoryFilter !== 'all' && art.roomSlug !== categoryFilter) {
      return false;
    }
    if (!q) return true;
    const hay = `${art.title} ${art.subtitle} ${art.quickAnswer} ${art.roomSlug} ${art.surfaceSlugs.join(' ')}`.toLowerCase();
    return terms.some((t) => hay.includes(t));
  });

  const matchedProducts = store.products.filter((prod) => {
    if (categoryFilter && categoryFilter !== 'all' && !prod.roomSlugs.includes(categoryFilter)) {
      return false;
    }
    if (!q) return true;
    const hay = `${prod.name} ${prod.brand} ${prod.bestFor} ${prod.summary} ${prod.surfaces.join(' ')}`.toLowerCase();
    return terms.some((t) => hay.includes(t));
  });

  const matchedSurfaces = store.surfaces.filter((surf) => {
    if (!q) return true;
    const hay = `${surf.name} ${surf.summary} ${surf.category}`.toLowerCase();
    return terms.some((t) => hay.includes(t));
  });

  return {
    query,
    articles: matchedArticles,
    products: matchedProducts,
    surfaces: matchedSurfaces,
    totalCount: matchedArticles.length + matchedProducts.length + matchedSurfaces.length,
  };
}
