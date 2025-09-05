// Multi-tenant routing middleware

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();
  
  // Extract subdomain
  const subdomain = hostname.split('.')[0];
  
  // Handle super admin routes
  if (subdomain === 'admin' || hostname.includes('admin.')) {
    // Redirect to super admin panel
    if (url.pathname === '/' || url.pathname === '/dashboard') {
      url.pathname = '/admin/dashboard';
      return NextResponse.rewrite(url);
    }
    
    // Allow admin routes
    if (url.pathname.startsWith('/admin')) {
      return NextResponse.next();
    }
    
    // Redirect non-admin routes to admin
    url.pathname = '/admin' + url.pathname;
    return NextResponse.rewrite(url);
  }
  
  // Handle church subdomains
  if (subdomain && subdomain !== 'www' && !hostname.includes('localhost')) {
    // Set tenant context in headers
    const response = NextResponse.next();
    response.headers.set('x-tenant', subdomain);
    return response;
  }
  
  // Handle localhost development
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    // Check for tenant query parameter for development
    const tenantParam = url.searchParams.get('tenant');
    if (tenantParam) {
      const response = NextResponse.next();
      response.headers.set('x-tenant', tenantParam);
      return response;
    }
    
    // Default to main site for localhost without tenant
    return NextResponse.next();
  }
  
  // Handle main domain (www or apex domain)
  if (url.pathname === '/') {
    // Redirect to marketing page or tenant selection
    url.pathname = '/welcome';
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};