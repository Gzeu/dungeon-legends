import '../styles/game-polish.css'
import { useEffect, useRef, useState } from 'react'
import { CombatVFX } from '@/app/components/CombatVFX'

export default function GameEffects({ results }: { results: Array<any> }) {
  const [queue, setQueue] = useState<any[]>([])
  const [combo, setCombo] = useState<number>(0)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!results?.length) return
    setQueue(q => [...q, ...results])
  }, [results])

  useEffect(() => {
    if (queue.length === 0) return
    const item = queue[0]

    // Result toast
    showToast(item)

    // Combo streak logic
    if (item.type === 'combo') {
      setCombo(c => c + 1)
      setTimeout(() => setCombo(c => Math.max(0, c - 1)), 4000)
    }

    // Enemy VFX on damage
    if (item.type === 'damage') {
      containerRef.current?.classList.add('enemy-shake')
      setTimeout(() => containerRef.current?.classList.remove('enemy-shake'), 450)
    }

    const timer = setTimeout(() => setQueue(q => q.slice(1)), 700)
    return () => clearTimeout(timer)
  }, [queue])

  function showToast(item: any) {
    const t = document.createElement('div')
    t.className = `result-toast ${item.type === 'combo' ? 'combo' : ''}`
    t.textContent = item.message
    document.body.appendChild(t)
    setTimeout(() => { t.style.opacity = '0' }, 600)
    setTimeout(() => { document.body.removeChild(t) }, 1200)
  }

  const latest = queue[0]
  const vfxType = latest?.spellSchool || (latest?.type === 'damage' ? 'hit' : undefined)

  return (
    <div ref={containerRef} style={{ position: 'relative', minHeight: 1 }}>
      {vfxType && <CombatVFX trigger={latest} type={vfxType} />}
      {combo > 0 && <div className="combo-streak">COMBO x{combo}</div>}
    </div>
  )
}
