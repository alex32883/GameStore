import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * API route для toggle like на промпте
 * POST /api/prompts/[id]/like
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const promptId = resolvedParams.id

    // Проверяем, что промпт существует и публичный
    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
    })

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      )
    }

    if (!prompt.isPublic) {
      return NextResponse.json(
        { error: 'Cannot like private prompt' },
        { status: 403 }
      )
    }

    // Проверяем, есть ли уже лайк
    const existingLike = await prisma.promptLike.findUnique({
      where: {
        userId_promptId: {
          userId: session.user.id,
          promptId: promptId,
        },
      },
    })

    if (existingLike) {
      // Удаляем лайк
      await prisma.promptLike.delete({
        where: {
          id: existingLike.id,
        },
      })
    } else {
      // Создаем лайк
      await prisma.promptLike.create({
        data: {
          userId: session.user.id,
          promptId: promptId,
        },
      })
    }

    // Получаем обновленное количество лайков
    const likesCount = await prisma.promptLike.count({
      where: { promptId },
    })

    // Проверяем, лайкнул ли текущий пользователь
    const liked = !existingLike

    return NextResponse.json({
      liked,
      likesCount,
    })
  } catch (error) {
    console.error('Like error:', error)
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
}
