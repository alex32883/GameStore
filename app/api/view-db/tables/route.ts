import { NextRequest, NextResponse } from 'next/server'
import { getTables, type DbType } from '@/lib/db-utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dbType = (searchParams.get('dbType') || 'local') as DbType

    const tables = await getTables(dbType)

    return NextResponse.json({ tables })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
