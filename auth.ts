import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { authConfig } from './auth.config'
import { prisma } from '@/lib/prisma'

/**
 * Экспорт Auth.js handlers для API routes
 * Настраиваем Prisma adapter для хранения сессий и аккаунтов
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma), // Используем Prisma для хранения пользователей и аккаунтов
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token, user }) {
      // Добавляем userId в сессию
      // Для JWT strategy используем token, для database - user
      if (session.user) {
        session.user.id = (user?.id || token?.sub) as string
      }
      return session
    },
    async jwt({ token, user, account }) {
      // Сохраняем userId в токен при первом входе
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
})
