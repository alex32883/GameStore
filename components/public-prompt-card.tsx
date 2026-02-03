'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LikeButton } from './like-button'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface PublicPromptCardProps {
  prompt: {
    id: string
    title: string
    content: string
    createdAt: Date
    likesCount: number
    likedByMe: boolean
    user: {
      name: string | null
      email: string
    }
  }
  currentUserId?: string
}

export function PublicPromptCard({ prompt, currentUserId }: PublicPromptCardProps) {
  const preview = prompt.content.length > 200 
    ? prompt.content.substring(0, 200) + '...' 
    : prompt.content

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg line-clamp-2">{prompt.title}</CardTitle>
        <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
          <span>
            Автор: {prompt.user.name || prompt.user.email.split('@')[0]}
          </span>
          <span>
            {new Date(prompt.createdAt).toLocaleDateString('ru-RU')}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-4">
          {preview}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t">
          <LikeButton
            promptId={prompt.id}
            initialLiked={prompt.likedByMe}
            initialCount={prompt.likesCount}
            disabled={!currentUserId}
          />
          <Button asChild variant="outline" size="sm">
            <Link href={`/prompts/${prompt.id}`}>
              Открыть
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
