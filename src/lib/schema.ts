import { SITE, absoluteUrl } from './site';
import type { Article, ArticleFAQ, Author, Product, SourceCitation, SurfaceGuide } from './types';

// JSON-LD generators. Every node links back to the Organization / WebSite via @id.
export const ORG_ID = `${SITE.url}/#organization`;
export const WEBSITE_ID = `${SITE.url}/#website`;

type Json = Record<string, unknown>;

// Content dates are stored as "Oct 20, 2026" or "2026-10-20"; schema/OG/sitemap need ISO dates.
export function isoDate(value: string): string {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00Z`) : new Date(`${value} UTC`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toISOString().slice(0, 10);
}

export function organizationSchema(): Json {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    email: SITE.email,
    description: SITE.description,
    foundingDate: SITE.foundingDate,
    logo: { '@type': 'ImageObject', url: absoluteUrl(SITE.logo), width: 512, height: 512 },
    image: absoluteUrl(SITE.logo),
    areaServed: { '@type': 'Country', name: SITE.areaServed },
    knowsAbout: SITE.knowsAbout,
    // Publisher trust signals: how we write, fix mistakes, test products and get paid.
    publishingPrinciples: absoluteUrl(SITE.policies.publishingPrinciples),
    correctionsPolicy: absoluteUrl(SITE.policies.correctionsPolicy),
    actionableFeedbackPolicy: absoluteUrl(SITE.policies.correctionsPolicy),
    ownershipFundingInfo: absoluteUrl(SITE.policies.ownershipFundingInfo),
    contactPoint: { '@type': 'ContactPoint', contactType: 'editorial', email: SITE.email, availableLanguage: 'English' },
    ...(SITE.sameAs.length ? { sameAs: SITE.sameAs } : {}),
  };
}

export function websiteSchema(): Json {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE.name,
    url: SITE.url,
    inLanguage: SITE.lang,
    publisher: { '@id': ORG_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function personId(author: Author): string {
  return `${absoluteUrl(`/authors/${author.slug}`)}#person`;
}

