import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PromptsList } from '@/components/prompts-list'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PublicPromptsPage({
  searchParams,
}: {
  searchParams: { search?: string }
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const search = searchParams.search || ''

  const prompts = await prisma.prompt.findMany({
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
    take: 10,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

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
        }))}
        userId={session.user.id!}
        search={search}
        emptyMessage="Публичные промпты не найдены"
        showActions={false}
      />
    </div>
  )
}
