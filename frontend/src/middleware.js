import { NextResponse } from 'next/server';

const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/track'];

// Routes that require specific roles
const adminOnlyRoutes = ['/admin'];
const agentOnlyRoutes = ['/agent'];

function decodeJwtPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
  } catch {
    return null;
  }
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  const accessToken = request.cookies.get('accessToken')?.value;
  const agentToken = request.cookies.get('agentAccessToken')?.value;

  // No token at all — bounce to login for protected routes
  if (!isPublicRoute && !accessToken && !agentToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Already authenticated — redirect away from login/signup
  if (isPublicRoute && (accessToken || agentToken) && pathname === '/login') {
    return NextResponse.redirect(new URL('/consignments', request.url));
  }

  // Role-based route protection
  if (accessToken) {
    const payload = decodeJwtPayload(accessToken);
    if (payload) {
      const role = payload.role;

      // Admin-only routes — reject non-admins
      if (adminOnlyRoutes.some(r => pathname.startsWith(r))) {
        if (!['SUPER_ADMIN', 'ADMIN'].includes(role)) {
          return NextResponse.redirect(new URL('/consignments', request.url));
        }
      }

      // Agent routes — reject non-agents trying to use admin token here
      if (agentOnlyRoutes.some(r => pathname.startsWith(r))) {
        return NextResponse.redirect(new URL('/consignments', request.url));
      }
    }
  }

  // Agent token — only valid for agent routes
  if (agentToken && !accessToken) {
    const agentOnlyAccess = agentOnlyRoutes.some(r => pathname.startsWith(r)) || isPublicRoute;
    if (!agentOnlyAccess) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
