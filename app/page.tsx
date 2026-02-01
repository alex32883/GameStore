import { prisma } from '@/lib/prisma'

// Отключаем кэширование для получения актуальных данных из БД
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  const notes = await prisma.note.findMany({
    include: {
      owner: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Notes from PostgreSQL (Neon)</h1>
        <a
          href="/view-db"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#0070f3',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontWeight: '500',
          }}
        >
          Database Viewer
        </a>
      </div>
      
      {notes.length === 0 ? (
        <p style={{ color: '#666' }}>No notes found. Run the seed script to add some data.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notes.map((note) => (
            <div
              key={note.id}
              style={{
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9',
              }}
            >
              <h2 style={{ marginBottom: '0.5rem' }}>{note.title}</h2>
              <p style={{ fontSize: '0.875rem', color: '#666' }}>
                Owner: {note.owner.name || note.owner.email} | Created: {new Date(note.createdAt).toLocaleString()}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem' }}>
                ID: {note.id}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
