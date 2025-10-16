"use client"
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface MiniCardProps {
  name: string
  school?: string
  rarity: 'common'|'uncommon'|'rare'|'epic'|'legendary'
  icon?: string
}

export function MiniCard({ name, school, rarity, icon }: MiniCardProps) {
  const [particles, setParticles] = useState(Array.from({ length: 6 }, () => ({ x: Math.random()*100, y: Math.random()*100, d: Math.random()*2+1 })))

  useEffect(() => {
    const id = setInterval(() => {
      setParticles(ps => ps.map(p => ({ ...p, y: (p.y - p.d + 100) % 100 })))
    }, 1000/30)
    return () => clearInterval(id)
  }, [])

  return (
    <div className={`game-card ${rarity}`}>
      <div className="card-inner">
        <div className="card-icon">{icon || '✨'}</div>
        <div className="card-name">{name}</div>
        <div className="card-school">{school}</div>
      </div>
      <AnimatePresence>
        {particles.map((p, i) => (
          <motion.span key={i} className="particle" initial={{ opacity: 0 }} animate={{ opacity: 0.6, x: `${p.x}%`, y: `${p.y}%` }} exit={{ opacity: 0 }} />
        ))}
      </AnimatePresence>
    </div>
  )
}
