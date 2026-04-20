import { USERS, type User, type UserRole } from './data'

export interface Session {
  userId: string
  username: string
  name: string
  role: UserRole
}

const SESSION_KEY = 'linde_session'

export function login(username: string, password: string): Session | null {
  const user = USERS.find(
    (u) => u.username === username && u.password === password
  )
  if (!user) return null

  const session: Session = {
    userId: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }
  return session
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY)
  }
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

export function getUserById(id: string): User | undefined {
  return USERS.find((u) => u.id === id)
}
