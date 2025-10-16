"use client"
import { useState } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'

const HEROES = [
  { type: 'knight', name: 'Knight', icon: '🛡️', role: 'Tank', hp: 8, mp: 3, atk: 2, def: 2, desc: 'Protector with Shield Wall' },
  { type: 'wizard', name: 'Wizard', icon: '🧙', role: 'DPS', hp: 5, mp: 5, atk: 1, def: 0, desc: 'Elemental master with Arcane Blast' },
  { type: 'rogue', name: 'Rogue', icon: '🗡️', role: 'DPS', hp: 6, mp: 4, atk: 2, def: 1, desc: 'Stealth assassin with Shadow Step' },
  { type: 'cleric', name: 'Cleric', icon: '⛪', role: 'Healer', hp: 7, mp: 4, atk: 1, def: 1, desc: 'Holy healer with Divine Intervention' }
]

export default function HeroSelectorPro({ onSelect }: { onSelect: (heroType: string) => void }) {
  const [hover, setHover] = useState<string | null>(null)

  return (
    <div className="hero-selector pro">
      <h3 className="selector-title">Choose Your Hero</h3>
      <div className="selector-grid">
        {HEROES.map(h => (
          <TiltCard key={h.type} onClick={() => onSelect(h.type)} onHover={(v)=> setHover(v ? h.type : null)}>
            <div className="hero-top">
              <div className="hero-icon">{h.icon}</div>
              <div className="hero-name">{h.name}</div>
              <span className={`role-badge ${h.role.toLowerCase()}`}>{h.role}</span>
            </div>
            <div className="hero-bars">
              <StatBar label="HP" value={h.hp} max={10} color="#ff784f"/>
              <StatBar label="MP" value={h.mp} max={6} color="#67a7ff"/>
              <StatBar label="ATK" value={h.atk} max={4} color="#ffd579"/>
              <StatBar label="DEF" value={h.def} max={4} color="#86efac"/>
            </div>
            <div className="hero-desc">{h.desc}</div>
          </TiltCard>
        ))}
      </div>
      {hover && (
        <motion.div className="selector-tooltip" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          {HEROES.find(h => h.type === hover)?.name}: {HEROES.find(h => h.type === hover)?.desc}
        </motion.div>
      )}
    </div>
  )
}

function TiltCard({ children, onClick, onHover }: { children: React.ReactNode, onClick: ()=>void, onHover: (v:boolean)=>void }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-50, 50], [10, -10])
  const rotateY = useTransform(x, [-50, 50], [-10, 10])

  return (
    <motion.div
      className="hero-card pro"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        x.set(e.clientX - r.left - r.width/2)
        y.set(e.clientY - r.top - r.height/2)
      }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => { x.set(0); y.set(0); onHover(false) }}
      onClick={onClick}
      style={{ rotateX, rotateY }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <div className="spotlight"/>
      {children}
    </motion.div>
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
