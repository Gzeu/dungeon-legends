"use client"
import { useSession } from 'next-auth/react'
import LobbyPageEnhanced from './enhanced/page'

export default function Lobby() {
  const { data: session } = useSession()
  return <LobbyPageEnhanced />
}
