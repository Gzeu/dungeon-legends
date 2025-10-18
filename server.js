import { WebSocketServer } from 'ws'
import { IncomingMessage } from 'http'
import { Duplex } from 'stream'
// Database connection (commented out for now)
// import { connectDB } from './lib/db'

// Initialize WebSocket server
const wss = new WebSocketServer({ port: 3001 })

console.log('🚀 WebSocket Server started on ws://localhost:3001')

// Store connected clients
const connections = new Map()
const gameRooms = new Map()

wss.on('connection', async (ws, request) => {
  const connectionId = Math.random().toString(36).substr(2, 9)
  console.log(`✅ Client connected: ${connectionId}`)

  connections.set(connectionId, {
    ws,
    userId: null,
    gameId: null,
    authenticated: false
  })

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString())
      await handleMessage(connectionId, message)
    } catch (error) {
      console.error('❌ WebSocket message error:', error)
    }
  })

  ws.on('close', () => {
    console.log(`❌ Client disconnected: ${connectionId}`)
    connections.delete(connectionId)

    // Remove from game rooms
    for (const [gameId, clients] of gameRooms.entries()) {
      if (clients.has(connectionId)) {
        clients.delete(connectionId)
        if (clients.size === 0) {
          gameRooms.delete(gameId)
        }
        break
      }
    }
  })

  ws.on('error', (error) => {
    console.error(`❌ WebSocket error for ${connectionId}:`, error)
  })
})

async function handleMessage(connectionId, message) {
  const connection = connections.get(connectionId)
  if (!connection) return

  console.log(`📨 Message from ${connectionId}:`, message)

  switch (message.type) {
    case 'authenticate':
      // Simple authentication for now
      connection.authenticated = true
      connection.userId = message.userId || 'anonymous'
      connection.ws.send(JSON.stringify({
        type: 'authenticated',
        success: true,
        userId: connection.userId
      }))
      break

    case 'joinGame':
      if (!connection.authenticated) {
        connection.ws.send(JSON.stringify({
          type: 'error',
          message: 'Not authenticated'
        }))
        return
      }

      const gameId = message.gameId
      if (!gameRooms.has(gameId)) {
        gameRooms.set(gameId, new Set())
      }

      gameRooms.get(gameId).add(connectionId)
      connection.gameId = gameId

      // Broadcast to all players in the game
      broadcastToGame(gameId, {
        type: 'playerJoined',
        userId: connection.userId,
        message: `${connection.userId} joined the game`
      })

      connection.ws.send(JSON.stringify({
        type: 'joinedGame',
        gameId,
        success: true
      }))
      break

    case 'gameAction':
      if (connection.gameId) {
        broadcastToGame(connection.gameId, {
          type: 'gameAction',
          userId: connection.userId,
          action: message.action,
          data: message.data
        })
      }
      break

    case 'chat':
      if (connection.gameId) {
        broadcastToGame(connection.gameId, {
          type: 'chat',
          userId: connection.userId,
          message: message.message
        })
      }
      break

    case 'ping':
      connection.ws.send(JSON.stringify({ type: 'pong' }))
      break
  }
}

function broadcastToGame(gameId, message) {
  const clients = gameRooms.get(gameId)
  if (!clients) return

  for (const clientId of clients) {
    const connection = connections.get(clientId)
    if (connection && connection.ws.readyState === 1) { // OPEN
      connection.ws.send(JSON.stringify(message))
    }
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down WebSocket server...')
  wss.close(() => {
    console.log('✅ WebSocket server closed')
    process.exit(0)
  })
})
