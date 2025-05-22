
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get('token')
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')

  if (!isAuthenticated && !isAuthPage && request.nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL('/carrier-management', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
