import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { gameId, userId } = body

    const participant = await prisma.gameParticipant.create({
      data: {
        gameId,
        userId,
        playerIndex: 99, // will be adjusted by backend lobby
        heroType: 'knight'
      }
    })

    return NextResponse.json({ ok: true, participant })
  } catch (error) {
    console.error('Failed to join game:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}