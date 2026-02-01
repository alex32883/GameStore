import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'

/**
 * Конфигурация Auth.js (NextAuth v5)
 * Использует Google OAuth провайдер
 * Adapter настраивается в auth.ts
 */
export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      const isOnMyPrompts = nextUrl.pathname.startsWith('/my-prompts')
      
      if (isOnDashboard || isOnMyPrompts) {
        if (isLoggedIn) return true
        return false // Редирект на /login
      }
      return true
    },
  },
  session: {
    strategy: 'database' as const, // Используем server-side сессии
  },
} satisfies NextAuthConfig
