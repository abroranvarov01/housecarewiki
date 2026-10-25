import { SITE, absoluteUrl } from './site';
import type { Article, ArticleFAQ, Author, Product, SourceCitation } from './types';

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

function citations(sources: SourceCitation[]): Json[] {
  return sources.map((s) => ({
    '@type': 'CreativeWork',
    name: s.title,
    url: s.url,
    publisher: { '@type': 'Organization', name: s.publisher },
  }));
}

export function articleSchema(article: Article, author: Author, path: string): Json {
  const url = absoluteUrl(path);
  return {
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: article.title,
    description: article.seo.description,
    image: absoluteUrl(article.heroImage),
    datePublished: isoDate(article.publishedAt),
    dateModified: isoDate(article.updatedAt),
    inLanguage: SITE.lang,
    articleSection: article.categoryLabel,
    keywords: article.seo.focusKeyword,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
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
    })),
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
    description: product.summary,
    image: absoluteUrl(product.image),
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

export function webPageSchema(opts: { path: string; name: string; description: string; type?: string; about?: string }): Json {
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
    ...(opts.about ? { about: { '@type': 'Thing', name: opts.about } } : {}),
  };
}

export function graph(...nodes: (Json | null | undefined)[]): Json {
  return { '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) };
}
