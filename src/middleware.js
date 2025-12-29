import { NextResponse } from 'next/server';
import { auth } from './app/lib/auth';

const protectedRoutes = ['/dashboard', '/profile', '/consultation', '/records', '/MedReach', '/Medical-assistant', '/medi-store'];
const authRoutes = ['/login', '/signup'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  // console.log(token);

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isProtectedRoute && token) {
    const data = await auth();

    if (!data.userName || data.userName.trim() === '') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);

      response.cookies.delete('token');
      response.cookies.delete('userName');
      response.cookies.delete('email');
      response.cookies.delete('phone');
      response.cookies.delete('role');

      return response;
    }

    if (pathname.startsWith('/dashboard/')) {
      const pathParts = pathname.split('/');
      const requestedRole = pathParts[2];
      const requestedId = pathParts[3];

      if (requestedRole && requestedRole !== data.role) {
        return NextResponse.redirect(new URL(`/dashboard/${data.role}/${data.userName}`, request.url));
      }

      if (requestedId && requestedId !== data.userName) {
        return NextResponse.redirect(new URL(`/dashboard/${data.role}/${data.userName}`, request.url));
      }
    }
  }

  if (isAuthRoute && token) {
    const data = await auth();
    return NextResponse.redirect(new URL(`/dashboard/${data.role}/${data.userName}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icons|.*\\.svg$|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.webp$).*)',
  ],
};