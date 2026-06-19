import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'

export default withAuth(
  function middleware( ) {
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
