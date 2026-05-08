import { NextApiRequest } from 'next'

export function authenticate(req: NextApiRequest): boolean {
  const apiKey = process.env.API_KEY
  if (!apiKey) return true // No auth required

  const authHeader = req.headers.authorization
  if (!authHeader) return false

  const token = authHeader.replace('Bearer ', '')
  return token === apiKey
}

export function getSessionId(): string {
  const sessionId = process.env.GENSPARK_SESSION_ID || process.env.NEXT_PUBLIC_GENSPARK_SESSION_ID

  if (!sessionId) {
    throw new Error('GENSPARK_SESSION_ID not configured')
  }
  return sessionId
}
