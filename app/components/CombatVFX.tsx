"use client"
import { useEffect, useRef } from 'react'

export function CombatVFX({ trigger, type }: { trigger: any, type: 'hit'|'fire'|'ice'|'light'|'shadow'|'nature' }) {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!trigger) return
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = canvas.clientWidth * dpr
    canvas.height = canvas.clientHeight * dpr

    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      life: Math.random() * 40 + 30
    }))

    let frame = 0
    const loop = () => {
      frame++
      ctx.clearRect(0,0,canvas.width,canvas.height)
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        p.life--
        const alpha = Math.max(0, p.life / 70)
        ctx.fillStyle = colorFor(type, alpha)
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2, 0, Math.PI*2)
        ctx.fill()
      })
      if (frame < 70) requestAnimationFrame(loop)
    }
    loop()
  }, [trigger, type])

  return <canvas ref={ref} className={`combat-vfx combat-${type}`}/>
}

function colorFor(type: string, a: number) {
  switch (type) {
    case 'fire': return `rgba(255,120,79,${a})`
    case 'ice': return `rgba(103,167,255,${a})`
    case 'light': return `rgba(255,213,121,${a})`
    case 'shadow': return `rgba(120,120,140,${a})`
    case 'nature': return `rgba(121,255,168,${a})`
    default: return `rgba(255,255,255,${a})`
  }
}
