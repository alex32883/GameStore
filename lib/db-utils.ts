import { PrismaClient } from '@prisma/client'

export type DbType = 'local' | 'production'

export function getPrismaClient(dbType: DbType): PrismaClient {
  const databaseUrl = dbType === 'local' 
    ? process.env.DATABASE_URL 
    : process.env.DATABASE_URL_PROD || process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error(`DATABASE_URL not found for ${dbType} database`)
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  })
}

export async function getTables(dbType: DbType): Promise<string[]> {
  const prisma = getPrismaClient(dbType)
  
  try {
    // Получаем список таблиц через raw query
    const result = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `
    return result.map(r => r.tablename)
  } finally {
    await prisma.$disconnect()
  }
}

export async function getTableData(
  dbType: DbType,
  tableName: string,
  page: number = 1,
  pageSize: number = 10
) {
  const prisma = getPrismaClient(dbType)
  
  try {
    // Получаем общее количество записей
    const countResult = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
      `SELECT COUNT(*) as count FROM "${tableName}"`
    )
    const total = Number(countResult[0]?.count || 0)
    
    // Получаем данные с пагинацией
    const offset = (page - 1) * pageSize
    const data = await prisma.$queryRawUnsafe(
      `SELECT * FROM "${tableName}" ORDER BY 1 LIMIT ${pageSize} OFFSET ${offset}`
    )
    
    // Получаем структуру таблицы (колонки)
    const columnsResult = await prisma.$queryRawUnsafe<Array<{
      column_name: string
      data_type: string
      is_nullable: string
    }>>(
      `SELECT column_name, data_type, is_nullable
       FROM information_schema.columns
       WHERE table_name = '${tableName}'
       ORDER BY ordinal_position`
    )
    
    return {
      data: data as Record<string, any>[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      columns: columnsResult,
    }
  } finally {
    await prisma.$disconnect()
  }
}

export async function deleteRecord(
  dbType: DbType,
  tableName: string,
  primaryKey: string,
  primaryKeyValue: string
) {
  const prisma = getPrismaClient(dbType)
  
  try {
    // Экранируем значение для безопасности
    const escapedValue = String(primaryKeyValue).replace(/'/g, "''")
    await prisma.$executeRawUnsafe(
      `DELETE FROM "${tableName}" WHERE "${primaryKey}" = '${escapedValue}'`
    )
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  } finally {
    await prisma.$disconnect()
  }
}

export async function updateRecord(
  dbType: DbType,
  tableName: string,
  primaryKey: string,
  primaryKeyValue: string,
  data: Record<string, any>
) {
  const prisma = getPrismaClient(dbType)
  
  try {
    const setClause = Object.keys(data)
      .map((key) => {
        const value = data[key]
        const escapedValue = value === null ? 'NULL' : `'${String(value).replace(/'/g, "''")}'`
        return `"${key}" = ${escapedValue}`
      })
      .join(', ')
    
    const escapedPrimaryValue = String(primaryKeyValue).replace(/'/g, "''")
    
    await prisma.$executeRawUnsafe(
      `UPDATE "${tableName}" SET ${setClause} WHERE "${primaryKey}" = '${escapedPrimaryValue}'`
    )
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  } finally {
    await prisma.$disconnect()
  }
}

export async function createRecord(
  dbType: DbType,
  tableName: string,
  data: Record<string, any>
) {
  const prisma = getPrismaClient(dbType)
  
  try {
    const columns = Object.keys(data).map(key => `"${key}"`).join(', ')
    const values = Object.values(data)
      .map(value => value === null || value === '' ? 'NULL' : `'${String(value).replace(/'/g, "''")}'`)
      .join(', ')
    
    await prisma.$executeRawUnsafe(
      `INSERT INTO "${tableName}" (${columns}) VALUES (${values})`
    )
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  } finally {
    await prisma.$disconnect()
  }
}
