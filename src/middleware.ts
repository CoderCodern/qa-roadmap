import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  // Protect /api/v1/me/* — require a valid session
  if (req.nextUrl.pathname.startsWith('/api/v1/me') && !req.auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.next()
})

export const config = {
  // Run middleware on API v1 me routes; skip static/internal paths
  matcher: ['/api/v1/me/:path*'],
}
