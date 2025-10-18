import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default withAuth(async function middleware(req: NextRequest) {
  const requestHeaders = new Headers(req.headers)
  
  // Add CORS headers for API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const origin = req.headers.get('origin') || '*'
    
    requestHeaders.set('Access-Control-Allow-Origin', origin)
    requestHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    requestHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    requestHeaders.set('Access-Control-Allow-Credentials', 'true')
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: requestHeaders,
      })
    }
  }
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}, {
  publicPaths: [
    "/",
    "/tutorial",
    "/auth/login",
    "/api/auth/login",
    "/api/auth/user",
    "/api/auth/logout",
    "/api/auth/register",
    "/api/auth/kinde_callback",
    "/api/health",
  ],
  isReturnToCurrentPage: true,
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
}
