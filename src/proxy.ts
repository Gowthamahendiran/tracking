import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("session_token")?.value;
  const { pathname } = request.nextUrl;

  // Define route rules
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
  
  // Protected routes: dashboard (/), tracker, analytics, history, settings, activities
  const isProtectedRoute = 
    pathname === "/" || 
    pathname.startsWith("/tracker") || 
    pathname.startsWith("/analytics") || 
    pathname.startsWith("/history") || 
    pathname.startsWith("/settings") ||
    pathname.startsWith("/activities");

  // Redirect logic
  if (isProtectedRoute && !token) {
    // Redirect unauthenticated users to login page
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token) {
    // Redirect already authenticated users to dashboard
    const dashboardUrl = new URL("/", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

// Config to specify matching routes
export const config = {
  matcher: [
    "/",
    "/tracker/:path*",
    "/analytics/:path*",
    "/history/:path*",
    "/settings/:path*",
    "/activities/:path*",
    "/login",
    "/register",
  ],
};
