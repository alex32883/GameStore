'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LikeButtonProps {
  promptId: string
  initialLiked: boolean
  initialCount: number
  disabled?: boolean
}

export function LikeButton({
  promptId,
  initialLiked,
  initialCount,
  disabled = false,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    if (disabled || loading) return

    // Оптимистичное обновление UI
    const previousLiked = liked
    const previousCount = count
    setLiked(!liked)
    setCount(liked ? count - 1 : count + 1)
    setLoading(true)

    try {
      const response = await fetch(`/api/prompts/${promptId}/like`, {
        method: 'POST',
      })

      if (!response.ok) {
        // Откатываем изменения при ошибке
        setLiked(previousLiked)
        setCount(previousCount)
        const error = await response.json()
        alert(error.error || 'Не удалось поставить лайк')
        return
      }

      const data = await response.json()
      setLiked(data.liked)
      setCount(data.likesCount)
    } catch (error) {
      // Откатываем изменения при ошибке
      setLiked(previousLiked)
      setCount(previousCount)
      alert('Ошибка при обновлении лайка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={disabled || loading}
      className={cn(
        "gap-2",
        liked && "text-red-500 hover:text-red-600"
      )}
    >
      <Heart className={cn(
        "h-4 w-4",
        liked && "fill-current"
      )} />
      <span>{count}</span>
    </Button>
  )
}
