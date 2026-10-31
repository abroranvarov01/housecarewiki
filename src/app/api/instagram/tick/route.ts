import { NextResponse } from 'next/server';
import { igConfig } from '@/lib/instagram/config';
import { runTick } from '@/lib/instagram/tick';

export const dynamic = 'force-dynamic';

// Called every minute by the ig-cron service with "Authorization: Bearer $CRON_SECRET".
export async function POST(request: Request) {
  const { cronSecret } = igConfig();
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  return NextResponse.json(await runTick());
}
