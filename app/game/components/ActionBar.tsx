"use client"
import Image from 'next/image'

export default function ActionBar({ onAction }: { onAction: (a:string)=>void }) {
  return (
    <div className="action-bar">
      <button className="action-btn" onClick={()=>onAction('attack')} title="Attack"><Image src="/icons/ui/sword.svg" alt="attack" width={22} height={22}/><span className="cooldown"/></button>
      <button className="action-btn" onClick={()=>onAction('defend')} title="Defend"><Image src="/icons/ui/shield.svg" alt="defend" width={22} height={22}/><span className="cooldown"/></button>
      <button className="action-btn" onClick={()=>onAction('special')} title="Special"><Image src="/icons/ui/wand.svg" alt="special" width={22} height={22}/><span className="cooldown"/></button>
      <button className="action-btn" onClick={()=>onAction('potion')} title="Potion"><Image src="/icons/ui/potion.svg" alt="potion" width={22} height={22}/><span className="cooldown"/></button>
    </div>
  )
}
