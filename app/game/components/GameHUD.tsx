"use client"
import { useEffect, useRef, useState } from 'react'
import GameEffects from './GameEffects'

export default function GameHUD({ feed }: { feed: Array<any> }) {
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    if (!feed?.length) return
    setResults(prev => [...prev, ...feed])
  }, [feed])

  return (
    <div className="game-hud">
      <GameEffects results={results} />
    </div>
  )
}
