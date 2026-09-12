import { NextRequest, NextResponse } from 'next/server';

/**
 * Route guard middleware for LeafPop AI.
 * Protects all /app/* routes from unauthenticated access.
 *
 * Token is stored in localStorage (client-side only), so we can't
 * read it server-side. We use a cookie as the session signal.
 * AuthContext writes `leafpop_session=1` cookie on login.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard /app routes
  if (!pathname.startsWith('/app')) {
    return NextResponse.next();
  }

  // Check for session cookie (set by AuthContext on login/demo)
  const sessionCookie = request.cookies.get('leafpop_session');

  if (!sessionCookie?.value) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*'],
};
