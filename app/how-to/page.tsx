"use client"
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function HowTo() {
  return (
    <div className="howto">
      <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>How to Play</motion.h2>
      <div className="how-grid">
        <Card title="Pick Your Hero" icon="🛡️" text="Knight, Wizard, Rogue, Cleric – each with unique specials."/>
        <Card title="Build Your Hand" icon="🃏" text="Play spells and equipment, trigger powerful combos."/>
        <Card title="Clear the Dungeon" icon="🗺️" text="Survive 5 rooms and defeat the Ancient Dragon."/>
        <Card title="Level Up" icon="📈" text="Gain XP, unlock skills, collect legendary gear."/>
      </div>
      <div className="how-cta">
        <Link href="/lobby" className="btn-primary">Play Now</Link>
      </div>
    </div>
  )
}

function Card({ title, icon, text }: { title: string, icon: string, text: string }) {
  return (
    <motion.div className="how-card" whileHover={{ y: -4 }}>
      <div className="how-icon">{icon}</div>
      <h4>{title}</h4>
      <p>{text}</p>
    </motion.div>
  )
}
