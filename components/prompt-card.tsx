'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Globe, Lock, Star } from 'lucide-react'
import { useState } from 'react'
import { deletePrompt, togglePublic, toggleFavorite } from '@/lib/actions/prompt-actions'
import { PromptDialog } from './prompt-dialog'
import { LikeButton } from './like-button'

interface PromptCardProps {
  prompt: {
    id: string
    title: string
    content: string
    isPublic: boolean
    isFavorite: boolean
    createdAt: Date
    updatedAt: Date
    likesCount?: number
    likedByMe?: boolean
  }
  onEdit?: (prompt: PromptCardProps['prompt']) => void
  showActions?: boolean
  currentUserId?: string
}

export function PromptCard({ prompt, onEdit, showActions = true, currentUserId }: PromptCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Удалить этот промпт?')) return
    
    setIsDeleting(true)
    const result = await deletePrompt(prompt.id)
    setIsDeleting(false)
    
    if (result.error) {
      alert(result.error)
    }
  }

  const handleTogglePublic = async () => {
    setIsToggling(true)
    const result = await togglePublic(prompt.id)
    setIsToggling(false)
    
    if (result.error) {
      alert(result.error)
    }
  }

  const handleToggleFavorite = async () => {
    setIsToggling(true)
    const result = await toggleFavorite(prompt.id)
    setIsToggling(false)
    
    if (result.error) {
      alert(result.error)
    }
  }

  const preview = prompt.content.length > 150 
    ? prompt.content.substring(0, 150) + '...' 
    : prompt.content

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{prompt.title}</CardTitle>
          {showActions && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleFavorite}
                disabled={isToggling}
                className={prompt.isFavorite ? 'text-yellow-500' : ''}
              >
                <Star className={`h-4 w-4 ${prompt.isFavorite ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleTogglePublic}
                disabled={isToggling}
              >
                {prompt.isPublic ? (
                  <Globe className="h-4 w-4" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{preview}</p>
        
        <div className="flex items-center justify-between mb-4">
          {prompt.isPublic && (
            <LikeButton
              promptId={prompt.id}
              initialLiked={prompt.likedByMe || false}
              initialCount={prompt.likesCount || 0}
              disabled={!currentUserId}
            />
          )}
          {showActions && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit?.(prompt)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Редактировать
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Удаление...' : 'Удалить'}
              </Button>
            </div>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground">
          Обновлено: {new Date(prompt.updatedAt).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  )
}
