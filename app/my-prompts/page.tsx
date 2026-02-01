import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

/**
 * Страница "Мои промты" (игры)
 * Показывает все игры пользователя с возможностью фильтрации
 */
export default async function MyPromptsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Получаем пользователя и его игры
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      games: {
        orderBy: { updatedAt: 'desc' },
        include: {
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: {
              votes: true,
            },
          },
        },
      },
    },
  })

  if (!user) {
    return <div>Пользователь не найден</div>
  }

  const publicGames = user.games.filter(g => g.visibility === 'PUBLIC')
  const privateGames = user.games.filter(g => g.visibility === 'PRIVATE')

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Мои игры (промты)</h1>
        <Link
          href="/dashboard"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#0070f3',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
          }}
        >
          ← Назад в кабинет
        </Link>
      </div>

      {/* Статистика */}
      <div style={{
        display: 'flex',
        gap: '2rem',
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
      }}>
        <div>
          <strong>Всего игр:</strong> {user.games.length}
        </div>
        <div>
          <strong>Публичных:</strong> {publicGames.length}
        </div>
        <div>
          <strong>Приватных:</strong> {privateGames.length}
        </div>
      </div>

      {/* Список игр */}
      {user.games.length === 0 ? (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
        }}>
          <p style={{ color: '#666' }}>У вас пока нет игр. Создайте первую игру!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {user.games.map((game) => (
            <div
              key={game.id}
              style={{
                padding: '1.5rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: 'white',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>{game.title}</h2>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#666' }}>
                    <span>Категория: {game.category.category}</span>
                    <span>|</span>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: game.visibility === 'PUBLIC' ? '#28a745' : '#ffc107',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                    }}>
                      {game.visibility === 'PUBLIC' ? 'Публичная' : 'Приватная'}
                    </span>
                    {game.visibility === 'PUBLIC' && (
                      <>
                        <span>|</span>
                        <span>Голосов: {game._count.votes}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {game.description && (
                <p style={{ marginBottom: '1rem', color: '#666' }}>{game.description}</p>
              )}

              {game.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {game.tags.map((gt) => (
                    <span
                      key={gt.id}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#e9ecef',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                      }}
                    >
                      {gt.tag.name}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ fontSize: '0.75rem', color: '#999' }}>
                Создано: {new Date(game.createdAt).toLocaleString()} | 
                Обновлено: {new Date(game.updatedAt).toLocaleString()}
                {game.publishedAt && ` | Опубликовано: ${new Date(game.publishedAt).toLocaleString()}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
