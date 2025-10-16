"use client"
import HeroSelectorPro from './components/HeroSelectorPro'
import GameCard from '@/app/components/cards/GameCard'
import { useState } from 'react'

export default function LobbyAdvanced() {
  const [selected, setSelected] = useState<string| null>(null)

  return (
    <div className="lobby-container">
      <h2 className="text-2xl font-bold mb-2">Lobby</h2>
      <HeroSelectorPro onSelect={setSelected} />
      <div style={{ marginTop: 16 }}>
        <div className="deck-preview">
          <GameCard name="Fireball" school="fire" rarity="rare" icon="🔥"/>
          <GameCard name="Ice Shard" school="ice" rarity="uncommon" icon="❄️"/>
          <GameCard name="Blessing" school="light" rarity="epic" icon="✨"/>
          <GameCard name="Shadow Strike" school="shadow" rarity="rare" icon="🗡️"/>
        </div>
      </div>
      {selected && (
        <div className="mt-4">
          <button className="btn-primary" onClick={()=> startQuickGame(selected)}>Start as {selected}</button>
        </div>
      )}
    </div>
  )
}

async function startQuickGame(heroType: string) {
  const res = await fetch('/api/game/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ players: [{ userId: 'local', name: 'You', heroType }] })
  })
  const data = await res.json()
  if (data.gameId) window.location.href = `/game/${data.gameId}`
}
