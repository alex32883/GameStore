'use client'

import { useState } from 'react'
import { PromptCard } from './prompt-card'
import { PromptDialog } from './prompt-dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Plus, Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

interface Prompt {
  id: string
  title: string
  content: string
  isPublic: boolean
  isFavorite: boolean
  createdAt: Date
  updatedAt: Date
}

interface PromptsListProps {
  prompts: Prompt[]
  userId: string
  search?: string
  emptyMessage?: string
  showActions?: boolean
}

export function PromptsList({ 
  prompts, 
  userId, 
  search = '', 
  emptyMessage = 'Промпты не найдены',
  showActions = true 
}: PromptsListProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | undefined>()
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('search', value)
    } else {
      params.delete('search')
    }
    router.push(`?${params.toString()}`)
  }, 300)

  const handleCreate = () => {
    setEditingPrompt(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по заголовку или содержанию..."
            defaultValue={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        {showActions && (
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Создать промпт
          </Button>
        )}
      </div>

      {prompts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">{emptyMessage}</p>
          {showActions && (
            <Button onClick={handleCreate} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Создать первый промпт
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onEdit={handleEdit}
              showActions={showActions}
            />
          ))}
        </div>
      )}

      <PromptDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        prompt={editingPrompt}
      />
    </div>
  )
}
