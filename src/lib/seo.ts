import type { Metadata } from 'next';
import { SITE, absoluteUrl } from './site';

// One builder for every page's metadata: title, description, canonical, robots, OpenGraph, Twitter.
export interface PageSeo {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  ogKicker?: string;
  type?: 'website' | 'article' | 'profile';
  noindex?: boolean;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    section?: string;
    tags?: string[];
    authors?: string[];
  };
}

const TITLE_MAX = 60;

// Brand suffix only when it still fits in ~60 chars, so Google doesn't cut the main part.
export function seoTitle(title: string): Metadata['title'] {
  if (title.includes(SITE.name)) return { absolute: title };
  const branded = `${title} | ${SITE.name}`;
  return branded.length <= TITLE_MAX ? { absolute: branded } : { absolute: title };
}

export const INDEX_ROBOTS: Metadata['robots'] = {
  index: true,
  follow: true,
  'max-snippet': -1,
  'max-image-preview': 'large',
  'max-video-preview': -1,
  googleBot: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
};

export const NOINDEX_ROBOTS: Metadata['robots'] = {
  index: false,
  follow: true,
  googleBot: { index: false, follow: true },
};

// Fits a description into the 140–160 char window: extends short text with `extra`, cuts long text
// at a word boundary.
export function fitDescription(text: string, extra = ''): string {
  let out = text.trim();
  if (out.length < 140 && extra) out = `${out.replace(/[.!?]?$/, '.')} ${extra.trim()}`;
  if (out.length <= 160) return out;
  const cut = out.slice(0, 157);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.\s]+$/, '')}…`;
}

export function buildMetadata(seo: PageSeo): Metadata {
  const url = absoluteUrl(seo.path);
  const image = absoluteUrl(
    seo.image ||
      `${SITE.defaultOgImage}?title=${encodeURIComponent(seo.title)}${
        seo.ogKicker ? `&kicker=${encodeURIComponent(seo.ogKicker)}` : ''
      }`,
  );
  const images = [{ url: image, width: 1200, height: 630, alt: seo.imageAlt || seo.title }];

  return {
    title: seoTitle(seo.title),
    description: seo.description,
    alternates: {
      canonical: url,
      languages: { [SITE.lang]: url, 'x-default': url },
      types: { 'application/rss+xml': [{ url: absoluteUrl('/feed.xml'), title: `${SITE.name} — latest guides` }] },
    },
    robots: seo.noindex ? NOINDEX_ROBOTS : INDEX_ROBOTS,
    openGraph:
      seo.type === 'article'
        ? {
            type: 'article',
            siteName: SITE.name,
            locale: SITE.ogLocale,
            url,
            title: seo.title,
            description: seo.description,
            images,
            publishedTime: seo.article?.publishedTime,
            modifiedTime: seo.article?.modifiedTime,
            section: seo.article?.section,
            tags: seo.article?.tags,
            authors: seo.article?.authors,
          }
        : {
            type: seo.type === 'profile' ? 'profile' : 'website',
            siteName: SITE.name,
            locale: SITE.ogLocale,
            url,
            title: seo.title,
            description: seo.description,
            images,
          },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: [image],
    },
  };
}
