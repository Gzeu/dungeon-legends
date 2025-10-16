# WS Unification Notes
- Prefer /api/websocket/secure/route.ts for all real-time traffic.
- useSecureWS('/ws/secure') handles auth, reusability.
- Replace legacy GameChat with SecureGameChat or GameWSClient as needed.
