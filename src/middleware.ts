import { NextRequest, NextResponse } from 'next/server';

// HTTP Basic auth for the editorial CMS (/admin) and its API (/api/admin/*).
// Credentials come from ADMIN_USER / ADMIN_PASSWORD. If no password is configured the
// admin area is closed entirely (fail closed) instead of being left open to the internet.

function safeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

const NOINDEX = { 'X-Robots-Tag': 'noindex, nofollow' };

function unauthorized() {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: { ...NOINDEX, 'WWW-Authenticate': 'Basic realm="HouseCareWiki Admin", charset="UTF-8"' },
  });
}

export function middleware(request: NextRequest) {
  const expectedUser = process.env.ADMIN_USER || 'admin';
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedPassword) {
    return new NextResponse('Admin is disabled: ADMIN_PASSWORD is not configured.', { status: 503, headers: NOINDEX });
  }

  const header = request.headers.get('authorization') || '';
  if (!header.startsWith('Basic ')) return unauthorized();

  let decoded = '';
  try {
    decoded = atob(header.slice(6));
  } catch {
    return unauthorized();
  }
  const sep = decoded.indexOf(':');
  const user = sep >= 0 ? decoded.slice(0, sep) : '';
  const password = sep >= 0 ? decoded.slice(sep + 1) : '';
  if (!safeEqual(user, expectedUser) || !safeEqual(password, expectedPassword)) {
    return unauthorized();
  }

  // CSRF guard: browsers attach Basic credentials automatically, so writes must be
  // same-origin JSON requests (cross-site forms cannot send application/json without CORS).
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const origin = request.headers.get('origin');
    const contentType = request.headers.get('content-type') || '';
    if ((origin && origin !== request.nextUrl.origin) || !contentType.includes('application/json')) {
      return new NextResponse('Forbidden', { status: 403, headers: NOINDEX });
    }
  }

  const response = NextResponse.next();
  response.headers.set('X-Robots-Tag', NOINDEX['X-Robots-Tag']);
  return response;
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin/:path*'],
};
