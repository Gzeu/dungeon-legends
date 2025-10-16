"use client"
import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'

export default function SecureGameChat({ gameId }: { gameId: string }) {
  const { data: session } = useSession()
  const [ready, setReady] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!session?.user?.id) return
    const wsUrl = process.env.NODE_ENV === 'production' 
      ? `wss://${window.location.host}/ws/secure`
      : 'ws://localhost:3001/secure'

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = async () => {
      // fetch ephemeral JWT for WS from server
      const tokenRes = await fetch('/api/auth/ws-token')
      const { token } = await tokenRes.json()
      ws.send(JSON.stringify({ type: 'authenticate', token }))
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'authenticated') {
        setReady(true)
        ws.send(JSON.stringify({ type: 'joinGame', gameId }))
      }
    }

    return () => { ws.close() }
  }, [session?.user?.id, gameId])

  return ready ? <div>Secure Chat Connected</div> : <div>Connecting secure chat...</div>
}
