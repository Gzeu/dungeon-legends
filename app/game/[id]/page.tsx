"use client"
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import GameWSClient from '../components/GameWSClient'
import GameHUD from '../components/GameHUD'

export default function GamePage() {
  const { id } = useParams()
  const [gameState, setGameState] = useState<any>(null)
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    // Initial load for SSR fallback
    const load = async () => {
      const res = await fetch('/api/game/state', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ gameId: id }) })
      const data = await res.json()
      if (data.gameState) setGameState(data.gameState)
    }
    load()
  }, [id])

  return (
    <div className="game-page">
      <GameWSClient gameId={id as string} onState={setGameState} onResult={(r:any)=> setResults(prev => [...prev, ...r])} />
      {/* TODO: Replace this pre dump with real UI bindings */}
      <pre style={{ maxHeight: 320, overflow: 'auto' }}>{JSON.stringify(gameState, null, 2)}</pre>
      <GameHUD feed={results} />
    </div>
  )
}
