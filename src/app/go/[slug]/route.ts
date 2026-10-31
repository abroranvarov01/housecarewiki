import { db } from '@/lib/db';
import { handleGo, type GoDeps } from '@/lib/go';

export const dynamic = 'force-dynamic';

const deps: GoDeps = {
  findLink: (slug) => db.shortLink.findUnique({ where: { slug }, select: { id: true, asin: true, url: true, isActive: true } }),
  findRuleByKey: (key) => db.igRule.findUnique({ where: { key }, select: { id: true, mediaId: true } }),
  recordClick: async (click) => {
    await db.linkClick.create({ data: click });
  },
};

export function GET(request: Request, { params }: { params: { slug: string } }) {
  return handleGo(request, params.slug, deps);
}

export function HEAD(request: Request, { params }: { params: { slug: string } }) {
  return handleGo(request, params.slug, deps);
}
