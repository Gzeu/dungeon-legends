"use client"
import { useState } from 'react'
import { useParams } from 'next/navigation'
import GameWSClient from '../components/GameWSClient'
import GameHUD from '../components/GameHUD'
import SecureGameChat from '../components/SecureGameChat'

export default function GamePage() {
  const { id } = useParams()
  const [gameState, setGameState] = useState<any>(null)
  const [results, setResults] = useState<any[]>([])

  // Button handlers
  function sendAction(action: string, extra: any = {}) {
    // Use send from GameWSClient (would use a context/provider in full app)
    window.dispatchEvent(new CustomEvent('SEND_GAME_ACTION', { detail: { action, ...extra } }))
  }

  // Game board rendering util
  function renderBoard() {
    if (!gameState) return <div className="skeleton" style={{height:320,margin:'20px 0'}} />
    const room = gameState.rooms?.[gameState.currentRoom]
    return (
      <div className="game-board">
        <div className="room-header">
          <div className="room-name">{room?.name}</div>
          <div className="room-type">{room?.type}</div>
        </div>
        <div className="room-content">
          {room?.enemy && (
            <div className="enemy-card">
              <img src={room.enemy.image || "/images/enemies/dragon.jpg"} alt="enemy img" style={{width:86,borderRadius:10}}/>
              <div className="enemy-name">{room.enemy.name}</div>
              <div className="enemy-hp">HP: {room.enemy.currentHP}/{room.enemy.maxHP}</div>
            </div>
          )}
        </div>
        <div className="players-row">
          {gameState.players?.map((p:any,k:number) => (
            <div key={k} className="player-card">
              <img src={`/images/heroes/${p.hero?.type}-portrait.jpg`} style={{width:56,borderRadius:10}}/>
              <div className="player-name">{p.name}</div>
              <span className="player-hp">HP: {p.hero?.currentHealth}/{p.hero?.maxHealth}</span>
            </div>
          ))}
        </div>
        <div className="hand-row">
          <span>Your hand:</span>
          {gameState.players?.[gameState.currentPlayer]?.hand?.map((c:any,i:number) => (
            <div key={i} className={`game-card ${c.rarity}`} style={{display:'inline-block',margin:'0 3px'}}>
              <span>{c.icon}</span> <span>{c.name}</span>
            </div>
          ))}
        </div>
        <div className="actions-row">
          <button className="btn-primary" onClick={()=>sendAction('attack')}>Attack</button>
          <button className="btn-secondary" onClick={()=>sendAction('defend')}>Defend</button>
          <button className="btn-accent" onClick={()=>sendAction('special')}>Special</button>
          <button className="btn-secondary" onClick={()=>sendAction('pass')}>Pass</button>
        </div>
      </div>
    )
  }

  return (
    <div className="game-page">
      <GameWSClient gameId={id as string} onState={setGameState} onResult={(r:any)=> setResults(prev => [...prev, ...r])} />
      {renderBoard()}
      <GameHUD feed={results} />
      <div className="game-chat-float"><SecureGameChat gameId={id as string}/></div>
    </div>
  )
}
