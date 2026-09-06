import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // NextAuth session token cookies
  // Production / HTTPS (Vercel): '__Secure-authjs.session-token' or '__Secure-next-auth.session-token'
  // Local / HTTP (localhost): 'authjs.session-token' or 'next-auth.session-token'
  const sessionToken =
    request.cookies.get("__Secure-authjs.session-token")?.value ||
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value ||
    request.cookies.get("next-auth.session-token")?.value;

  const isLoggedIn = Boolean(sessionToken);
  const isLoginPage = pathname === "/login";

  // If already logged in and visiting login page, redirect to dashboard
  if (isLoginPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // If trying to access protected routes without session, redirect to login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (e.g. /api/auth)
     * - _next/static (static assets)
     * - _next/image (image optimization files)
     * - favicon, icons, and static media files
     */
    "/((?!api|_next/static|_next/image|favicon\\.ico|icon\\.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf)$).*)",
  ],
};
