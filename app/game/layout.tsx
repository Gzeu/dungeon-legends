import '../../styles/polish.css'
import { VFXOverlay } from '../components/VFXOverlay'
import { MiniCard } from '../components/MiniCard'

export default function GamePolishLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="polish-container">
      <VFXOverlay />
      {children}
      <div className="deck-preview">
        <MiniCard name="Fireball" school="fire" rarity="rare" icon="🔥"/>
        <MiniCard name="Ice Shard" school="ice" rarity="uncommon" icon="❄️"/>
        <MiniCard name="Blessing" school="light" rarity="epic" icon="✨"/>
        <MiniCard name="Shadow Strike" school="shadow" rarity="rare" icon="🗡️"/>
      </div>
    </div>
  )
}
