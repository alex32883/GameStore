'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Схемы валидации
const createPromptSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  isPublic: z.boolean().default(false),
})

const updatePromptSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  isPublic: z.boolean(),
})

// Создание промпта
export async function createPrompt(data: {
  title: string
  content: string
  isPublic: boolean
}) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    const validatedData = createPromptSchema.parse(data)

    const prompt = await prisma.prompt.create({
      data: {
        userId: session.user.id,
        title: validatedData.title,
        content: validatedData.content,
        isPublic: validatedData.isPublic,
      },
    })

    revalidatePath('/dashboard')
    return { success: true, prompt }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message }
    }
    return { error: 'Failed to create prompt' }
  }
}

// Обновление промпта
export async function updatePrompt(data: {
  id: string
  title: string
  content: string
  isPublic: boolean
}) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    const validatedData = updatePromptSchema.parse(data)

    // Проверяем, что промпт принадлежит пользователю
    const existingPrompt = await prisma.prompt.findUnique({
      where: { id: validatedData.id },
    })

    if (!existingPrompt || existingPrompt.userId !== session.user.id) {
      return { error: 'Prompt not found or unauthorized' }
    }

    const prompt = await prisma.prompt.update({
      where: { id: validatedData.id },
      data: {
        title: validatedData.title,
        content: validatedData.content,
        isPublic: validatedData.isPublic,
      },
    })

    revalidatePath('/dashboard')
    return { success: true, prompt }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message }
    }
    return { error: 'Failed to update prompt' }
  }
}

// Удаление промпта
export async function deletePrompt(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    // Проверяем, что промпт принадлежит пользователю
    const existingPrompt = await prisma.prompt.findUnique({
      where: { id },
    })

    if (!existingPrompt || existingPrompt.userId !== session.user.id) {
      return { error: 'Prompt not found or unauthorized' }
    }

    await prisma.prompt.delete({
      where: { id },
    })

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    return { error: 'Failed to delete prompt' }
  }
}

// Переключение public/private
export async function togglePublic(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    const existingPrompt = await prisma.prompt.findUnique({
      where: { id },
    })

    if (!existingPrompt || existingPrompt.userId !== session.user.id) {
      return { error: 'Prompt not found or unauthorized' }
    }

    const prompt = await prisma.prompt.update({
      where: { id },
      data: {
        isPublic: !existingPrompt.isPublic,
      },
    })

    revalidatePath('/dashboard')
    return { success: true, prompt }
  } catch (error) {
    return { error: 'Failed to toggle public status' }
  }
}

// Переключение favorite
export async function toggleFavorite(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    const existingPrompt = await prisma.prompt.findUnique({
      where: { id },
    })

    if (!existingPrompt || existingPrompt.userId !== session.user.id) {
      return { error: 'Prompt not found or unauthorized' }
    }

    const prompt = await prisma.prompt.update({
      where: { id },
      data: {
        isFavorite: !existingPrompt.isFavorite,
      },
    })

    revalidatePath('/dashboard')
    return { success: true, prompt }
  } catch (error) {
    return { error: 'Failed to toggle favorite' }
  }
}
