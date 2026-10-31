import { NextResponse } from 'next/server';
import { igConfig } from '@/lib/instagram/config';
import { handleInboundMessages, ingestComments, processPendingComments } from '@/lib/instagram/processor';
import { parseWebhook, verifySignature } from '@/lib/instagram/webhook';

export const dynamic = 'force-dynamic';

// Meta's verification handshake when the callback URL is saved in the App Dashboard.
export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const { verifyToken } = igConfig();
  if (verifyToken && params.get('hub.mode') === 'subscribe' && params.get('hub.verify_token') === verifyToken) {
    return new Response(params.get('hub.challenge') ?? '', { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }
  return new Response('Forbidden', { status: 403 });
}

export async function POST(request: Request) {
  const raw = await request.text();
  const cfg = igConfig();
  if (!verifySignature(raw, request.headers.get('x-hub-signature-256'), cfg.appSecrets)) {
    console.warn('[ig] webhook with a bad or missing signature rejected');
    return new Response('Bad signature', { status: 401 });
  }
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response('Bad JSON', { status: 400 });
  }
  const { comments, messages } = parseWebhook(body);
  // Store first, answer 200 right away, then do the slow API calls. The cron tick picks up anything left.
  const added = await ingestComments(comments, 'webhook');
  if (added > 0) void processPendingComments().catch((e) => console.error('[ig] processing failed', e));
  if (messages.length > 0) void handleInboundMessages(messages).catch((e) => console.error('[ig] message handling failed', e));
  return NextResponse.json({ ok: true, comments: comments.length, new: added, messages: messages.length });
}
