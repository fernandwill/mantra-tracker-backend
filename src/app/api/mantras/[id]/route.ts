import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { updateMantra, deleteMantra } from '@/lib/database'

const updateMantraSchema = z.object({
  title: z.string().min(1).optional(),
  text: z.string().min(1).optional(),
  goal: z.number().min(1).optional()
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

// PUT /api/mantras/[id] - Update mantra
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const updateData = updateMantraSchema.parse(body)

    const updatedMantra = await updateMantra(params.id, userId, updateData)
    if (!updatedMantra) {
      return NextResponse.json(
        { error: 'Mantra not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedMantra)

  } catch (error) {
    console.error('Update mantra error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid update data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update mantra' },
      { status: 500 }
    )
  }
}

// DELETE /api/mantras/[id] - Delete mantra
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const success = await deleteMantra(params.id, userId)
    if (!success) {
      return NextResponse.json(
        { error: 'Mantra not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: 'Mantra deleted successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Delete mantra error:', error)
    return NextResponse.json(
      { error: 'Failed to delete mantra' },
      { status: 500 }
    )
  }
}