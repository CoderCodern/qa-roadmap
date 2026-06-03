import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { NextResponse } from 'next/server'

// Use Edge-compatible auth (no DrizzleAdapter) for middleware JWT checks.
const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const userEmail = req.auth?.user?.email

  // Protect /api/v1/me/* — require a valid session
  if (pathname.startsWith('/api/v1/me') && !req.auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Protect admin routes — require ADMIN_EMAIL
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/v1/admin')) {
    const isAdmin = userEmail && userEmail === process.env.ADMIN_EMAIL

    if (!isAdmin) {
      if (pathname.startsWith('/api/v1/admin')) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/api/v1/me/:path*', '/admin/:path*', '/api/v1/admin/:path*'],
}
