"use client"
import ActionBar from '../components/ActionBar'
import { useCallback } from 'react'

export default function GameActionsBar() {
  const onAction = useCallback((a:string)=>{
    window.dispatchEvent(new CustomEvent('SEND_GAME_ACTION', { detail: { action: a }}))
    const btns = document.querySelectorAll('.action-btn .cooldown')
    btns.forEach(el => { (el as HTMLElement).setAttribute('data-active','true'); setTimeout(()=> (el as HTMLElement).removeAttribute('data-active'), 4000) })
  },[])
  return <div style={{marginTop:10}}><ActionBar onAction={onAction}/></div>
}
