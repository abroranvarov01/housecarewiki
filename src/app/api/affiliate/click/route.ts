import { NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/store';

// Anonymous click attribution. Only known products are recorded and every field is length-capped,
// so the public endpoint cannot be used to stuff arbitrary data into the store.
const clip = (v: unknown, max: number) => String(v ?? '').slice(0, max);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const store = readStore();
    const product = store.products.find((p) => p.id === body?.productId);
    if (!product) {
      return NextResponse.json({ error: 'Unknown product' }, { status: 400 });
    }

    store.affiliateClicks.unshift({
      id: `clk-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      asin: product.asin,
      contentSlug: clip(body.contentSlug || 'site', 120),
      placement: clip(body.placement || 'card', 60),
      timestamp: new Date().toISOString(),
      device: body.device === 'mobile' ? 'mobile' : 'desktop',
    });

    // Keep latest 500 click attribution logs
    store.affiliateClicks = store.affiliateClicks.slice(0, 500);
    writeStore(store);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
