// src/middleware.js
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Protect account routes
    if (pathname.startsWith('/account') && !token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    // Protect download routes
    if (pathname.startsWith('/api/download') && !token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Protect admin routes (if needed later)
    if (pathname.startsWith('/admin') && !token?.isAdmin) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Always allow public routes
        if (
          pathname.startsWith('/auth') ||
          pathname.startsWith('/_next') ||
          pathname.startsWith('/api/stripe/webhook') || // Allow webhook
          pathname.startsWith('/api/models') || // Allow model listing
          pathname.startsWith('/api/insights') || // Allow insights
          pathname.startsWith('/api/contact') || // Allow contact
          pathname.startsWith('/api/newsletter') || // Allow newsletter
          pathname === '/' ||
          pathname.startsWith('/models') ||
          pathname.startsWith('/insights') ||
          pathname.startsWith('/solutions') ||
          pathname.startsWith('/about') ||
          pathname.startsWith('/contact')
        ) {
          return true;
        }

        // Require authentication for protected routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/account/:path*',
    '/api/download/:path*',
    '/api/account/:path*',
    '/admin/:path*'
  ]
};