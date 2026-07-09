import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value
    const user = token ? verifyToken(token) : null

    const protectedPaths = ['/dashboard', '/profile', '/matches']
    const isProtectedPath = protectedPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path)
    )

    if (isProtectedPath && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register') && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}