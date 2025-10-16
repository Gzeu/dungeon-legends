"use client"
import { motion } from 'framer-motion'

export type Rarity = 'common'|'uncommon'|'rare'|'epic'|'legendary'

export default function GameCard({ name, school, rarity, icon, onClick }: { name: string, school?: string, rarity: Rarity, icon?: string, onClick?: ()=>void }) {
  return (
    <motion.div className={`game-card pro ${rarity}`} whileHover={{ rotateY: 6, scale: 1.02 }}>
      <div className="card-frame"/>
      <div className="card-inner">
        <div className="card-icon">{icon || '✨'}</div>
        <div className="card-name">{name}</div>
        <div className="card-school">{school}</div>
      </div>
      <div className="holo"/>
    </motion.div>
  )
}
