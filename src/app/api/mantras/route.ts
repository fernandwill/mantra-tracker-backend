import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { createMantra, getUserMantras } from '@/lib/database'

const createMantraSchema = z.object({
  title: z.string().min(1),
  text: z.string().min(1),
  goal: z.number().min(1)
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

// GET /api/mantras - Get all mantras for authenticated user
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const mantras = await getUserMantras(userId)
    return NextResponse.json(mantras)

  } catch (error) {
    console.error('Get mantras error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mantras' },
      { status: 500 }
    )
  }
}

// POST /api/mantras - Create new mantra
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
    const { title, text, goal } = createMantraSchema.parse(body)

    const mantra = await createMantra(userId, {
      title,
      text,
      goal
    })

    return NextResponse.json(mantra, { status: 201 })

  } catch (error) {
    console.error('Create mantra error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid mantra data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create mantra' },
      { status: 500 }
    )
  }
}