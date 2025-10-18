import { connectDB } from '@/lib/db'
import { hydrateInitialGameState } from '@/lib/data-loader'
import { NextResponse } from 'next/server'
import { User } from '@/lib/models/User'

export async function POST(req: Request) {
  try {
    // Connect to MongoDB
    await connectDB()

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

    // Create a simple game document for MongoDB
    const gameData = {
      mode,
      status: 'ACTIVE',
      gameData: initialState,
      participants,
      createdAt: new Date(),
      startedAt: new Date()
    }

    // For now, we'll create a simple in-memory game since we don't have a Game model yet
    // In a real implementation, you'd want to create a Game model in MongoDB
    const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return NextResponse.json({ gameId, gameState: gameData })
  } catch (error) {
    console.error('Failed to create game:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}