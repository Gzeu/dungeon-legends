import '../styles/action-bar.css'
import GameActionsBar from './components/GameActionsBar'

export default function GameWithActionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="game-with-actions">
      {children}
      <GameActionsBar />
    </div>
  )
}
