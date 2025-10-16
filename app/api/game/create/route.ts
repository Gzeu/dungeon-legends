import { prisma } from '@/lib/db'
import { hydrateInitialGameState } from '@/lib/data-loader'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { mode = 'COOPERATIVE', players } = body

    if (!players || players.length < 1) {
      return NextResponse.json({ error: 'At least one player is required' }, { status: 400 })
    }

    // Create game participants from provided players
    const participants = players.map((p: any, index: number) => ({
      userId: p.userId,
      playerIndex: index,
      heroType: p.heroType,
      heroLevel: p.heroLevel || 1,
      isAI: !!p.isAI,
      aiDifficulty: p.aiDifficulty || null
    }))

    // Hydrate initial game state
    const initialState = await hydrateInitialGameState({ players })

    // Create game in DB
    const game = await prisma.game.create({
      data: {
        mode,
        status: 'ACTIVE',
        gameData: initialState,
        participants: { create: participants }
      },
      include: { participants: true }
    })

    return NextResponse.json({ gameId: game.id, gameState: game.gameData })
  } catch (error) {
    console.error('Failed to create game:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}