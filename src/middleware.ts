import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_NOINDEX, adminDeniedResponse, checkAdminAuth } from '@/lib/admin-auth';

// HTTP Basic auth for the editorial CMS (/admin) and its API (/api/admin/*). The page and the API check
// credentials again on the server (see src/lib/admin-auth.ts), so this is the first of two gates.

export function middleware(request: NextRequest) {
  const auth = checkAdminAuth(request.headers.get('authorization'));
  if (auth !== 'ok') return adminDeniedResponse(auth);

  // CSRF guard: browsers attach Basic credentials automatically, so writes must be
  // same-origin JSON requests (cross-site forms cannot send application/json without CORS).
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const origin = request.headers.get('origin');
    const contentType = request.headers.get('content-type') || '';
    if ((origin && origin !== request.nextUrl.origin) || !contentType.includes('application/json')) {
      return new NextResponse('Forbidden', { status: 403, headers: ADMIN_NOINDEX });
    }
  }

  const response = NextResponse.next();
  response.headers.set('X-Robots-Tag', ADMIN_NOINDEX['X-Robots-Tag']);
  return response;
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin/:path*'],
};
