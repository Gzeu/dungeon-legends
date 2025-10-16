"use client"
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import GameChat from '../components/GameChat'

export default function SpectatorView() {
  const { id } = useParams()
  const [gameState, setGameState] = useState<any>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!id) return
    const wsUrl = process.env.NODE_ENV === 'production' 
      ? `wss://${window.location.host}/ws`
      : 'ws://localhost:3001'
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'joinGame', gameId: id, userId: 'spectator' }))
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'gameStateUpdate') setGameState(data.gameState)
    }

    return () => { ws.close() }
  }, [id])

  if (!gameState) return <div>Loading spectator view...</div>

  return (
    <div className="spectator-container">
      <h2>Spectating Game {id}</h2>
      <div className="spectator-board">
        <pre>{JSON.stringify(gameState, null, 2)}</pre>
      </div>
      <GameChat gameId={id as string} />
    </div>
  )
}
