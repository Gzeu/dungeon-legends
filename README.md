# 🏰 Dungeon Legends

> Epic Medieval RPG with card-based combat, hero progression, and cooperative gameplay

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FGzeu%2Fdungeon-legends)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)

## 🎮 Play Now

**Live Demo:** [https://dungeon-legends.vercel.app](https://dungeon-legends.vercel.app)

## ✨ Features

- 🗡️ **Turn-based Combat** - Strategic card-based battles
- 🧙 **4 Hero Classes** - Knight, Wizard, Rogue, Cleric
- 🏰 **5 Dungeon Rooms** - From Entrance to Dragon's Lair
- 🔮 **Magic System** - 5 schools of magic with combo effects
- 🤝 **Multiplayer** - Local co-op and competitive modes
- 📱 **Progressive Web App** - Install and play offline
- 🎨 **Dark Gothic Theme** - Immersive medieval atmosphere

## 🚀 Quick Start

### Play Online

Just visit [the live demo](https://dungeon-legends.vercel.app) and start playing!

### Local Development

```bash
# Clone repository
git clone https://github.com/Gzeu/dungeon-legends.git
cd dungeon-legends

# Install dependencies
npm install

# Set up database
npm run db:push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play.

## 📦 Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Styling:** CSS Modules + Tailwind CSS
- **Animation:** Framer Motion
- **Real-time:** WebSocket with Socket.io
- **Deployment:** Vercel

## 🏗️ Project Structure

```
dungeon-legends/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── lobby/             # Game lobby
│   ├── game/              # Game interface
│   ├── api/               # API routes
│   └── components/        # Shared components
├── lib/                   # Server-side logic
│   ├── game-engine.js     # Core game mechanics
│   ├── data-loader.ts     # Game data management
│   └── db.ts              # Database configuration
├── data/                  # Game assets (heroes, spells, rooms)
├── styles/                # CSS modules
├── prisma/                # Database schema
└── public/                # Static assets
```

## 🎯 How to Play

1. **Choose Your Hero** - Select from 4 unique classes
2. **Enter the Dungeon** - Navigate through 5 challenging rooms
3. **Strategic Combat** - Play cards, cast spells, use abilities
4. **Defeat the Dragon** - Face the Ancient Dragon in the final battle
5. **Collect Treasure** - Gain XP and legendary equipment

### Hero Classes

| Hero | Health | Mana | Special Ability |
|------|--------|------|----------------|
| 🛡️ **Knight** | 8 | 3 | Shield Wall (Defense +2) |
| 🧙 **Wizard** | 5 | 5 | Arcane Blast (4 damage) |
| 🗡️ **Rogue** | 6 | 4 | Shadow Step (Stealth) |
| ⛪ **Cleric** | 7 | 4 | Divine Intervention (Heal 4) |

### Magic Schools

- 🔥 **Fire** - Direct damage with burning effects
- ❄️ **Ice** - Damage with slowing effects  
- 🌿 **Nature** - Healing and regeneration
- 🗡️ **Shadow** - Poison and stealth effects
- ✨ **Light** - Party buffs and protection

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push database schema
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
```

### Environment Variables

Create a `.env.local` file:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## 🔧 API Reference

### Game Management

- `POST /api/game/create` - Create new game
- `POST /api/game/join` - Join existing game  
- `GET /api/game/state/:id` - Get game state

### Real-time Communication

- WebSocket endpoint at `/api/websocket`
- Game actions, chat, and state synchronization

## 📱 PWA Features

- **Offline Support** - Play without internet
- **Install Prompt** - Add to home screen
- **Background Sync** - Sync when connection returns
- **Push Notifications** - Game updates and reminders

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ using modern web technologies
- Inspired by classic dungeon crawler RPGs
- Gothic theme and medieval fantasy aesthetics
- Community feedback and contributions

---

**Ready for Adventure?** [🎮 Play Dungeon Legends Now!](https://dungeon-legends.vercel.app)
