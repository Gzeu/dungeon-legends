# 🏰 Dungeon Legends RPG - Full-Stack Medieval Fantasy Game

> Status: ✅ Production-ready core on main | 🔄 Graphics expansion staged (branch)

## 🎯 Highlights
- Advanced UI: Hero Selector Pro (3D tilt), Holographic Cards
- Secure WebSocket + Chat, PWA, Prisma DB
- Perf: LCP/CLS/TBT optimizations (preload, next/image, dynamic VFX)
- Assets: 21 core images complete; extended packs pipeline ready

## 🚀 Quick Start
```bash
npm install
npm run assets:all       # fetch core assets (icons, screenshots, base images)
node scripts/convert-webp.mjs  # optional non-destructive conversion
npm run dev
```

## 🔐 Environment (Vercel)
- DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
- GOOGLE_CLIENT_ID/SECRET, GITHUB_ID/SECRET
- WEBSOCKET_SECRET

## 🧭 Branches & Status
- main → source-of-truth (demo/prod)
- feature/graphics-expansion → ActionBar + extended assets infra (awaiting HQ images)
- feature/vercel-mvp-rpg → MERGED ✅ (safe to delete)
- feature/advanced-ui → MERGED ✅ (safe to delete)

## ✅ Open Tasks (Issue #2)
- Perf: integrate RoomImage/EnemyThumb in game page (WebP fallback)
- Graphics expansion: generate 10 HQ images (5 enemies, 5 ice caverns) and PR
- Integrate ActionBar (icons + cooldown) into game UI
- Branch housekeeping (delete merged branches)
- Docs refresh (README + ASSETS-CHECKLIST)

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

## 📚 Docs
- ASSETS-CHECKLIST.md – inventory, commands, QA
- RELEASE-NOTES.md – highlights & known todos

## 🧩 How to Deploy (Vercel)
1) Set env vars (above) in Project Settings → Environment Variables
2) Run assets scripts (if needed) and commit public/ changes
3) Push to main → Vercel auto-deploys
4) First deploy only (DB):
```bash
npx prisma db push
npx prisma db seed
```
