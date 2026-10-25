export type EditorialStatus =
  | 'Idea'
  | 'Research'
  | 'Draft'
  | 'Fact Check'
  | 'Editorial Review'
  | 'SEO Review'
  | 'Approved'
  | 'Scheduled'
  | 'Published'
  | 'Update Required'
  | 'Archived';

export type EvidenceBadge =
  | 'Hands-on Tested'
  | 'Research-Based Review'
  | 'Specifications Overview';

export type ContentCategory =
  | 'CLEANING GUIDE'
  | 'BUYING GUIDE'
  | 'PRACTICAL TIPS'
  | 'TIPS & TRICKS'
  | 'PRODUCT REVIEW'
  | 'SURFACE GUIDE';

export interface Author {
  id: string;
  slug: string;
  // 'team' bylines are emitted as an Organization in structured data, never as a fictional person.
  kind?: 'person' | 'team';
  name: string;
  role: string;
  bio: string;
  credentials: string[];
  avatar: string;
  articlesCount: number;
  testedProductsCount: number;
}

export interface SourceCitation {
  id: string;
  title: string;
  publisher: string;
  url: string;
  type: 'Industry Standard' | 'Manufacturer Manual' | 'Government Standard' | 'Textile Institute';
  accessedDate: string;
  verifiedClaim: string;
}

export interface ProductSpec {
  key: string;
  label: string;
  value: string;
  unit?: string;
  source?: string;
}

export interface Product {
  id: string;
  slug: string;
  brand: string;
  name: string;
  shortName: string;
  model: string;
  asin: string;
  category: 'carpet-cleaners' | 'Bathroom-scrubbers' | 'steam-cleaners' | 'brushes-tools' | 'vacuums' | 'organizers' | 'stain-removers';
  roomSlugs: string[];
  badge?: string;
  bestFor: string;
  // No price, Amazon rating, review count or Prime status is stored: none of it can be shown without the live API.
  amazonUrl: string;
  trackingTag: string;
  image: string;
  evidenceStatus: EvidenceBadge;
  summary: string;
  highlights: string[];
  pros: string[];
  cons: string[];
  surfaces: string[];
  specs: Record<string, string>;
  scores: {
    cleaningPower: number;
    easeOfUse: number;
    buildQuality: number;
    noiseLevel: string;
    valueForMoney: number;
    overall: number;
  };
  whoShouldBuy: string[];
  whoShouldSkip: string[];
  updatedAt: string;
}

export interface GuideStep {
  stepNumber: number;
  title: string;
  instruction: string;
  proTip?: string;
  image?: string;
}

export interface ArticleFAQ {
  question: string;
  answer: string;
}

export interface Article {
  id: string;
  slug: string;
  routeType: 'guides' | 'best' | 'reviews' | 'problems';
  categoryLabel: ContentCategory;
  title: string;
  subtitle: string;
  excerpt: string;
  quickAnswer: string;
  roomSlug: string;
  subCategory: string;
  surfaceSlugs: string[];
  authorSlug: string;
  updatedAt: string;
  publishedAt: string;
  readingTime: string;
  status: EditorialStatus;
  evidenceStatus: EvidenceBadge;
  heroImage: string;
  heroImageAlt: string;
  handwrittenBadge?: string;
  testedBadge?: boolean;
  safetyWarnings: string[];
  materialsNeeded?: string[];
  steps?: GuideStep[];
  ifMethodFails?: string[];
  topPickProductId?: string;
  recommendedProductIds: string[];
  testingCriteria?: {
    icon: string;
    title: string;
    description: string;
  }[];
  buyingGuideSections?: {
    heading: string;
    body: string;
  }[];
  faqs: ArticleFAQ[];
  sources: SourceCitation[];
  seo: {
    title: string;
    description: string;
    canonical: string;
    indexable: boolean;
    focusKeyword: string;
  };
}

export interface RoomCategory {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  heroImage: string;
  cardImage: string;
  subCategories: {
    id: string;
    label: string;
    icon: string;
  }[];
  featuredProductIds: string[];
  communityResults: {
    id: string;
    quote: string;
    authorName: string;
    role: string;
    avatar: string;
    beforeImage: string;
    afterImage: string;
    surfaceLabel: string;
    productUsed?: string;
  }[];
}

export interface SurfaceGuide {
  slug: string;
  name: string;
  category: string;
  summary: string;
  image: string;
  safeAgents: string[];
  unsafeAgents: { agent: string; reason: string }[];
  routineCare: string[];
  deepCleanSteps: string[];
  recommendedProductIds: string[];
}

export interface ComparisonEntry {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  productAId: string;
  productBId: string;
  winnerId: string;
  verdict: string;
  keyDifferences: string[];
  scenarios: {
    scenario: string;
    winnerId: string;
    explanation: string;
  }[];
}

export interface ScheduledAutomation {
  id: string;
  key: string;
  name: string;
  description: string;
  schedule: string;
  enabled: boolean;
  lastRun: string;
  nextRun: string;
  status: 'SUCCESS' | 'RUNNING' | 'WARNING' | 'NOT_CONFIGURED';
  lastSummary: string;
}

export interface RedirectRule {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: 301 | 302;
  hits: number;
  createdAt: string;
}

export interface AffiliateClickEvent {
  id: string;
  productId: string;
  productName: string;
  asin: string;
  contentSlug: string;
  placement: string;
  timestamp: string;
  device: string;
}
