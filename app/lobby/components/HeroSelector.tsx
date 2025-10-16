"use client"
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const HEROES = [
  { type: 'knight', name: 'Knight', icon: '🛡️', hp: 8, mp: 3, atk: 2, def: 2, desc: 'Protector with Shield Wall' },
  { type: 'wizard', name: 'Wizard', icon: '🧙', hp: 5, mp: 5, atk: 1, def: 0, desc: 'Elemental master with Arcane Blast' },
  { type: 'rogue', name: 'Rogue', icon: '🗡️', hp: 6, mp: 4, atk: 2, def: 1, desc: 'Stealth assassin with Shadow Step' },
  { type: 'cleric', name: 'Cleric', icon: '⛪', hp: 7, mp: 4, atk: 1, def: 1, desc: 'Holy healer with Divine Intervention' }
]

export default function HeroSelector({ onSelect }: { onSelect: (heroType: string) => void }) {
  const [hover, setHover] = useState<string | null>(null)

  return (
    <div className="hero-selector">
      <h3 className="selector-title">Choose Your Hero</h3>
      <div className="selector-grid">
        {HEROES.map(h => (
          <motion.div
            key={h.type}
            className={`hero-card ${hover === h.type ? 'hover' : ''}`}
            whileHover={{ y: -6, scale: 1.02 }}
            onMouseEnter={() => setHover(h.type)}
            onMouseLeave={() => setHover(null)}
            onClick={() => onSelect(h.type)}
          >
            <div className="hero-top">
              <div className="hero-icon">{h.icon}</div>
              <div className="hero-name">{h.name}</div>
            </div>
            <div className="hero-bars">
              <StatBar label="HP" value={h.hp} max={10} color="#ff784f"/>
              <StatBar label="MP" value={h.mp} max={6} color="#67a7ff"/>
              <StatBar label="ATK" value={h.atk} max={4} color="#ffd579"/>
              <StatBar label="DEF" value={h.def} max={4} color="#86efac"/>
            </div>
            <div className="hero-desc">{h.desc}</div>
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {hover && (
          <motion.div className="selector-tooltip" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}>
            {HEROES.find(h => h.type === hover)?.name}: {HEROES.find(h => h.type === hover)?.desc}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatBar({ label, value, max, color }: { label: string, value: number, max: number, color: string }) {
  return (
    <div className="stat-row">
      <span className="stat-label">{label}</span>
      <div className="stat-bar"><div className="stat-fill" style={{ width: `${(value/max)*100}%`, background: color }} /></div>
    </div>
  )
}