export function personSchema(author: Author): Json {
  if (author.kind === 'team') {
    return {
      '@type': 'Organization',
      '@id': personId(author),
      name: author.name,
      description: author.bio,
      url: absoluteUrl(`/authors/${author.slug}`),
      parentOrganization: { '@id': ORG_ID },
    };
  }
  return {
    '@type': 'Person',
    '@id': personId(author),
    name: author.name,
    jobTitle: author.role,
    description: author.bio,
    url: absoluteUrl(`/authors/${author.slug}`),
    image: author.avatar,
    worksFor: { '@id': ORG_ID },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): Json {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

// Government standards (EPA, CPSC…) are cited as GovernmentOrganization publications, the rest as Organization.
function citations(sources: SourceCitation[]): Json[] {
  return sources.map((s) => ({
    '@type': 'CreativeWork',
    name: s.title,
    url: s.url,
    publisher: { '@type': s.type === 'Government Standard' ? 'GovernmentOrganization' : 'Organization', name: s.publisher },
  }));
}

function reviewNode(reviewer: Author): Json {
  return {
    '@type': reviewer.kind === 'team' ? 'Organization' : 'Person',
    '@id': personId(reviewer),
    name: reviewer.name,
    url: absoluteUrl(`/authors/${reviewer.slug}`),
    ...(reviewer.kind === 'team' ? {} : { jobTitle: reviewer.role }),
  };
}

// The rooms and surfaces an article covers, as plain Things: helps engines file the page under the right topics.
function topics(article: Article, roomName?: string): Json[] {
  return [
    ...(roomName ? [{ '@type': 'Thing', name: roomName }] : []),
    ...article.surfaceSlugs.map((s) => ({ '@type': 'Thing', name: s.replace(/-/g, ' ') })),
  ];
}

export function articleSchema(
  article: Article,
  author: Author,
  path: string,
  opts: { reviewer?: Author; roomName?: string } = {},
): Json {
  const url = absoluteUrl(path);
  const about = topics(article, opts.roomName);
  return {
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: article.title,
    alternativeHeadline: article.subtitle,
    description: article.seo.description,
    abstract: article.quickAnswer,
    image: { '@type': 'ImageObject', url: absoluteUrl(article.heroImage), caption: article.heroImageAlt },
    datePublished: isoDate(article.publishedAt),
    dateModified: isoDate(article.updatedAt),
    inLanguage: SITE.lang,
    articleSection: article.categoryLabel,
    keywords: article.seo.focusKeyword,
    isAccessibleForFree: true,
    ...(about.length ? { about } : {}),
    // reviewedBy / lastReviewed belong to WebPage in schema.org, not Article.
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
      ...(opts.reviewer && article.reviewedBy
        ? { reviewedBy: reviewNode(opts.reviewer), lastReviewed: isoDate(article.reviewedBy.reviewedAt) }
        : {}),
    },
    author: personSchema(author),
    publisher: { '@id': ORG_ID },
    isPartOf: { '@id': WEBSITE_ID },
    ...(article.sources.length ? { citation: citations(article.sources) } : {}),
  };
}

// Built from the same FAQ array the page renders, so the markup matches the visible text exactly.
export function faqSchema(faqs: ArticleFAQ[]): Json | null {
  if (!faqs.length) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function howToSchema(article: Article, path: string): Json | null {
  if (!article.steps?.length) return null;
  return {
    '@type': 'HowTo',
    name: article.title,
    description: article.quickAnswer,
    image: absoluteUrl(article.heroImage),
    ...(article.materialsNeeded?.length
      ? { supply: article.materialsNeeded.map((m) => ({ '@type': 'HowToSupply', name: m })) }
      : {}),
    step: article.steps.map((s) => ({
      '@type': 'HowToStep',
      position: s.stepNumber,
      name: s.title,
      text: s.instruction,
      url: `${absoluteUrl(path)}#step-${s.stepNumber}`,
      ...(s.image ? { image: absoluteUrl(s.image) } : {}),
    })),
  };
}

// Surface care pages: the visible deep-clean steps as a HowTo, the agents to avoid as safety notes.
export function surfaceHowToSchema(surface: SurfaceGuide, path: string): Json | null {
  if (!surface.deepCleanSteps.length) return null;
  const url = absoluteUrl(path);
  return {
    '@type': 'HowTo',
    '@id': `${url}#howto`,
    name: `How to deep clean ${surface.name.toLowerCase()}`,
    description: surface.summary,
    ...(surface.image ? { image: absoluteUrl(surface.image) } : {}),
    ...(surface.safeAgents.length
      ? { supply: surface.safeAgents.map((a) => ({ '@type': 'HowToSupply', name: a })) }
      : {}),
    step: surface.deepCleanSteps.map((text, i) => ({ '@type': 'HowToStep', position: i + 1, text })),
  };
}

export function itemListSchema(name: string, items: { name: string; path: string }[]): Json {
  return {
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}

// Editorial review of a third-party product (allowed for review snippets). No Amazon ratings, no offers:
// prices may only come from the Creators API.
export function productReviewSchema(product: Product, author: Author): Json {
  const url = absoluteUrl(`/products/${product.slug}`);
  return {
    '@type': 'Product',
    '@id': `${url}#product`,
    name: product.name,
    brand: { '@type': 'Brand', name: product.brand },
    model: product.model,
    sku: product.asin,
    category: product.category.replace(/-/g, ' '),
    description: product.summary,
    image: absoluteUrl(product.image),
    // The same spec table the page shows.
    ...(Object.keys(product.specs).length
      ? {
          additionalProperty: Object.entries(product.specs).map(([name, value]) => ({
            '@type': 'PropertyValue',
            name,
            value,
          })),
        }
      : {}),
    review: {
      '@type': 'Review',
      reviewRating: { '@type': 'Rating', ratingValue: product.scores.overall, bestRating: 10, worstRating: 0 },
      author: { '@id': personId(author), '@type': author.kind === 'team' ? 'Organization' : 'Person', name: author.name },
      publisher: { '@id': ORG_ID },
      datePublished: isoDate(product.updatedAt),
      positiveNotes: {
        '@type': 'ItemList',
        itemListElement: product.pros.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p })),
      },
      negativeNotes: {
        '@type': 'ItemList',
        itemListElement: product.cons.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c })),
      },
    },
  };
}

// `aboutId` points at another node in the graph (a tool, a HowTo) as the page's main subject.
export function webPageSchema(opts: {
  path: string;
  name: string;
  description: string;
  type?: string;
  about?: string;
  aboutId?: string;
  image?: string;
}): Json {
  const url = absoluteUrl(opts.path);
  return {
    '@type': opts.type || 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: opts.name,
    description: opts.description,
    inLanguage: SITE.lang,
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORG_ID },
    ...(opts.aboutId
      ? { about: { '@id': opts.aboutId }, mainEntity: { '@id': opts.aboutId } }
      : opts.about
        ? { about: { '@type': 'Thing', name: opts.about } }
        : {}),
    ...(opts.image ? { primaryImageOfPage: { '@type': 'ImageObject', url: absoluteUrl(opts.image) } } : {}),
  };
}

export function graph(...nodes: (Json | null | undefined)[]): Json {
  return { '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) };
}
