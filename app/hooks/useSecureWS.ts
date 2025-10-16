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
      ws.onopen = async () => {
        const res = await fetch('/api/auth/ws-token')
        const { token } = await res.json()
        ws.send(JSON.stringify({ type: 'authenticate', token }))
      }
      ws.onmessage = (e) => {
        if (!active) return
        const data = JSON.parse(e.data)
        if (data.type === 'authenticated') setReady(true)
      }
      ws.onclose = () => { setReady(false) }
    }
    connect()
    return () => { active = false; wsRef.current?.close() }
  }, [session?.user?.id, path])

  const send = (payload: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload))
    }
  }

  return { ready, send, socket: wsRef }
}
