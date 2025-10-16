import { NextRequest } from 'next/server'
import { WebSocketServer } from 'ws'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// WebSocket connections map
const connections = new Map<string, any>()
const gameRooms = new Map<string, Set<string>>()

// Initialize WebSocket server (Edge Runtime compatible)
export async function GET(request: NextRequest) {
  if (request.headers.get('upgrade') !== 'websocket') {
    return new Response('Expected WebSocket', { status: 426 })
  }

  const { socket, response } = Deno.upgradeWebSocket(request)
  const connectionId = crypto.randomUUID()
  
  socket.onopen = () => {
    console.log(`✅ WebSocket connected: ${connectionId}`)
    connections.set(connectionId, {
      socket,
      userId: null,
      gameId: null,
      lastPing: Date.now()
    })
  }

  socket.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data)
      await handleWebSocketMessage(connectionId, data)
    } catch (error) {
      console.error('WebSocket message error:', error)
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }))
    }
  }

  socket.onclose = () => {
    console.log(`🔌 WebSocket disconnected: ${connectionId}`)
    const connection = connections.get(connectionId)
    
    if (connection?.gameId) {
      leaveGameRoom(connectionId, connection.gameId)
    }
    
    connections.delete(connectionId)
  }

  return response
}

async function handleWebSocketMessage(connectionId: string, data: any) {
  const connection = connections.get(connectionId)
  if (!connection) return

  switch (data.type) {
    case 'authenticate':
      await handleAuthentication(connectionId, data.token)
      break
      
    case 'joinGame':
      await handleJoinGame(connectionId, data.gameId, data.userId)
      break
      
    case 'leaveGame':
      await handleLeaveGame(connectionId, data.gameId)
      break
      
    case 'gameAction':
      await handleGameAction(connectionId, data)
      break
      
    case 'chatMessage':
      await handleChatMessage(connectionId, data)
      break
      
    case 'ping':
      connection.lastPing = Date.now()
      connection.socket.send(JSON.stringify({ type: 'pong' }))
      break
  }
}

async function handleAuthentication(connectionId: string, token: string) {
  try {
    // Validate JWT token
    const session = await verifyJWT(token)
    if (session?.user?.id) {
      const connection = connections.get(connectionId)
      if (connection) {
        connection.userId = session.user.id
        connection.socket.send(JSON.stringify({
          type: 'authenticated',
          userId: session.user.id
        }))
      }
    }
  } catch (error) {
    console.error('Authentication failed:', error)
  }
}

async function handleJoinGame(connectionId: string, gameId: string, userId: string) {
  try {
    // Verify user is participant in game
    const participant = await prisma.gameParticipant.findFirst({
      where: {
        gameId,
        userId
      },
      include: {
        game: {
          include: {
            participants: {
              include: {
                user: true
              }
            }
          }
        },
        user: true
      }
    })

    if (!participant) {
      connections.get(connectionId)?.socket.send(JSON.stringify({
        type: 'error',
        message: 'Not authorized to join this game'
      }))
      return
    }

    // Add to game room
    if (!gameRooms.has(gameId)) {
      gameRooms.set(gameId, new Set())
    }
    gameRooms.get(gameId)!.add(connectionId)
    
    // Update connection
    const connection = connections.get(connectionId)
    if (connection) {
      connection.gameId = gameId
      connection.userId = userId
    }

    // Send current game state
    const gameState = await getGameState(gameId)
    connection?.socket.send(JSON.stringify({
      type: 'gameStateUpdate',
      gameState
    }))

    // Notify other players
    broadcastToGameRoom(gameId, {
      type: 'playerJoined',
      playerId: userId,
      playerName: participant.user.name || 'Anonymous'
    }, connectionId)

  } catch (error) {
    console.error('Failed to join game:', error)
  }
}

