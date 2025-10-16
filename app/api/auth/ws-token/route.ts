import { NextRequest, NextResponse } from 'next/server'
import { getWSJwtFromRequest } from '@/lib/ws-auth'

export async function GET(req: NextRequest) {
  const token = await getWSJwtFromRequest(req)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ token })
}
