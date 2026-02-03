import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PromptCard } from '@/components/prompt-card'
import { PromptDialog } from '@/components/prompt-dialog'
import { Button } from '@/components/ui/button'
import { Plus, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { PromptsList } from '@/components/prompts-list'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage({
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
      userId: user.id,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    orderBy: { updatedAt: 'desc' },
    take: sort === 'popular' ? 50 : 10, // Берем больше для сортировки по популярности
    include: {
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
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    }).slice(0, 10) // Берем топ 10
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Мои промпты</h1>
        <p className="text-muted-foreground">Управляйте своими промптами</p>
      </div>

      <PromptsList 
        prompts={prompts.map(p => ({
          id: p.id,
          title: p.title,
          content: p.content,
          isPublic: p.isPublic,
          isFavorite: p.isFavorite,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          likesCount: p._count.likes,
          likedByMe: p.likes.length > 0,
        }))} 
        userId={user.id}
        search={search}
        sort={sort}
        emptyMessage="У вас пока нет промптов - создайте первый!"
      />
    </div>
  )
}
