import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyWSJwt } from '@/lib/ws-auth'

const connections = new Map<string, any>()
const gameRooms = new Map<string, Set<string>>()

export async function GET(request: NextRequest) {
  if (request.headers.get('upgrade') !== 'websocket') {
    return new Response('Expected WebSocket', { status: 426 })
  }

  const { socket, response } = Deno.upgradeWebSocket(request)
  const connectionId = crypto.randomUUID()

  socket.onopen = () => {
    connections.set(connectionId, { socket, gameId: null, userId: null, authed: false })
  }

  socket.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data)
      switch (data.type) {
        case 'authenticate': {
          const payload = verifyWSJwt(data.token)
          if (payload?.sub) {
            const c = connections.get(connectionId)
            c.authed = true
            c.userId = payload.sub
            socket.send(JSON.stringify({ type: 'authenticated', userId: payload.sub }))
          } else {
            socket.send(JSON.stringify({ type: 'error', message: 'Invalid token' }))
          }
          break
        }
        case 'joinGame': {
          const c = connections.get(connectionId)
          if (!c?.authed) return socket.send(JSON.stringify({ type: 'error', message: 'Unauthenticated' }))
          joinRoom(connectionId, data.gameId, c.userId)
          break
        }
        case 'chatMessage': {
          const c = connections.get(connectionId)
          if (!c?.authed) return
          await handleChatMessage(connectionId, data)
          break
        }
        case 'gameAction': {
          const c = connections.get(connectionId)
          if (!c?.authed) return
          // Forward to game action handler (existing logic)
          // ...
          break
        }
      }
    } catch (e) {
      socket.send(JSON.stringify({ type: 'error', message: 'Invalid message' }))
    }
  }

  socket.onclose = () => {
    const conn = connections.get(connectionId)
    if (conn?.gameId) {
      gameRooms.get(conn.gameId)?.delete(connectionId)
    }
    connections.delete(connectionId)
  }

  return response
}

function joinRoom(connectionId: string, gameId: string, userId: string) {
  if (!gameRooms.has(gameId)) gameRooms.set(gameId, new Set())
  gameRooms.get(gameId)!.add(connectionId)
  const c = connections.get(connectionId)
  if (c) { c.gameId = gameId; c.userId = userId }
}

async function handleChatMessage(connectionId: string, data: any) {
  const conn = connections.get(connectionId)
  if (!conn?.gameId) return

  const message = {
    id: crypto.randomUUID(),
    userId: conn.userId,
    name: data.name,
    text: data.text,
    time: Date.now()
  }

  broadcast(conn.gameId, { type: 'chatMessage', message })
}

function broadcast(gameId: string, payload: any) {
  const room = gameRooms.get(gameId)
  if (!room) return
  const msg = JSON.stringify(payload)
  room.forEach(cid => {
    const c = connections.get(cid)
    if (c?.socket?.readyState === 1) c.socket.send(msg)
  })
}
