import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PromptsList } from '@/components/prompts-list'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function FavoritesPage({
  searchParams,
}: {
  searchParams: { search?: string }
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

  const prompts = await prisma.prompt.findMany({
    where: {
      userId: user.id,
      isFavorite: true,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    orderBy: { updatedAt: 'desc' },
    take: 10,
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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Избранное</h1>
        <p className="text-muted-foreground">Ваши избранные промпты</p>
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
        emptyMessage="У вас пока нет избранных промптов"
      />
    </div>
  )
}
