import { NextRequest, NextResponse } from 'next/server'
import { createRecord, type DbType } from '@/lib/db-utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dbType, tableName, data } = body

    if (!tableName || !data) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await createRecord(
      dbType as DbType,
      tableName,
      data
    )

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
