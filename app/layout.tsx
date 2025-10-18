import './globals.css'
import '../styles/advanced-ui.css'
import '../styles/chat-spectator.css'
import { Cinzel } from 'next/font/google'
import Link from 'next/link'
import { Suspense } from 'react'
import { AuthProvider } from './components/AuthProvider'

export const metadata = {
  title: 'Dungeon Legends',
  description: 'Dark gothic RPG with card-based combat and progression'
}

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400','600','700'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${cinzel.className}`}>
        <AuthProvider>
          <header className="site-header">
            <nav className="nav">
              <Link href="/" className="brand">🏰 Dungeon Legends</Link>
              <div className="links">
                <Link href="/lobby">Play</Link>
                <Link href="/how-to">How To</Link>
                <Link href="/profile">Profile</Link>
              </div>
            </nav>
          </header>
          <Suspense>
            {children}
          </Suspense>
        </AuthProvider>
        <footer className="site-footer">
          <div>© {new Date().getFullYear()} Dungeon Legends • Built for Vercel</div>
        </footer>
      </body>
    </html>
  )
}
