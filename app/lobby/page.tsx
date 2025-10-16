"use client"
import { useState } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LobbyPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [gameId, setGameId] = useState("")
  const router = useRouter()

  const createGame = async () => {
    setLoading(true)
    const res = await fetch("/api/game/create", {
      method: "POST",
      body: JSON.stringify({
        players: [
          { userId: session.user.id, name: session.user.name, heroType: "knight" }
        ]
      }),
      headers: { "Content-Type": "application/json" }
    })
    const data = await res.json()
    setLoading(false)
    if (data.gameId) router.push(`/game/${data.gameId}`)
  }

  const joinGame = async () => {
    if (!gameId) return
    setLoading(true)
    const res = await fetch("/api/game/join", {
      method: "POST",
      body: JSON.stringify({ gameId, userId: session.user.id }),
      headers: { "Content-Type": "application/json" }
    })
    setLoading(false)
    if (res.ok) router.push(`/game/${gameId}`)
  }

  if (!session?.user) return (
    <div className="lobby-container"><button onClick={() => signIn()}>Sign In</button></div>
  )

  return (
    <div className="lobby-container">
      <h2 className="text-2xl font-bold mb-2">Lobby</h2>
      <button className="btn-primary w-full mb-4" onClick={createGame} disabled={loading}>Create New Game</button>
      <input className="input w-full mb-2" value={gameId} onChange={e => setGameId(e.target.value)} placeholder="Enter Game ID" />
      <button className="btn-secondary w-full" onClick={joinGame} disabled={loading || !gameId}>Join Game</button>
    </div>
  )
}
