import { NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'

// Security middleware for protecting uploads and admin routes
export function middleware(request) {
  const { pathname } = request.nextUrl

  // Protect Excel uploads directory
  if (pathname.startsWith('/uploads/excel/')) {
    // Check for valid session or API key
    const authHeader = request.headers.get('authorization')
    const sessionToken = request.cookies.get('session-token')?.value
    
    if (!authHeader && !sessionToken) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    
    // Verify JWT token if present
    if (sessionToken) {
      try {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
          console.error('SECURITY ALERT: JWT_SECRET not configured');
          return new NextResponse('Configuration error', { status: 500 })
        }
        verify(sessionToken, jwtSecret)
      } catch (error) {
        console.warn('JWT verification failed:', error.message);
        return new NextResponse('Invalid session', { status: 401 })
      }
    }
    
    // Rate limiting for file access
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    
    // Add security headers for file responses
    const response = NextResponse.next()
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('Content-Security-Policy', "default-src 'none';")
    response.headers.set('X-Download-Options', 'noopen')
    
    return response
  }
  
  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const sessionToken = request.cookies.get('admin-session')?.value
    
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error('SECURITY ALERT: JWT_SECRET not configured for admin access');
        return NextResponse.redirect(new URL('/error?code=config', request.url))
      }
      
      const payload = verify(sessionToken, jwtSecret)
      if (!payload.isAdmin) {
        console.warn('Non-admin user attempted admin access:', payload.userId);
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    } catch (error) {
      console.warn('Admin JWT verification failed:', error.message);
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  // Add security headers to all responses
  const response = NextResponse.next()
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  
  return response
}

export const config = {
  matcher: [
    '/uploads/excel/:path*',
    '/admin/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}