import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { getUserMantras, getUserSessions } from '@/lib/database'

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

// GET /api/stats - Get statistics for authenticated user
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const [mantras, sessions] = await Promise.all([
      getUserMantras(userId),
      getUserSessions(userId)
    ])

    // Calculate statistics
    const totalRepetitions = sessions.reduce((sum, session) => sum + session.count, 0)
    const totalMantras = mantras.length
    
    // Calculate active days (unique dates with sessions)
    const uniqueDates = new Set(
      sessions.map(session => session.date.toDateString())
    )
    const activeDays = uniqueDates.size

    // Calculate current streak
    const today = new Date()
    const sortedDates = Array.from(uniqueDates)
      .map(dateString => new Date(dateString))
      .sort((a, b) => b.getTime() - a.getTime())

    let currentStreak = 0
    if (sortedDates.length > 0) {
      const todayString = today.toDateString()
      const yesterdayString = new Date(today.getTime() - 24 * 60 * 60 * 1000).toDateString()
      
      // Check if today or yesterday has activity
      if (sortedDates[0].toDateString() === todayString || 
          sortedDates[0].toDateString() === yesterdayString) {
        
        let checkDate = sortedDates[0].toDateString() === todayString ? today : sortedDates[0]
        
        for (const sessionDate of sortedDates) {
          const expectedDate = new Date(checkDate)
          expectedDate.setDate(expectedDate.getDate() - currentStreak)
          
          if (sessionDate.toDateString() === expectedDate.toDateString()) {
            currentStreak++
          } else {
            break
          }
        }
      }
    }

    // Generate daily activity for the last 30 days
    const dailyActivity = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateString = date.toDateString()
      
      const dayTotal = sessions
        .filter(session => session.date.toDateString() === dateString)
        .reduce((sum, session) => sum + session.count, 0)
      
      dailyActivity.push({
        date: date.toISOString().split('T')[0],
        count: dayTotal
      })
    }

    const stats = {
      totalRepetitions,
      totalMantras,
      activeDays,
      currentStreak,
      dailyActivity
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}