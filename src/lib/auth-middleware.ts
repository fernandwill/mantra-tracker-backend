import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export interface AuthenticatedRequest extends NextRequest {
  userId?: string
}

export function getUserIdFromToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { userId: string }
    return decoded.userId
  } catch {
    return null
  }
}

export function createUnauthorizedResponse() {
  return Response.json(
    { error: 'Unauthorized' },
    { status: 401 }
  )
}