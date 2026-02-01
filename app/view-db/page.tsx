'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { DbType } from '@/lib/db-utils'

export default function ViewDbPage() {
  const router = useRouter()
  const [dbType, setDbType] = useState<DbType>('local')
  const [tables, setTables] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTables()
  }, [dbType])

  const loadTables = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/view-db/tables?dbType=${dbType}`)
      if (!response.ok) {
        throw new Error('Failed to load tables')
      }
      const data = await response.json()
      setTables(data.tables || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setTables([])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenTable = (tableName: string) => {
    router.push(`/view-db/${tableName}?dbType=${dbType}`)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Database Viewer</h1>
      
      {/* Выбор БД */}
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ marginRight: '1rem', fontWeight: 'bold' }}>
          Выберите базу данных:
        </label>
        <select
          value={dbType}
          onChange={(e) => setDbType(e.target.value as DbType)}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            borderRadius: '4px',
            border: '1px solid #ddd',
          }}
        >
          <option value="local">Локальная БД</option>
          <option value="production">Рабочая БД</option>
        </select>
      </div>

      {/* Список таблиц */}
      {loading && <p>Загрузка таблиц...</p>}
      {error && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#fee', 
          border: '1px solid #fcc',
          borderRadius: '4px',
          marginBottom: '1rem',
          color: '#c00'
        }}>
          Ошибка: {error}
        </div>
      )}
      
      {!loading && !error && tables.length === 0 && (
        <p style={{ color: '#666' }}>Таблицы не найдены</p>
      )}
      
      {!loading && !error && tables.length > 0 && (
        <div>
          <h2 style={{ marginBottom: '1rem' }}>Список таблиц ({tables.length}):</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {tables.map((table) => (
              <div
                key={table}
                style={{
                  padding: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: '500' }}>{table}</span>
                <button
                  onClick={() => handleOpenTable(table)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#0070f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0051cc'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0070f3'}
                >
                  Открыть
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
