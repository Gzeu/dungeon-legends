"use client"
import dynamic from 'next/dynamic'

const VFXOverlay = dynamic(() => import('./VFXOverlay'), { ssr: false, loading: () => null })
const CombatVFX = dynamic(() => import('./CombatVFX'), { ssr: false, loading: () => null })

export default function EffectsRoot() { return (<>
  <VFXOverlay />
  <CombatVFX />
</>) }