async function handleGameAction(connectionId: string, data: any) {
  const connection = connections.get(connectionId)
  if (!connection?.gameId || !connection?.userId) return

  try {
    // Validate it's player's turn
    const game = await prisma.game.findUnique({
      where: { id: connection.gameId },
      include: {
        participants: true
      }
    })

    if (!game || game.status !== 'ACTIVE') {
      connection.socket.send(JSON.stringify({
        type: 'error',
        message: 'Game is not active'
      }))
      return
    }

    const gameData = game.gameData as any
    const currentPlayerId = game.participants[gameData.currentPlayer]?.userId
    
    if (currentPlayerId !== connection.userId) {
      connection.socket.send(JSON.stringify({
        type: 'error',
        message: 'Not your turn'
      }))
      return
    }

    // Process game action
    const result = await processGameAction(connection.gameId, data)
    
    // Log the action
    await prisma.gameAction.create({
      data: {
        gameId: connection.gameId,
        playerIndex: gameData.currentPlayer,
        actionType: data.action,
        actionData: data.data,
        result: result.results,
        turnNumber: gameData.turnCounter,
        roomNumber: gameData.currentRoom,
        gameTime: Math.floor((Date.now() - game.createdAt.getTime()) / 1000)
      }
    })

    // Update game state
    await prisma.game.update({
      where: { id: connection.gameId },
      data: {
        gameData: result.newGameState,
        lastActionAt: new Date(),
        ...(result.newGameState.status === 'completed' && {
          status: 'COMPLETED',
          completedAt: new Date()
        })
      }
    })

    // Broadcast results to all players in game
    broadcastToGameRoom(connection.gameId, {
      type: 'actionResult',
      results: result.results,
      animations: result.animations,
      sounds: result.sounds
    })

    // Send updated game state
    broadcastToGameRoom(connection.gameId, {
      type: 'gameStateUpdate', 
      gameState: result.newGameState
    })

    // Handle game end
    if (result.newGameState.status === 'completed') {
      await handleGameCompletion(connection.gameId, result.endGameResults)
    }

  } catch (error) {
    console.error('Game action failed:', error)
    connection.socket.send(JSON.stringify({
      type: 'error',
      message: 'Action failed to process'
    }))
  }
}

async function processGameAction(gameId: string, actionData: any) {
  // Load current game state
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      participants: {
        include: {
          user: {
            include: {
              heroes: true
            }
          }
        }
      }
    }
  })

  if (!game) throw new Error('Game not found')
  
  const gameState = game.gameData as any
  const gameEngine = new (await import('@/lib/game-engine')).GameEngine(gameState)
  
  // Process the action
  const result = await gameEngine.processAction(actionData.action, actionData.data)
  
  return {
    results: result.results,
    animations: result.animations,
    sounds: result.sounds,
    newGameState: gameEngine.getState(),
    endGameResults: result.gameEnd
  }
}

function broadcastToGameRoom(gameId: string, message: any, excludeConnectionId?: string) {
  const room = gameRooms.get(gameId)
  if (!room) return

  const messageStr = JSON.stringify(message)
  
  room.forEach(connectionId => {
    if (connectionId === excludeConnectionId) return
    
    const connection = connections.get(connectionId)
    if (connection?.socket.readyState === 1) { // OPEN
      connection.socket.send(messageStr)
    }
  })
}

function leaveGameRoom(connectionId: string, gameId: string) {
  const room = gameRooms.get(gameId)
  if (room) {
    room.delete(connectionId)
    if (room.size === 0) {
      gameRooms.delete(gameId)
    }
  }
}

async function getGameState(gameId: string) {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      participants: {
        include: {
          user: true
        }
      }
    }
  })
  
  return game?.gameData
}

async function verifyJWT(token: string) {
  // JWT verification logic
  // Implementation would verify NextAuth JWT token
  return null // Placeholder
}

// Periodic cleanup of stale connections
setInterval(() => {
  const now = Date.now()
  const staleThreshold = 5 * 60 * 1000 // 5 minutes
  
  for (const [connectionId, connection] of connections.entries()) {
    if (now - connection.lastPing > staleThreshold) {
      console.log(`🧹 Cleaning up stale connection: ${connectionId}`)
      connection.socket.close()
      connections.delete(connectionId)
    }
  }
}, 60000) // Check every minute