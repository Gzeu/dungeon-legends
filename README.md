# 🏰 Dungeon Legends RPG - Full-Stack Medieval Fantasy Game

> Status: ✅ Production-ready core on main | 🔄 Graphics expansion in progress (branch)

## 🎯 What’s New
- Advanced UI: Hero Selector Pro (3D tilt), Holographic Cards
- Secure WebSocket + Chat, PWA, Prisma DB
- Perf: LCP/CLS/TBT optimizations (preload, next/image, dynamic VFX)
- Assets: 21 core images complete; extended packs pipeline ready

## 🚀 Quick Start
```bash
npm install
npm run assets:all       # fetch core assets (icons, screenshots, base images)
# optional non-destructive conversion
node scripts/convert-webp.mjs
npm run dev
```

## 🗂️ Key Scripts
- `npm run assets:all` → fetch core assets + icons
- `npm run assets:check` → validate presence
- `npm run assets:extended:enemies` → extended enemies (after URLs ready)
- `npm run assets:extended:ice` → ice caverns pack (after URLs ready)
- `node scripts/convert-webp.mjs` → generate .webp alongside originals (no replacement)

## 🔧 Performance Notes
- Preload font + LCP image in `pages/_document.tsx`
- `next/image` for teasers with priority
- Dynamic imports for heavy VFX
- WebP fallback via `<picture>` wrapper (RoomImage/Picture)

## 🧭 Branch Strategy
- main → source-of-truth for demo/prod
- feature/graphics-expansion → holds ActionBar + extended assets (awaiting HQ images)
- merged: feature/vercel-mvp-rpg, feature/advanced-ui (can be deleted)

## ✅ Tasks (see Issue #2)
- Perf: integrate RoomImage/EnemyThumb in game page
- Graphics expansion: generate HQ images (5 enemies, 5 ice caverns)
- Integrate ActionBar (icons + cooldown) into game UI
- Branch housekeeping (delete merged, keep expansion)
- Docs refresh: README + ASSETS-CHECKLIST

## 📚 Docs
- ASSETS-CHECKLIST.md – complete inventory, commands, QA
- RELEASE-NOTES.md – highlights & known todos

## 🔐 ENV (Vercel)
- DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
- GOOGLE_CLIENT_ID/SECRET, GITHUB_ID/SECRET
- GITHUB_ID/SECRET, WEBSOCKET_SECRET
