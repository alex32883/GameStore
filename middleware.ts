import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware для защиты страниц
 * Редиректит неавторизованных пользователей на /login
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Пропускаем /login и /api/auth, чтобы избежать рекурсии
  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Защищенные страницы
  const protectedPaths = ['/dashboard', '/my-prompts']
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

  if (isProtectedPath) {
    try {
      const session = await auth()
      
      if (!session) {
        // Редирект на /login с сохранением URL для возврата
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(loginUrl)
      }
    } catch (error) {
      // В случае ошибки (например, отсутствие переменных окружения) пропускаем
      console.error('Auth error in middleware:', error)
      // Редиректим на /login для безопасности
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
