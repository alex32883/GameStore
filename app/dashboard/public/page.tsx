import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PromptsList } from '@/components/prompts-list'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PublicPromptsPage({
  searchParams,
}: {
  searchParams: { search?: string; sort?: string }
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  })

  if (!user) {
    redirect('/login')
  }

  const search = searchParams.search || ''
  const sort = searchParams.sort || 'recent'

  let prompts = await prisma.prompt.findMany({
    where: {
      isPublic: true,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    orderBy: { createdAt: 'desc' },
    take: sort === 'popular' ? 50 : 10, // Берем больше для сортировки по популярности
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
      likes: {
        where: {
          userId: user.id,
        },
        select: {
          id: true,
        },
      },
    },
  })

  // Сортировка по популярности (количество лайков)
  if (sort === 'popular') {
    prompts = prompts.sort((a, b) => {
      const likesDiff = b._count.likes - a._count.likes
      if (likesDiff !== 0) return likesDiff
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }).slice(0, 10) // Берем топ 10
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Публичные промпты</h1>
        <p className="text-muted-foreground">Просматривайте промпты других пользователей</p>
      </div>

      <PromptsList 
        prompts={prompts.map(p => ({
          id: p.id,
          title: p.title,
          content: p.content,
          isPublic: p.isPublic,
          isFavorite: false,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          likesCount: p._count.likes,
          likedByMe: p.likes.length > 0,
        }))}
        userId={user.id}
        search={search}
        sort={sort}
        emptyMessage="Публичные промпты не найдены"
        showActions={false}
      />
    </div>
  )
}
