import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CheckCircle2, Award } from 'lucide-react';
import { readStore } from '@/lib/store';
import { buildMetadata, fitDescription } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, graph, personSchema, webPageSchema } from '@/lib/schema';

// ISR: pre-rendered, refreshed hourly and on every CMS publish via revalidatePath.
export const revalidate = 3600;

export function generateStaticParams() {
  return readStore().authors.map((x) => ({ slug: x.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const store = readStore();
  const author = store.authors.find((a) => a.slug === params.slug);
  if (!author) return { title: 'Author Not Found' };
  return buildMetadata({
    title: `${author.name}, ${author.role}`,
    description: fitDescription(author.bio),
    path: `/authors/${author.slug}`,
    type: 'profile',
    ogKicker: 'Author',
  });
}

export default function AuthorProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const store = readStore();
  const author = store.authors.find((a) => a.slug === params.slug);
  if (!author) {
    notFound();
  }

  const authoredArticles = store.articles.filter(
    (art) => art.authorSlug === author.slug
  );

  const schema = graph(
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: author.name, path: `/authors/${author.slug}` },
    ]),
    {
      ...webPageSchema({ path: `/authors/${author.slug}`, name: author.name, description: author.bio, type: 'ProfilePage' }),
      mainEntity: personSchema(author),
    },
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <JsonLd data={schema} />
      <nav aria-label="Breadcrumb" className="-mt-4 text-xs text-ink-muted">
        <Link href="/" className="hover:text-forest">
          Home
        </Link>{' '}
        › <span className="text-ink font-medium">{author.name}</span>
      </nav>
      {/* Author Switcher */}
      <div className="flex flex-wrap gap-2">
        {store.authors.map((a) => (
          <Link
            key={a.slug}
            href={`/authors/${a.slug}`}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
              a.slug === author.slug
                ? 'bg-forest text-white border-forest'
                : 'bg-white text-ink-secondary border-paper-border hover:border-forest'
            }`}
          >
            {a.name}
          </Link>
        ))}
      </div>

      {/* Author Bio Card */}
      <div className="bg-white rounded-2xl border border-paper-border p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start gap-6">
        <img
          src={author.avatar}
          loading="lazy"
          decoding="async"
          alt={author.name}
          className="w-24 h-24 rounded-full object-cover border-2 border-forest shadow-sm shrink-0"
        />
        <div className="space-y-3">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-coral">
              Editorial Team & Lab Reviewer
            </span>
            <h1 className="font-editorial text-3xl font-bold text-ink">
              {author.name}
            </h1>
            <p className="text-sm font-semibold text-forest">{author.role}</p>
          </div>
          <p className="text-sm text-ink-secondary leading-relaxed">{author.bio}</p>

          <div className="pt-2 space-y-1.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
              <Award className="w-4 h-4 text-forest" />
              Verified Credentials & Background
            </h2>
            <div className="flex flex-wrap gap-2">
              {author.credentials.map((cred) => (
                <span
                  key={cred}
                  className="inline-flex items-center gap-1.5 bg-paper-light border border-paper-border px-3 py-1 rounded-full text-xs font-medium text-ink"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-forest" />
                  {cred}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Articles by this Author */}
      <section>
        <h2 className="font-editorial text-2xl font-bold text-ink mb-4">
          Published Guides & Reviews by {author.name}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {authoredArticles.map((art) => {
            const href =
              art.routeType === 'best' ? `/best/${art.slug}` : `/guides/${art.slug}`;
            return (
              <Link
                key={art.id}
                href={href}
                className="group bg-white rounded-xl border border-paper-border p-5 shadow-card hover:shadow-elevated transition flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-coral">
                    {art.categoryLabel} · {art.evidenceStatus}
                  </span>
                  <h3 className="font-editorial text-xl font-bold text-ink group-hover:text-forest mt-1">
                    {art.title}
                  </h3>
                  <p className="text-xs text-ink-secondary mt-2 line-clamp-2">
                    {art.subtitle}
                  </p>
                </div>
                <p className="text-[11px] text-ink-muted mt-4 pt-3 border-t border-paper-border">
                  Updated {art.updatedAt} · {art.readingTime}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
