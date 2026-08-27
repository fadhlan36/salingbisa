import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  let user = null;
  if (token) {
    try {
      user = verifyToken(token);
    } catch {
      user = null;
    }
  }

  const pathname = request.nextUrl.pathname;

  const protectedPages = ["/dashboard", "/profile", "/matches"];
  const isProtectedPage = protectedPages.some((path) =>
    pathname.startsWith(path),
  );
  const isAuthPage =
    pathname === "/auth/login" || pathname === "/auth/register";

  // Root page: redirect sesuai status login
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(user ? "/dashboard" : "/auth/login", request.url),
    );
  }

  if (isProtectedPage && !user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store, must-revalidate");
  return response;
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/auth/:path*"],
  runtime: "nodejs",
};
