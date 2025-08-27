import { Pool, PoolClient } from 'pg'

// Database connection pool for PostgreSQL (Supabase)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

// Helper function to execute queries
const dbQuery = async (text: string, params: any[] = []) => {
  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    return result
  } finally {
    client.release()
  }
}

// Promisify database methods with proper parameter handling
const dbRun = async (sql: string, params: any[] = []) => {
  await dbQuery(sql, params)
}

const dbGet = async (sql: string, params: any[] = []) => {
  const result = await dbQuery(sql, params)
  return result.rows[0] || null
}

const dbAll = async (sql: string, params: any[] = []) => {
  const result = await dbQuery(sql, params)
  return result.rows
}

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
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        name VARCHAR(255) NOT NULL,
        provider VARCHAR(50) DEFAULT 'email',
        provider_id VARCHAR(255),
        avatar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Mantras table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS mantras (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title TEXT NOT NULL,
        text TEXT NOT NULL,
        goal INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `)

    // Sessions table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        mantra_id VARCHAR(255) NOT NULL,
        count INTEGER NOT NULL,
        date TIMESTAMP NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (mantra_id) REFERENCES mantras (id) ON DELETE CASCADE
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
    INSERT INTO users (id, email, password, name, provider, provider_id, avatar, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
    const row = await dbGet('SELECT * FROM users WHERE email = $1', [email]) as any
    if (!row) return null
    
    return {
      ...row,
      providerId: row.provider_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }
  } catch (error) {
    console.error('Error getting user by email:', error)
    return null
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const row = await dbGet('SELECT * FROM users WHERE id = $1', [id]) as any
    if (!row) return null
    
    return {
      ...row,
      providerId: row.provider_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
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
    INSERT INTO mantras (id, user_id, title, text, goal, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [id, userId, mantraData.title, mantraData.text, mantraData.goal, now, now])
  
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
    const rows = await dbAll('SELECT * FROM mantras WHERE user_id = $1', [userId]) as any[]
    return rows.map(row => ({
      ...row,
      userId: row.user_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }))
  } catch (error) {
    console.error('Error getting user mantras:', error)
    return []
  }
}

export async function updateMantra(id: string, userId: string, updateData: Partial<Omit<Mantra, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<Mantra | null> {
  try {
    const now = new Date().toISOString()
    const fields = []
    const values = []
    let paramIndex = 1
    
    if (updateData.title !== undefined) {
      fields.push(`title = $${paramIndex++}`)
      values.push(updateData.title)
    }
    if (updateData.text !== undefined) {
      fields.push(`text = $${paramIndex++}`)
      values.push(updateData.text)
    }
    if (updateData.goal !== undefined) {
      fields.push(`goal = $${paramIndex++}`)
      values.push(updateData.goal)
    }
    
    fields.push(`updated_at = $${paramIndex++}`)
    values.push(now)
    values.push(id)
    values.push(userId)
    
    await dbRun(
      `UPDATE mantras SET ${fields.join(', ')} WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}`,
      values
    )
    
    // Return updated mantra
    const row = await dbGet('SELECT * FROM mantras WHERE id = $1 AND user_id = $2', [id, userId]) as any
    if (!row) return null
    
    return {
      ...row,
      userId: row.user_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }
  } catch (error) {
    console.error('Error updating mantra:', error)
    return null
  }
}

export async function deleteMantra(id: string, userId: string): Promise<boolean> {
  try {
    await dbRun('DELETE FROM mantras WHERE id = $1 AND user_id = $2', [id, userId])
    return true
  } catch (error) {
    console.error('Error deleting mantra:', error)
    return false
  }
}

// Session functions
export async function createSession(userId: string, sessionData: Omit<MantraSession, 'id' | 'userId'>): Promise<MantraSession> {
  const id = generateId()
  
  await dbRun(`
    INSERT INTO sessions (id, user_id, mantra_id, count, date)
    VALUES ($1, $2, $3, $4, $5)
  `, [id, userId, sessionData.mantraId, sessionData.count, sessionData.date.toISOString()])
  
  return {
    id,
    userId,
    ...sessionData
  }
}

export async function getUserSessions(userId: string): Promise<MantraSession[]> {
  try {
    const rows = await dbAll('SELECT * FROM sessions WHERE user_id = $1', [userId]) as any[]
    return rows.map(row => ({
      ...row,
      userId: row.user_id,
      mantraId: row.mantra_id,
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