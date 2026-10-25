import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { readStore, writeStore } from '@/lib/store';
import { EditorialStatus } from '@/lib/types';
import { adminDeniedResponse, checkAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const EDITORIAL_STATUSES: EditorialStatus[] = [
  'Idea', 'Research', 'Draft', 'Fact Check', 'Editorial Review', 'SEO Review',
  'Approved', 'Scheduled', 'Published', 'Update Required', 'Archived',
];
const CONFIG_KEYS = ['amazonPartnerTag', 'heroBadge', 'heroTitle', 'heroSubtitle', 'heroHandwritten', 'featuredGuideSlug'] as const;

export async function GET(request: Request) {
  const auth = checkAdminAuth(request.headers.get('authorization'));
  if (auth !== 'ok') return adminDeniedResponse(auth);
  const store = readStore();
  return NextResponse.json(store);
}

export async function POST(request: Request) {
  const auth = checkAdminAuth(request.headers.get('authorization'));
  if (auth !== 'ok') return adminDeniedResponse(auth);
  try {
    const body = await request.json();
    const { action, payload } = body;
    const store = readStore();

    if (action === 'UPDATE_ARTICLE_STATUS') {
      const { articleId, nextStatus, actor = 'Admin' } = payload;
      if (!EDITORIAL_STATUSES.includes(nextStatus)) {
        return NextResponse.json({ error: 'Unknown editorial status' }, { status: 400 });
      }
      const art = store.articles.find((a) => a.id === articleId);
      if (!art) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }
      // Block publishing without the fields every public guide needs.
      if (
        nextStatus === 'Published' &&
        (!art.seo.title || !art.quickAnswer || art.safetyWarnings.length === 0)
      ) {
        return NextResponse.json(
          {
            error:
              'Publication blocked: Article must have SEO Title, Quick Answer, and at least 1 Surface Safety Warning.',
          },
          { status: 422 }
        );
      }
      const prevStatus = art.status;
      art.status = nextStatus as EditorialStatus;
      store.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        actor,
        role: 'EDITOR',
        action: 'WORKFLOW_TRANSITION',
        resource: art.slug,
        details: `Changed editorial status from "${prevStatus}" to "${nextStatus}".`,
        timestamp: new Date().toISOString(),
      });
      writeStore(store);
      // Refresh ISR pages and the sitemap right after a CMS change.
      revalidatePath('/', 'layout');
      return NextResponse.json({ ok: true, store });
    }

    if (action === 'CREATE_ARTICLE') {
      const {
        title,
        slug,
        routeType = 'guides',
        categoryLabel = 'CLEANING GUIDE',
        roomSlug = 'bathroom-cleaning',
        quickAnswer,
        safetyWarning,
      } = payload;
      if (typeof title !== 'string' || !title.trim() || typeof quickAnswer !== 'string' || !quickAnswer.trim()) {
        return NextResponse.json({ error: 'Title and quick answer are required.' }, { status: 400 });
      }

      const cleanSlug = String(slug || title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const newArt = {
        id: `art-${Date.now()}`,
        slug: cleanSlug,
        routeType,
        categoryLabel,
        title,
        subtitle: quickAnswer.slice(0, 140),
        excerpt: quickAnswer.slice(0, 120),
        quickAnswer,
        roomSlug,
        subCategory: 'all',
        surfaceSlugs: ['ceramic-tile'],
        authorSlug: 'housecarewiki-editors',
        updatedAt: new Date().toISOString().slice(0, 10),
        publishedAt: new Date().toISOString().slice(0, 10),
        readingTime: '6 min read',
        status: 'Draft' as EditorialStatus,
        evidenceStatus: 'Research-Based Review' as const,
        heroImage: '/images/cat-bathroom.webp',
        heroImageAlt: title,
        safetyWarnings: [
          safetyWarning ||
            'Always spot-test cleaning solutions in an inconspicuous area before full application.',
        ],
        materialsNeeded: ['Clean white microfiber cloths', 'pH-neutral cleaner'],
        steps: [
          {
            stepNumber: 1,
            title: 'Prepare and Spot-Test Surface',
            instruction: quickAnswer,
          },
        ],
        recommendedProductIds: ['prod-bissell-little-green', 'prod-electric-spin-scrubber'],
        faqs: [],
        sources: [],
        seo: {
          title: `${title} (2026 Guide)`,
          description: quickAnswer.slice(0, 155),
          canonical: `https://housecarewiki.com/${routeType}/${cleanSlug}`,
          indexable: true,
          focusKeyword: title.toLowerCase(),
        },
      };

      store.articles.unshift(newArt);
      store.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        actor: 'Admin',
        role: 'EDITOR',
        action: 'CREATE_ARTICLE_DRAFT',
        resource: cleanSlug,
        details: `Created new ${routeType} draft "${title}".`,
        timestamp: new Date().toISOString(),
      });
      writeStore(store);
      // Refresh ISR pages and the sitemap right after a CMS change.
      revalidatePath('/', 'layout');
      return NextResponse.json({ ok: true, store });
    }

    if (action === 'ADD_REDIRECT') {
      const { fromPath, toPath } = payload;
      if (typeof fromPath !== 'string' || !fromPath.startsWith('/') || typeof toPath !== 'string' || !toPath.startsWith('/')) {
        return NextResponse.json({ error: 'Redirect paths must start with "/".' }, { status: 400 });
      }
      store.redirects.unshift({
        id: `red-${Date.now()}`,
        fromPath: String(fromPath).trim(),
        toPath: String(toPath).trim(),
        statusCode: 301,
        hits: 0,
        createdAt: new Date().toISOString().slice(0, 10),
      });
      store.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        actor: 'SEO Manager',
        role: 'SEO_MANAGER',
        action: 'CREATE_301_REDIRECT',
        resource: `${fromPath} -> ${toPath}`,
        details: 'Added permanent 301 redirect rule.',
        timestamp: new Date().toISOString(),
      });
      writeStore(store);
      // Refresh ISR pages and the sitemap right after a CMS change.
      revalidatePath('/', 'layout');
      return NextResponse.json({ ok: true, store });
    }

    if (action === 'RUN_AUTOMATION_JOB') {
      const { jobId } = payload;
      const job = store.automations.find((j) => j.id === jobId);
      if (job) {
        // There is no job runner in this deployment: record the request instead of reporting a fake success.
        job.status = 'NOT_CONFIGURED';
        store.auditLogs.unshift({
          id: `aud-${Date.now()}`,
          actor: 'Owner',
          role: 'OWNER',
          action: 'MANUAL_JOB_TRIGGER',
          resource: job.key,
          details: `Requested job "${job.name}". Not run: no background job runner is configured.`,
          timestamp: new Date().toISOString(),
        });
        writeStore(store);
        // Refresh ISR pages and the sitemap right after a CMS change.
        revalidatePath('/', 'layout');
      }
      return NextResponse.json({ ok: true, store });
    }

    if (action === 'UPDATE_SITE_CONFIG') {
      const updates: Record<string, string> = {};
      for (const key of CONFIG_KEYS) {
        if (typeof payload?.[key] === 'string') updates[key] = payload[key].slice(0, 300);
      }
      store.config = { ...store.config, ...updates };
      store.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        actor: 'Owner',
        role: 'OWNER',
        action: 'UPDATE_SITE_SETTINGS',
        resource: 'site_config',
        details: `Updated homepage/affiliate configuration (Partner Tag: ${store.config.amazonPartnerTag}).`,
        timestamp: new Date().toISOString(),
      });
      writeStore(store);
      // Refresh ISR pages and the sitemap right after a CMS change.
      revalidatePath('/', 'layout');
      return NextResponse.json({ ok: true, store });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
