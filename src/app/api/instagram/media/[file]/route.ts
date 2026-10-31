import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { igConfig } from '@/lib/instagram/config';

export const dynamic = 'force-dynamic';

// Public HTTPS URL that Instagram downloads a scheduled reel (video_url) and its cover (cover_url) from.
// File names are random UUIDs given at upload, so nothing else in .data can be reached through here.
const TYPES: Record<string, string> = { '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png' };
const NAME = /^[0-9a-f-]{36}\.(mp4|mov|jpg|jpeg|png)$/;

function serve(request: Request, file: string, withBody: boolean): Response {
  if (!NAME.test(file)) return new Response('Not found', { status: 404 });
  const full = path.join(igConfig().mediaDir, file);
  let size: number;
  try {
    size = fs.statSync(full).size;
  } catch {
    return new Response('Not found', { status: 404 });
  }
  const headers: Record<string, string> = {
    'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=3600',
    'X-Robots-Tag': 'noindex, nofollow',
  };
  const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get('range') || '');
  let start = 0;
  let end = size - 1;
  let status = 200;
  if (range && (range[1] || range[2])) {
    start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
    end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    if (start > end || start >= size) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
    status = 206;
    headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
  }
  headers['Content-Length'] = String(end - start + 1);
  if (!withBody) return new Response(null, { status, headers });
  const stream = Readable.toWeb(fs.createReadStream(full, { start, end })) as ReadableStream;
  return new Response(stream, { status, headers });
}

export function GET(request: Request, { params }: { params: { file: string } }) {
  return serve(request, params.file, true);
}

export function HEAD(request: Request, { params }: { params: { file: string } }) {
  return serve(request, params.file, false);
}
