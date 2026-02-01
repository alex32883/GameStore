'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import type { DbType } from '@/lib/db-utils'

interface TableData {
  data: Record<string, any>[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  columns: Array<{
    column_name: string
    data_type: string
    is_nullable: string
  }>
}

export default function TableViewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const dbType = (searchParams.get('dbType') || 'local') as DbType
  
  const [tableData, setTableData] = useState<TableData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [editingRow, setEditingRow] = useState<number | null>(null)
  const [editData, setEditData] = useState<Record<string, any>>({})
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newRowData, setNewRowData] = useState<Record<string, any>>({})

  const tableName = params?.table as string

  useEffect(() => {
    loadTableData()
  }, [tableName, dbType, page])

  const loadTableData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `/api/view-db/table?tableName=${encodeURIComponent(tableName)}&dbType=${dbType}&page=${page}&pageSize=${pageSize}`
      )
      if (!response.ok) {
        throw new Error('Failed to load table data')
      }
      const data = await response.json()
      setTableData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (primaryKey: string, primaryKeyValue: string) => {
    if (!confirm(`Удалить запись?`)) return

    try {
      const response = await fetch('/api/view-db/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dbType,
          tableName,
          primaryKey,
          primaryKeyValue,
        }),
      })

      const result = await response.json()
      if (result.success) {
        loadTableData()
      } else {
        alert(`Ошибка: ${result.error}`)
      }
    } catch (err) {
      alert(`Ошибка: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleEdit = (row: Record<string, any>) => {
    setEditingRow(tableData!.data.indexOf(row))
    setEditData({ ...row })
  }

  const handleSaveEdit = async () => {
    if (!tableData || editingRow === null) return

    const row = tableData.data[editingRow]
    const primaryKey = tableData.columns[0]?.column_name
    if (!primaryKey) return

    try {
      const response = await fetch('/api/view-db/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dbType,
          tableName,
          primaryKey,
          primaryKeyValue: row[primaryKey],
          data: editData,
        }),
      })

      const result = await response.json()
      if (result.success) {
        setEditingRow(null)
        loadTableData()
      } else {
        alert(`Ошибка: ${result.error}`)
      }
    } catch (err) {
      alert(`Ошибка: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/view-db/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dbType,
          tableName,
          data: newRowData,
        }),
      })

      const result = await response.json()
      if (result.success) {
        setShowCreateForm(false)
        setNewRowData({})
        loadTableData()
      } else {
        alert(`Ошибка: ${result.error}`)
      }
    } catch (err) {
      alert(`Ошибка: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  if (loading && !tableData) {
    return <div style={{ padding: '2rem' }}>Загрузка...</div>
  }

  if (error || !tableData) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ color: '#c00', marginBottom: '1rem' }}>
          Ошибка: {error || 'Не удалось загрузить данные'}
        </div>
        <button onClick={() => router.back()}>Назад</button>
      </div>
    )
  }

  const primaryKey = tableData.columns[0]?.column_name || 'id'

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button
            onClick={() => router.back()}
            style={{
              padding: '0.5rem 1rem',
              marginBottom: '1rem',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            ← Назад
          </button>
          <h1 style={{ margin: 0 }}>Таблица: {tableName}</h1>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>
            Всего записей: {tableData.total} | Страница {tableData.page} из {tableData.totalPages}
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
          }}
        >
          + Создать запись
        </button>
      </div>

      {/* Форма создания */}
      {showCreateForm && (
        <div style={{
          padding: '1.5rem',
          border: '2px solid #28a745',
          borderRadius: '8px',
          marginBottom: '2rem',
          backgroundColor: '#f0fff4',
        }}>
          <h3 style={{ marginTop: 0 }}>Создать новую запись</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {tableData.columns.map((col) => (
              <div key={col.column_name}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                  {col.column_name} ({col.data_type})
                </label>
                <input
                  type="text"
                  value={newRowData[col.column_name] || ''}
                  onChange={(e) => setNewRowData({ ...newRowData, [col.column_name]: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }}
                  placeholder={col.is_nullable === 'YES' ? 'Опционально' : 'Обязательно'}
                />
              </div>
            ))}
          </div>
          <div>
            <button
              onClick={handleCreate}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '0.5rem',
              }}
            >
              Сохранить
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false)
                setNewRowData({})
              }}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Таблица */}
      <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', border: '1px solid #ddd' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              {tableData.columns.map((col) => (
                <th
                  key={col.column_name}
                  style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    border: '1px solid #ddd',
                    fontWeight: 'bold',
                  }}
                >
                  {col.column_name}
                  <div style={{ fontSize: '0.75rem', color: '#666', fontWeight: 'normal' }}>
                    {col.data_type}
                  </div>
                </th>
              ))}
              <th style={{ padding: '0.75rem', border: '1px solid #ddd', fontWeight: 'bold' }}>
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.data.map((row, rowIndex) => (
              <tr key={rowIndex} style={{ borderBottom: '1px solid #eee' }}>
                {tableData.columns.map((col) => (
                  <td key={col.column_name} style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                    {editingRow === rowIndex ? (
                      <input
                        type="text"
                        value={editData[col.column_name] ?? ''}
                        onChange={(e) => setEditData({ ...editData, [col.column_name]: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.25rem',
                          border: '1px solid #0070f3',
                          borderRadius: '2px',
                        }}
                      />
                    ) : (
                      <span>{String(row[col.column_name] ?? 'NULL')}</span>
                    )}
                  </td>
                ))}
                <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                  {editingRow === rowIndex ? (
                    <div>
                      <button
                        onClick={handleSaveEdit}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginRight: '0.25rem',
                          fontSize: '0.875rem',
                        }}
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setEditingRow(null)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#666',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={() => handleEdit(row)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#ffc107',
                          color: 'black',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginRight: '0.25rem',
                          fontSize: '0.875rem',
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(primaryKey, String(row[primaryKey]))}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      {tableData.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: page === 1 ? '#ccc' : '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            ← Предыдущая
          </button>
          <span>
            Страница {page} из {tableData.totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(tableData.totalPages, page + 1))}
            disabled={page === tableData.totalPages}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: page === tableData.totalPages ? '#ccc' : '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: page === tableData.totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            Следующая →
          </button>
        </div>
      )}
    </div>
  )
}
