import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { createSession, getUserSessions } from '@/lib/database'

const createSessionSchema = z.object({
  mantraId: z.string().min(1),
  count: z.number().min(1),
  date: z.string().datetime().optional()
})

// Helper function to get user ID from JWT token
function getUserIdFromToken(request: NextRequest): string | null {
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

// GET /api/sessions - Get all sessions for authenticated user
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const sessions = await getUserSessions(userId)
    return NextResponse.json(sessions)

  } catch (error) {
    console.error('Get sessions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

// POST /api/sessions - Create new session (record mantra repetitions)
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { mantraId, count, date } = createSessionSchema.parse(body)

    const session = await createSession(userId, {
      mantraId,
      count,
      date: date ? new Date(date) : new Date()
    })

    return NextResponse.json(session, { status: 201 })

  } catch (error) {
    console.error('Create session error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid session data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}