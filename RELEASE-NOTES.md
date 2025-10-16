# Release Notes – Vercel MVP RPG

## Scope
- Full-stack RPG ready for Vercel Preview/Production
- Secure WS, Lobby cinematic, Game UI, Audio, PWA

## Highlights
- Next.js 14 App Router with secure WebSocket
- Prisma + Postgres schema for heroes, games, guilds, tournaments
- Hero selector, animated card frames, VFX overlays, result toasts, combo streaks
- PWA assets + manifest, font preloads, perf tweaks
- CI to fetch images into public/ and resize icons

## How to Run
1. Set env vars in Vercel:
   - DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
   - GOOGLE_CLIENT_ID/SECRET, GITHUB_ID/SECRET
   - WEBSOCKET_SECRET
2. (Optional) Run assets job:
   - GitHub Actions → Assets CI → Run workflow
3. Deploy
   - Vercel import repo, set env, deploy

## Known Todos
- Replace <pre> on GamePage with full visual board (cards drag/play)
- Unify WS handlers (route.ts) into one secure handler for actions + chat
- Expand data sets (spells, equipment, rooms)
- Add rate limiting & anti-spam in chat
- Spectator enhancements (camera, events feed)
