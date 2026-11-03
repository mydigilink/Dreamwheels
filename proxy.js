import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, verifySession } from './lib/session';

// Guards every admin page before any rendering happens. (A layout-level check alone is not
// enough: App Router renders layouts and pages in parallel.) Admin APIs also check per request.
export function proxy(request) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/admin/login')) return NextResponse.next();
  if (verifySession(request.cookies.get(ADMIN_COOKIE)?.value)) return NextResponse.next();
  return NextResponse.redirect(new URL('/admin/login/', request.url));
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
