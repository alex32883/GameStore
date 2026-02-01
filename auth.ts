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
  adapter: PrismaAdapter(prisma),
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, user }) {
      // Добавляем userId в сессию для удобного доступа
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
})
