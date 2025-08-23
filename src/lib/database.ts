import sqlite3 from 'sqlite3'
import { promisify } from 'util'

// Database connection
const db = new sqlite3.Database('./mantra_tracker.db')

// Promisify database methods
const dbRun = promisify(db.run.bind(db))
const dbGet = promisify(db.get.bind(db))
const dbAll = promisify(db.all.bind(db))

// User interface
export interface User {
  id: string
  email: string
  password: string
  name: string
  provider?: string
  providerId?: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

// Mantra interface (same as frontend)
export interface Mantra {
  id: string
  userId: string
  title: string
  text: string
  category: string
  goal: number
  createdAt: Date
  updatedAt: Date
}

// Session interface (same as frontend)
export interface MantraSession {
  id: string
  userId: string
  mantraId: string
  count: number
  date: Date
}

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Users table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        name TEXT NOT NULL,
        provider TEXT DEFAULT 'email',
        providerId TEXT,
        avatar TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Mantras table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS mantras (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        title TEXT NOT NULL,
        text TEXT NOT NULL,
        category TEXT NOT NULL,
        goal INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      )
    `)

    // Sessions table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        mantraId TEXT NOT NULL,
        count INTEGER NOT NULL,
        date DATETIME NOT NULL,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (mantraId) REFERENCES mantras (id) ON DELETE CASCADE
      )
    `)

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Database initialization error:', error)
  }
}

// User functions
export async function createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  const id = generateId()
  const now = new Date().toISOString()
  
  await dbRun(`
    INSERT INTO users (id, email, password, name, provider, providerId, avatar, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [id, userData.email, userData.password, userData.name, userData.provider || 'email', userData.providerId, userData.avatar, now, now])
  
  return {
    id,
    ...userData,
    createdAt: new Date(now),
    updatedAt: new Date(now)
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const row = await dbGet('SELECT * FROM users WHERE email = ?', [email]) as any
    if (!row) return null
    
    return {
      ...row,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    }
  } catch (error) {
    console.error('Error getting user by email:', error)
    return null
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const row = await dbGet('SELECT * FROM users WHERE id = ?', [id]) as any
    if (!row) return null
    
    return {
      ...row,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    }
  } catch (error) {
    console.error('Error getting user by id:', error)
    return null
  }
}

// Mantra functions
export async function createMantra(userId: string, mantraData: Omit<Mantra, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Mantra> {
  const id = generateId()
  const now = new Date().toISOString()
  
  await dbRun(`
    INSERT INTO mantras (id, userId, title, text, category, goal, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [id, userId, mantraData.title, mantraData.text, mantraData.category, mantraData.goal, now, now])
  
  return {
    id,
    userId,
    ...mantraData,
    createdAt: new Date(now),
    updatedAt: new Date(now)
  }
}

export async function getUserMantras(userId: string): Promise<Mantra[]> {
  try {
    const rows = await dbAll('SELECT * FROM mantras WHERE userId = ?', [userId]) as any[]
    return rows.map(row => ({
      ...row,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    }))
  } catch (error) {
    console.error('Error getting user mantras:', error)
    return []
  }
}

// Session functions
export async function createSession(userId: string, sessionData: Omit<MantraSession, 'id' | 'userId'>): Promise<MantraSession> {
  const id = generateId()
  
  await dbRun(`
    INSERT INTO sessions (id, userId, mantraId, count, date)
    VALUES (?, ?, ?, ?, ?)
  `, [id, userId, sessionData.mantraId, sessionData.count, sessionData.date.toISOString()])
  
  return {
    id,
    userId,
    ...sessionData
  }
}

export async function getUserSessions(userId: string): Promise<MantraSession[]> {
  try {
    const rows = await dbAll('SELECT * FROM sessions WHERE userId = ?', [userId]) as any[]
    return rows.map(row => ({
      ...row,
      date: new Date(row.date)
    }))
  } catch (error) {
    console.error('Error getting user sessions:', error)
    return []
  }
}

// Helper function
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Initialize database on import
initializeDatabase()