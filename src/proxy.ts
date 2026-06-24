import { withAuth, type NextRequestWithAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const token   = req.nextauth?.token
    const pathname  = req.nextUrl.pathname
    const role      = token?.role as string | undefined

    // Role-gated route guards
    if (pathname.startsWith('/dashboard/admin') && role !== 'ADMIN'){
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    if (pathname.startsWith('/dashboard/producer') && role !== "PRODUCER" && role !== 'ADMIN'){
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  matcher: [
    '/account/:path*',
    '/checkout/:path*',
    '/dashboard/:path*',
  ],
}
