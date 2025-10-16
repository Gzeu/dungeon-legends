"use client"
import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'

interface ChatMessage {
  id: string
  userId: string
  name: string
  text: string
  time: number
}

export default function GameChat({ gameId }: { gameId: string }) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const listRef = useRef<HTMLDivElement | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const wsUrl = process.env.NODE_ENV === 'production' 
      ? `wss://${window.location.host}/ws`
      : 'ws://localhost:3001'
    
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'joinGame', gameId, userId: session?.user?.id }))
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'chatMessage') {
        setMessages(prev => [...prev, data.message])
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
      }
    }

    return () => { ws.close() }
  }, [gameId, session?.user?.id])

  const sendMessage = () => {
    const text = input.trim()
    if (!text) return
    wsRef.current?.send(JSON.stringify({
      type: 'chatMessage',
      gameId,
      userId: session?.user?.id,
      name: session?.user?.name || 'Player',
      text
    }))
    setInput('')
  }

  return (
    <div className="game-chat">
      <div className="chat-list" ref={listRef}>
        {messages.map(m => (
          <div key={m.id} className={`chat-item ${m.userId === session?.user?.id ? 'me' : ''}`}>
            <span className="chat-name">{m.name}:</span>
            <span className="chat-text">{m.text}</span>
          </div>
        ))}
      </div>
      <div className="chat-input-row">
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..."/>
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  )
}
