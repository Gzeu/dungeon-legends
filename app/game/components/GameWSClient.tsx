"use client"
import { useSecureWS } from '@/app/hooks/useSecureWS'
import { useEffect, useState } from 'react'

export default function GameWSClient({ gameId, onState, onResult }: { gameId: string, onState: (s:any)=>void, onResult: (r:any)=>void }) {
  const { ready, send } = useSecureWS('/ws/secure')
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!ready) return
    send({ type: 'joinGame', gameId })
    setConnected(true)
  }, [ready, gameId, send])

  useEffect(() => {
    // Attach passive listener via global socket (optional improvement: expose events in hook)
    const sock = (window as any).GLOBAL_WS_SOCKET
    if (!sock) return
    const onMessage = (e: MessageEvent) => {
      const data = JSON.parse(e.data)
      if (data.type === 'gameStateUpdate') onState(data.gameState)
      if (data.type === 'actionResult') onResult(data.results)
    }
    sock.addEventListener('message', onMessage)
    return () => sock.removeEventListener('message', onMessage)
  }, [onState, onResult])

  return <div className="ws-indicator">WS: {connected ? 'connected' : 'connecting...'}</div>
}
