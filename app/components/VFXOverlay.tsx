"use client"
import { useEffect, useRef } from 'react'

export function VFXOverlay() {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    let raf = 0
    let t = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
    }
    const loop = () => {
      t += 0.02
      ctx.clearRect(0,0,canvas.width,canvas.height)
      // Soft glow pulses
      for (let i=0;i<5;i++) {
        const x = (Math.sin(t+i) * 0.3 + 0.5) * canvas.width
        const y = (Math.cos(t+i*0.7) * 0.3 + 0.5) * canvas.height
        const r = 60 + Math.sin(t+i)*20
        const g = ctx.createRadialGradient(x,y,0,x,y,r)
        g.addColorStop(0, 'rgba(255,120,79,0.10)')
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x,y,r,0,Math.PI*2)
        ctx.fill()
      }
      raf = requestAnimationFrame(loop)
    }

    resize()
    window.addEventListener('resize', resize)
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={ref} className="vfx-overlay"/>
}
