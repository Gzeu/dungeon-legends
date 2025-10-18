"use client"
import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'

export function useSecureWS(path: string) {
  const { data: session } = useSession()
  const wsRef = useRef<WebSocket | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true
    async function connect() {
      if (!session?.user?.id) return
      const base = process.env.NODE_ENV === 'production' ? `wss://${window.location.host}` : 'ws://localhost:3001'
      const ws = new WebSocket(`${base}${path}`)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('🔗 WebSocket connected successfully')
        // Simple authentication for development
        ws.send(JSON.stringify({
          type: 'authenticate',
          userId: session.user.id
        }))
        if (active) setReady(true)
      }

      ws.onmessage = (e) => {
        if (!active) return
        console.log('📨 WebSocket message:', e.data)
      }

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
      }

      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected')
        if (active) setReady(false)
      }

      return () => {
        active = false
        ws.close()
      }
    }

    connect()
  }, [session?.user?.id, path])

  const send = (payload: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload))
    }
  }

  return { ready, send, socket: wsRef }
}
