import { NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/store';
import { EditorialStatus } from '@/lib/types';

export async function GET() {
  const store = readStore();
  return NextResponse.json(store);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, payload } = body;
    const store = readStore();

    if (action === 'UPDATE_ARTICLE_STATUS') {
      const { articleId, nextStatus, actor = 'Emily Carter' } = payload;
      const art = store.articles.find((a) => a.id === articleId);
      if (!art) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }
      // Validate critical safety & SEO fields before allowing Published status (Spec Section 13.3)
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
        authorSlug: 'emily-carter',
        updatedAt: 'Oct 23, 2026',
        publishedAt: 'Oct 23, 2026',
        readingTime: '6 min read',
        status: 'Draft' as EditorialStatus,
        evidenceStatus: 'Hands-on Tested' as const,
        heroImage:
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80',
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
        actor: 'Emily Carter',
        role: 'EDITOR',
        action: 'CREATE_ARTICLE_DRAFT',
        resource: cleanSlug,
        details: `Created new ${routeType} draft "${title}".`,
        timestamp: new Date().toISOString(),
      });
      writeStore(store);
      return NextResponse.json({ ok: true, store });
    }

    if (action === 'ADD_REDIRECT') {
      const { fromPath, toPath } = payload;
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
      return NextResponse.json({ ok: true, store });
    }

    if (action === 'RUN_AUTOMATION_JOB') {
      const { jobId } = payload;
      const job = store.automations.find((j) => j.id === jobId);
      if (job) {
        job.lastRun = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
        job.status = 'SUCCESS';
        store.auditLogs.unshift({
          id: `aud-${Date.now()}`,
          actor: 'Owner',
          role: 'OWNER',
          action: 'MANUAL_JOB_TRIGGER',
          resource: job.key,
          details: `Triggered background worker job "${job.name}". Completed with status SUCCESS.`,
          timestamp: new Date().toISOString(),
        });
        writeStore(store);
      }
      return NextResponse.json({ ok: true, store });
    }

    if (action === 'UPDATE_SITE_CONFIG') {
      store.config = { ...store.config, ...payload };
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
      return NextResponse.json({ ok: true, store });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
