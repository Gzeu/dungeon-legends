"use client"
import { useState } from 'react'
import HeroSelector from '../components/HeroSelector'

export default function LobbyPageEnhanced() {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="lobby-container">
      <h2 className="text-2xl font-bold mb-2">Lobby</h2>
      <p className="mb-3">Assemble your party. Choose a hero to begin:</p>
      <HeroSelector onSelect={(t) => setSelected(t)} />

      {selected && (
        <div className="mt-4">
          <button className="btn-primary" onClick={() => startQuickGame(selected)}>Start Quick Adventure as {selected}</button>
        </div>
      )}
    </div>
  )
}

async function startQuickGame(heroType: string) {
  const res = await fetch('/api/game/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      players: [
        { userId: 'local', name: 'You', heroType }
      ]
    })
  })
  const data = await res.json()
  if (data.gameId) window.location.href = `/game/${data.gameId}`
}
