import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export function middleware(request: NextRequest) {
  console.log("Middleware Hit: ", request.nextUrl.pathname);
  const token = request.cookies.get("token")?.value;
  console.log("TOKEN: ", token);

  let user = null;
  if (token) {
    try {
      user = verifyToken(token);
      console.log("VERIFY RESULT:", user);
    } catch (err) {
      console.log("VERIFY ERROR:", err);
      user = null;
    }
  }

  const protectedPage = ["/dashboard", "/profile", "/matches"];
  const isProtectedPage = protectedPage.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (isProtectedPage && !user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (
    (request.nextUrl.pathname === "/auth/login" ||
      request.nextUrl.pathname === "/auth/register") &&
    user
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store, must-revalidate");
  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/matches/:path*",
    "/auth/:path*",
  ],
  runtime: "nodejs",
};
