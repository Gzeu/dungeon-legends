# Game Interface Refactor Notes
- Game page now uses GameWSClient (secure WS) and GameHUD for polish effects.
- Initial state fetched via /api/game/state to cover SSR.
- Next step: render real board UI using gameState (room, enemy, players, hand), replace <pre> dump.
