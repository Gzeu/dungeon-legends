"use client"
import { useEffect, useState } from 'react'

const HEROES = [
  { value: 'knight', label: '🛡️ Knight' },
  { value: 'wizard', label: '🧙 Wizard' },
  { value: 'rogue', label: '🗡️ Rogue' },
  { value: 'cleric', label: '⛪ Cleric' }
]

export default function LobbyPageEnhanced() {
  const [selected, setSelected] = useState<string>('knight')
  const [HeroSelector, setHeroSelector] = useState<any>(null)

  useEffect(() => {
    // Try load optional HeroSelector component if it exists
    import('./components/HeroSelector')
      .then((m) => setHeroSelector(() => (m.default || m.HeroSelector)))
      .catch(() => setHeroSelector(null))
  }, [])

  return (
    <div className="lobby-container">
      <h2 className="text-2xl font-bold mb-2">Lobby</h2>
      <p className="mb-3">Assemble your party. Choose a hero to begin:</p>

      {HeroSelector ? (
        <HeroSelector onSelect={(t: string) => setSelected(t)} />
      ) : (
        <div className="form-group">
          <label htmlFor="hero" className="form-label">Choose Hero</label>
          <select
            id="hero"
            className="input form-control"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {HEROES.map(h => (
              <option key={h.value} value={h.value}>{h.label}</option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-4">
        <button className="btn btn-primary" onClick={() => startQuickGame(selected)}>
          Start Quick Adventure as {selected}
        </button>
      </div>
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
