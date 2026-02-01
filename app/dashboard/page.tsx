import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { signOut } from '@/auth'

/**
 * Страница личного кабинета
 * Показывает информацию о пользователе и его данные
 */
export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Получаем данные пользователя из БД
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      games: {
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: { category: true },
      },
      notes: {
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          games: true,
          notes: true,
          votes: true,
        },
      },
    },
  })

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Личный кабинет</h1>
        <form
          action={async () => {
            'use server'
            await signOut({ redirectTo: '/' })
          }}
        >
          <button
            type="submit"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Выйти
          </button>
        </form>
      </div>

      {/* Информация о пользователе */}
      <div style={{
        backgroundColor: '#f9f9f9',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '2rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          {user?.image && (
            <img
              src={user.image}
              alt={user.name || 'User'}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
              }}
            />
          )}
          <div>
            <h2 style={{ margin: 0 }}>{user?.name || 'Пользователь'}</h2>
            <p style={{ margin: 0, color: '#666' }}>{user?.email}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
          <div>
            <strong>Игр:</strong> {user?._count.games || 0}
          </div>
          <div>
            <strong>Заметок:</strong> {user?._count.notes || 0}
          </div>
          <div>
            <strong>Голосов:</strong> {user?._count.votes || 0}
          </div>
        </div>
      </div>

      {/* Последние игры */}
      {user && user.games.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2>Последние игры</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {user.games.map((game) => (
              <div
                key={game.id}
                style={{
                  padding: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                }}
              >
                <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>{game.title}</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '0.875rem' }}>
                  Категория: {game.category.category} | 
                  Видимость: {game.visibility} |
                  Обновлено: {new Date(game.updatedAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Последние заметки */}
      {user && user.notes.length > 0 && (
        <div>
          <h2>Последние заметки</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {user.notes.map((note) => (
              <div
                key={note.id}
                style={{
                  padding: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                }}
              >
                <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>{note.title}</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '0.875rem' }}>
                  Создано: {new Date(note.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
