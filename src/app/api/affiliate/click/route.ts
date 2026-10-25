import { NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      productId = 'unknown',
      productName = 'Unknown Product',
      asin = '',
      contentSlug = 'site',
      placement = 'card',
      device = 'desktop',
    } = body;

    const store = readStore();
    store.affiliateClicks.unshift({
      id: `clk-${Date.now()}`,
      productId: String(productId),
      productName: String(productName),
      asin: String(asin),
      contentSlug: String(contentSlug),
      placement: String(placement),
      timestamp: new Date().toISOString(),
      device: String(device),
    });

    // Keep latest 500 click attribution logs
    store.affiliateClicks = store.affiliateClicks.slice(0, 500);
    writeStore(store);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
