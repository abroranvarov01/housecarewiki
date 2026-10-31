import { NextResponse } from 'next/server';
import { adminDeniedResponse, checkAdminAuth } from '@/lib/admin-auth';
import { AdminInputError, overview, runAction } from '@/lib/instagram/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = checkAdminAuth(request.headers.get('authorization'));
  if (auth !== 'ok') return adminDeniedResponse(auth);
  return NextResponse.json(await overview());
}

export async function POST(request: Request) {
  const auth = checkAdminAuth(request.headers.get('authorization'));
  if (auth !== 'ok') return adminDeniedResponse(auth);
  let body: { action?: unknown; payload?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  try {
    const payload = body.payload && typeof body.payload === 'object' ? (body.payload as Record<string, unknown>) : {};
    return NextResponse.json({ ok: true, result: await runAction(String(body.action), payload) });
  } catch (e) {
    if (e instanceof AdminInputError) return NextResponse.json({ error: e.message }, { status: 400 });
    console.error('[ig:admin]', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Server error' }, { status: 500 });
  }
}
