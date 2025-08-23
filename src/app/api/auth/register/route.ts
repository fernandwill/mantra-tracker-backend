import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { createUser, getUserByEmail } from '@/lib/database'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await createUser({
      email,
      password: hashedPassword,
      name
    })

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Invalid registration data' },
      { status: 400 }
    )
  }
}