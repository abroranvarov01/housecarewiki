import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { NextResponse } from 'next/server';
import { adminDeniedResponse, checkAdminAuth } from '@/lib/admin-auth';
import { igConfig } from '@/lib/instagram/config';

export const dynamic = 'force-dynamic';

// Raw file upload (body = the file) for scheduled reels: video up to Instagram's 300 MB, or a cover image.
// Returns the stored name to pass to SCHEDULE_POST. Sent by scripts/ig.mjs with the x-hcw-client header.
const MAX_BYTES = 300 * 1024 * 1024;
const EXT: Record<string, string> = { 'video/mp4': '.mp4', 'video/quicktime': '.mov', 'image/jpeg': '.jpg', 'image/png': '.png' };

export async function POST(request: Request) {
  const auth = checkAdminAuth(request.headers.get('authorization'));
  if (auth !== 'ok') return adminDeniedResponse(auth);
  const ext = EXT[(request.headers.get('content-type') || '').split(';')[0].trim()];
  if (!ext) return NextResponse.json({ error: 'Content-Type must be video/mp4, video/quicktime, image/jpeg or image/png' }, { status: 415 });
  if (Number(request.headers.get('content-length') || 0) > MAX_BYTES) return NextResponse.json({ error: 'File over 300 MB' }, { status: 413 });
  if (!request.body) return NextResponse.json({ error: 'Empty body' }, { status: 400 });

  const dir = igConfig().mediaDir;
  fs.mkdirSync(dir, { recursive: true });
  const name = `${crypto.randomUUID()}${ext}`;
  const full = path.join(dir, name);
  let bytes = 0;
  try {
    await pipeline(
      Readable.fromWeb(request.body as import('stream/web').ReadableStream),
      async function* (source: AsyncIterable<Buffer>) {
        for await (const chunk of source) {
          bytes += chunk.length;
          if (bytes > MAX_BYTES) throw new Error('File over 300 MB');
          yield chunk;
        }
      },
      fs.createWriteStream(full)
    );
  } catch (e) {
    fs.rmSync(full, { force: true });
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Upload failed' }, { status: 400 });
  }
  return NextResponse.json({ ok: true, file: name, bytes });
}
