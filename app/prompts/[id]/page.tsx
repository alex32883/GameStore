import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { PublicPromptCard } from '@/components/public-prompt-card'
import { LikeButton } from '@/components/like-button'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PromptPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const session = await auth()
  const userId = session?.user?.id

  const prompt = await prisma.prompt.findUnique({
    where: { id: resolvedParams.id },
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

  if (!prompt || !prompt.isPublic) {
    notFound()
  }

  // Проверяем, лайкнул ли текущий пользователь
  let likedByMe = false
  if (userId) {
    const like = await prisma.promptLike.findUnique({
      where: {
        userId_promptId: {
          userId: userId,
          promptId: prompt.id,
        },
      },
    })
    likedByMe = !!like
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад на главную
        </Link>
      </Button>

      <div className="bg-card border rounded-lg p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">{prompt.title}</h1>
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <span>
              Автор: {prompt.user.name || prompt.user.email.split('@')[0]}
            </span>
            <span>
              Создано: {new Date(prompt.createdAt).toLocaleString('ru-RU')}
            </span>
          </div>
        </div>

        <div className="prose max-w-none mb-6">
          <p className="whitespace-pre-wrap text-foreground">
            {prompt.content}
          </p>
        </div>

        <div className="flex items-center justify-between pt-6 border-t">
          <LikeButton
            promptId={prompt.id}
            initialLiked={likedByMe}
            initialCount={prompt._count.likes}
            disabled={!userId}
          />
        </div>
      </div>
    </div>
  )
}
