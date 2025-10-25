"use client"
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <main className="landing">
      <section className="hero">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          Dungeon Legends
        </motion.h1>
        <motion.p className="tagline" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
          A dark gothic RPG with card-based combat, progression, and real-time adventures.
        </motion.p>
        <motion.div className="cta" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}>
          <Link href="/lobby" className="btn btn-primary">Play Now</Link>
          <Link href="/how-to" className="btn btn-secondary">How to Play</Link>
        </motion.div>
      </section>

      <section className="features">
        <Feature icon="🐉" title="Epic Bosses" desc="Face the Ancient Dragon and more."/>
        <Feature icon="🧙" title="5 Spell Schools" desc="Fire, Ice, Nature, Shadow, Light combos."/>
        <Feature icon="🤖" title="Smart AI" desc="Adaptive allies and ruthless enemies."/>
        <Feature icon="🏆" title="Prestige & Mastery" desc="Endgame progression with artifacts."/>
      </section>

      <section className="teaser">
        <motion.div className="teaser-card" whileHover={{ scale: 1.03 }}>
          <div className="teaser-bg" />
          <h3>Enter the Dragon's Lair</h3>
          <p>Can your party survive the fire?</p>
          <Link href="/lobby" className="btn btn-accent">Start Adventure</Link>
        </motion.div>
        <motion.div className="teaser-card" whileHover={{ scale: 1.03 }}>
          <div className="teaser-bg alt" />
          <h3>Create Your Guild</h3>
          <p>Gather allies for raids and tournaments.</p>
          <Link href="/profile" className="btn btn-accent">Build Legacy</Link>
        </motion.div>
      </section>
    </main>
  )
}

function Feature({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <motion.div className="feature" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <div className="icon">{icon}</div>
      <h4>{title}</h4>
      <p>{desc}</p>
    </motion.div>
  )
}
