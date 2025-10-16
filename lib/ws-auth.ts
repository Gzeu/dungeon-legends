import jwt from 'jsonwebtoken'
import { getToken } from 'next-auth/jwt'
import { NextRequest } from 'next/server'

const WS_SECRET = process.env.WEBSOCKET_SECRET || 'dev-secret'

export async function signWSJwt(userId: string) {
  return jwt.sign({ sub: userId, ts: Date.now() }, WS_SECRET, { expiresIn: '10m' })
}

export async function getWSJwtFromRequest(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.sub) return null
  return signWSJwt(token.sub)
}

export function verifyWSJwt(token: string) {
  try { return jwt.verify(token, WS_SECRET) as any } catch { return null }
}
