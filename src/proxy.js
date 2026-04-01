import { NextResponse } from 'next/server';

export function proxy(request) {
  // Protect /admin routes — redirect to /login if not authenticated
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const isAuthenticated = request.cookies.get('auth-token')?.value;

    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
