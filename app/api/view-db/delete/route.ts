import { NextRequest, NextResponse } from 'next/server'
import { deleteRecord, type DbType } from '@/lib/db-utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dbType, tableName, primaryKey, primaryKeyValue } = body

    if (!tableName || !primaryKey || primaryKeyValue === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await deleteRecord(
      dbType as DbType,
      tableName,
      primaryKey,
      String(primaryKeyValue)
    )

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
