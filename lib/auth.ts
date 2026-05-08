import { NextApiRequest } from 'next'

export function getSessionIdFromRequest(req: NextApiRequest): string {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    throw new Error('Authorization header required')
  }

  const sessionId = authHeader.replace('Bearer ', '').trim()

  if (!sessionId) {
    throw new Error('Invalid session ID')
  }

  return sessionId
}
