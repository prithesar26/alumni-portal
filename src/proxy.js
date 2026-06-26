import { NextResponse } from 'next/server';

export function proxy(request) {
  const { pathname } = request.nextUrl;
  
  // Extract session cookie
  const sessionCookie = request.cookies.get('alumni_session')?.value;
  
  // Define protected and auth-only paths
  const isProtectedPath = pathname.startsWith('/dashboard') || 
                          pathname.startsWith('/jobs') || 
                          pathname.startsWith('/alumni') || 
                          pathname.startsWith('/discussions');
                          
  const isAuthPath = pathname.startsWith('/login');

  // If path is protected and user is not logged in, redirect to login
  if (isProtectedPath && !sessionCookie) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // If path is login and user is logged in, redirect to dashboard
  if (isAuthPath && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Config to specify which paths the proxy runs on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/jobs/:path*',
    '/alumni/:path*',
    '/discussions/:path*',
    '/login'
  ]
};
