# 🏰 Dungeon Legends

**Epic Medieval RPG with card-based combat, hero progression, and cooperative gameplay**

[![CI/CD Pipeline](https://github.com/Gzeu/dungeon-legends/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Gzeu/dungeon-legends/actions/workflows/ci-cd.yml)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://dungeon-legends.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/atlas)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎮 Play Now

**🌍 Live Demo:** [https://dungeon-legends.vercel.app](https://dungeon-legends.vercel.app)

## ✨ Features

### 🎯 Core Gameplay
- 🗡️ **Turn-based Combat** - Strategic card-based battles with combo system
- 🧙 **4+ Hero Classes** - Knight, Wizard, Rogue, Cleric with unique abilities
- 🏰 **5 Dungeon Rooms** - From Entrance to Dragon's Lair
- 🔮 **Magic System** - 5 schools of magic with elemental combo effects
- 🤝 **Multiplayer** - Local co-op, competitive, and pass-and-play modes
- 🏆 **Boss Battles** - Face the Ancient Dragon and other legendary foes

### 🚀 Technical Features
- 📱 **Progressive Web App** - Install and play offline
- 🎨 **Dark Gothic Theme** - Immersive medieval atmosphere with advanced UI
- ⚡ **Real-time Multiplayer** - WebSocket-based networking
- 🌐 **Dual Database Support** - MongoDB Atlas + PostgreSQL/Prisma
- 🔐 **Authentication** - Google OAuth & GitHub integration
- 📊 **Advanced Analytics** - Performance monitoring & user insights

### 🎪 Advanced Systems
- 🎭 **Hero Progression** - Leveling, skills, and mastery systems
- 🏛️ **Guild System** - Join guilds, participate in raids
- 🏅 **Achievements** - Unlock titles and special rewards
- 🎪 **Tournaments** - Competitive brackets and leaderboards
- 📅 **Daily Challenges** - Fresh content and special rewards
- 🎨 **Advanced UI** - 3D card effects, particle systems, animations

## 🚀 Quick Start

### Play Online
Just visit [dungeon-legends.vercel.app](https://dungeon-legends.vercel.app) and start playing!

### Local Development

```bash
# Clone repository
git clone https://github.com/Gzeu/dungeon-legends.git
cd dungeon-legends

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Set up database (choose one)
# Option 1: MongoDB Atlas
npm run db:connect

# Option 2: PostgreSQL with Prisma
npm run db:push

# Start development servers
npm run dev          # Next.js frontend (port 3000)
npm run ws:server    # WebSocket server (port 3001)
```

Open [http://localhost:3000](http://localhost:3000) to play.

## 📦 Tech Stack

### Frontend
- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript 5.3+
- **Styling:** Tailwind CSS + CSS Modules
- **Animation:** Framer Motion with particle effects
- **UI Components:** Radix UI primitives
- **Icons:** Lucide React
- **Audio:** Howler.js with 3D spatial audio

### Backend & Database
- **Database:** MongoDB Atlas (primary) + PostgreSQL (optional)
- **ORM:** Mongoose + Prisma (dual support)
- **Authentication:** NextAuth.js with OAuth providers
- **Real-time:** WebSocket with Socket.io
- **API:** Next.js API Routes with validation

### Deployment & DevOps
- **Hosting:** Vercel with automatic deployments
- **CI/CD:** GitHub Actions with automated testing
- **Monitoring:** Vercel Analytics + Lighthouse CI
- **Security:** Content Security Policy, XSS protection

## 🏗️ Project Structure

```
dungeon-legends/
├── app/                    # Next.js App Router
│   ├── api/               # API routes & WebSocket handlers
│   ├── components/        # React components
│   │   ├── cards/        # Card game components
│   │   └── ui/           # Reusable UI components  
│   ├── game/             # Game interface pages
│   ├── lobby/            # Multiplayer lobby
│   ├── auth/             # Authentication pages
│   └── globals.css       # Global styles
├── lib/                   # Server-side utilities
│   ├── db.ts             # Database connections (MongoDB + Prisma)
│   ├── game-engine.js    # Core game mechanics
│   ├── data-loader.ts    # Game assets management
│   └── ws-auth.ts        # WebSocket authentication
├── data/                  # Game content (heroes, spells, rooms)
├── prisma/               # Database schema & migrations
├── public/               # Static assets & PWA files
├── scripts/              # Build & maintenance scripts
├── .github/workflows/    # CI/CD automation
├── server.js             # WebSocket server
├── vercel.json           # Deployment configuration
└── package.json          # Dependencies & scripts
```

## 🎯 How to Play

### Getting Started
1. **Choose Your Hero** - Select from multiple unique classes
2. **Enter the Dungeon** - Navigate through increasingly challenging rooms
3. **Strategic Combat** - Play cards, cast spells, use special abilities
4. **Defeat Bosses** - Face legendary creatures in epic battles
5. **Collect Rewards** - Gain XP, treasure, and legendary equipment

### Hero Classes

| Hero | Health | Mana | Special Ability |
|------|--------|------|----------------|
| 🛡️ **Knight** | 8 | 3 | Shield Wall (Defense +2) |
| 🧙 **Wizard** | 5 | 5 | Arcane Blast (4 damage) |
| 🗡️ **Rogue** | 6 | 4 | Shadow Step (Stealth) |
| ⛪ **Cleric** | 7 | 4 | Divine Intervention (Heal 4) |

### Magic Schools

- 🔥 **Fire** - Direct damage with burning effects
- ❄️ **Ice** - Damage with slowing and freeze effects  
- 🌿 **Nature** - Healing, regeneration, and growth
- 🗡️ **Shadow** - Poison, stealth, and debuff effects
- ✨ **Light** - Party buffs, healing, and protection

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript validation

# Database Management
npm run db:connect   # Test MongoDB connection
npm run db:push      # Push Prisma schema changes
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed development data

# WebSocket Server
npm run ws:server    # Start WebSocket server
npm run ws:client    # Start with WebSocket client

# Asset Management
npm run assets:fetch # Download game assets
npm run assets:icons # Generate PWA icons
npm run assets:all   # Complete asset pipeline

# Testing & Quality
npm run test         # Run test suite
npm run test:watch   # Watch mode testing
npm run analyze      # Bundle analysis
```

### Environment Variables

Create a `.env.local` file:

```env
# Database Configuration (choose one)
MONGODB_URI="mongodb+srv://..."
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Optional: Analytics & Monitoring
VERCEL_ANALYTICS_ID="your-analytics-id"
```

## 🔧 API Reference

### Game Management
- `POST /api/game/create` - Create new game session
- `POST /api/game/join` - Join existing game
- `GET /api/game/state/:id` - Get current game state
- `POST /api/game/action` - Submit game action

### User Management
- `GET /api/user/profile` - Get user profile
- `POST /api/user/hero` - Create/update hero
- `GET /api/user/achievements` - Get user achievements
- `GET /api/user/stats` - Get gameplay statistics

### Real-time Communication
- **WebSocket:** `ws://localhost:3001` (development)
- **Events:** `authenticate`, `joinGame`, `gameAction`, `chat`
- **Features:** Room management, game state sync, spectator mode

## 📱 PWA Features

- **📱 Offline Support** - Play without internet connection
- **🏠 Install Prompt** - Add to home screen on mobile/desktop
- **🔄 Background Sync** - Sync progress when connection returns
- **🔔 Push Notifications** - Game updates and friend invitations
- **⚡ Fast Loading** - Aggressive caching and optimization

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation for API changes
- Follow the existing code style
- Test on multiple devices/browsers

## 📊 Performance

- **🚀 Lighthouse Score:** 95+ on all metrics
- **⚡ First Contentful Paint:** < 1.5s
- **🎯 Time to Interactive:** < 3s
- **📱 Mobile Performance:** Optimized for all devices
- **🌐 Bundle Size:** < 500KB gzip

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **🎮 Game Design** - Inspired by classic dungeon crawlers and modern card games
- **🎨 Gothic Art Style** - Medieval fantasy aesthetic with dark themes
- **🏗️ Modern Tech Stack** - Built with cutting-edge web technologies
- **👥 Community** - Thanks to all contributors and players
- **🚀 Performance** - Optimized for the best gaming experience

---

**🎮 Ready for Adventure?** 

**[▶️ Play Dungeon Legends Now!](https://dungeon-legends.vercel.app)**

*Built with ❤️ by [George Pricop](https://github.com/Gzeu) using Next.js, TypeScript, and modern web technologies.*