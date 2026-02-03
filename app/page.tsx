import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { PublicPromptCard } from '@/components/public-prompt-card'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HomePage() {
  const session = await auth()
  const userId = session?.user?.id

  // Получаем новые публичные промпты
  let recentPrompts = await prisma.prompt.findMany({
    where: {
      isPublic: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
    },
  })

  // Получаем популярные публичные промпты
  let popularPrompts = await prisma.prompt.findMany({
    where: {
      isPublic: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 50, // Берем больше для сортировки
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
    },
  })

  // Сортируем по количеству лайков
  popularPrompts = popularPrompts
    .sort((a, b) => {
      const likesDiff = b._count.likes - a._count.likes
      if (likesDiff !== 0) return likesDiff
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    .slice(0, 20) // Берем топ 20

  // Получаем лайки текущего пользователя (если авторизован)
  let userLikes = new Set<string>()
  if (userId) {
    const likedPrompts = await prisma.promptLike.findMany({
      where: {
        userId: userId,
        promptId: {
          in: [...recentPrompts, ...popularPrompts].map(p => p.id),
        },
      },
      select: {
        promptId: true,
      },
    })
    userLikes = new Set(likedPrompts.map(l => l.promptId))
  }

  return (
    <div className="min-h-screen">
      {/* Hero блок */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Добро пожаловать в GameStore
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Создавайте, делитесь и находите лучшие промпты для ваших проектов
            </p>
            {session?.user ? (
              <Button asChild size="lg">
                <Link href="/dashboard">
                  <Plus className="mr-2 h-5 w-5" />
                  Добавить промпт
                </Link>
              </Button>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Button asChild size="lg">
                  <Link href="/login">
                    <Plus className="mr-2 h-5 w-5" />
                    Добавить промпт
                  </Link>
                </Button>
                <p className="text-sm text-muted-foreground">
                  Войдите, чтобы добавлять промпты
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Популярные промпты */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">Популярные</h2>
          {popularPrompts.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">
              Пока нет популярных промптов
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {popularPrompts.map((prompt) => (
                <PublicPromptCard
                  key={prompt.id}
                  prompt={{
                    id: prompt.id,
                    title: prompt.title,
                    content: prompt.content,
                    createdAt: prompt.createdAt,
                    likesCount: prompt._count.likes,
                    likedByMe: userLikes.has(prompt.id),
                    user: prompt.user,
                  }}
                  currentUserId={userId}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Новые промпты */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">Новые</h2>
          {recentPrompts.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">
              Пока нет новых промптов
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {recentPrompts.map((prompt) => (
                <PublicPromptCard
                  key={prompt.id}
                  prompt={{
                    id: prompt.id,
                    title: prompt.title,
                    content: prompt.content,
                    createdAt: prompt.createdAt,
                    likesCount: prompt._count.likes,
                    likedByMe: userLikes.has(prompt.id),
                    user: prompt.user,
                  }}
                  currentUserId={userId}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
