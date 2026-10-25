// HTTP Basic auth check shared by the middleware and by the admin page and API themselves, so the CMS stays
// protected even if a request ever reaches it without passing through the middleware.
// Credentials come from ADMIN_USER / ADMIN_PASSWORD; with no password configured the admin area is closed.

export type AdminAuthResult = 'ok' | 'unauthorized' | 'disabled';

function safeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export function checkAdminAuth(authorization: string | null): AdminAuthResult {
  const expectedUser = process.env.ADMIN_USER || 'admin';
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword) return 'disabled';

  const header = authorization || '';
  if (!header.startsWith('Basic ')) return 'unauthorized';

  let decoded = '';
  try {
    decoded = atob(header.slice(6));
  } catch {
    return 'unauthorized';
  }
  const sep = decoded.indexOf(':');
  if (sep < 0) return 'unauthorized';
  const user = decoded.slice(0, sep);
  const password = decoded.slice(sep + 1);
  return safeEqual(user, expectedUser) && safeEqual(password, expectedPassword) ? 'ok' : 'unauthorized';
}

export const ADMIN_NOINDEX = { 'X-Robots-Tag': 'noindex, nofollow' };

export function adminDeniedResponse(result: Exclude<AdminAuthResult, 'ok'>): Response {
  if (result === 'disabled') {
    return new Response('Admin is disabled: ADMIN_PASSWORD is not configured.', { status: 503, headers: ADMIN_NOINDEX });
  }
  return new Response('Authentication required', {
    status: 401,
    headers: { ...ADMIN_NOINDEX, 'WWW-Authenticate': 'Basic realm="HouseCareWiki Admin", charset="UTF-8"' },
  });
}
