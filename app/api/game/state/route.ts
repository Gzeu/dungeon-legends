import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { gameId } = await req.json()
    const game = await prisma.game.findUnique({ where: { id: gameId } })
    if (!game) return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    return NextResponse.json({ gameState: game.gameData })
  } catch (error) {
    console.error('Failed to fetch game state:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}