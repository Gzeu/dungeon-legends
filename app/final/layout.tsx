import '../styles/final.css'
import { useEffect } from 'react'

export default function FinalUX({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Global listener that forwards button actions to WS client via custom event
    const onSend = (e: any) => {
      const detail = e.detail || {}
      const sock: WebSocket | undefined = (window as any).GLOBAL_WS_SOCKET
      if (sock?.readyState === 1) {
        sock.send(JSON.stringify({ type: 'gameAction', action: detail.action, data: detail }))
      }
    }
    window.addEventListener('SEND_GAME_ACTION', onSend)
    return () => window.removeEventListener('SEND_GAME_ACTION', onSend)
  }, [])

  return children
}
