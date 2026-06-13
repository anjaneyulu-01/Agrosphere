import { createContext, useContext, useEffect, useState } from 'react'
import * as api from '../api'

const AuthContext = createContext(null)

const TOKEN_KEY = 'agro-token'
const USER_KEY = 'agro-user'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY)) || null
    } catch {
      return null
    }
  })

  // On load (or whenever the token changes), confirm it's still valid with
  // the backend. If the server rejects it, clear the stale session.
  useEffect(() => {
    if (!token) return
    api.getMe(token)
      .then((fresh) => persist(token, fresh))
      .catch(() => logout())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  function persist(newToken, newUser) {
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
  }

  async function login(email, password) {
    const { token: t, user: u } = await api.login(email, password)
    persist(t, u)
    return u
  }

  async function signup(name, email, password) {
    const { token: t, user: u } = await api.signup(name, email, password)
    persist(t, u)
    return u
  }

  function logout() {
    setToken(null)
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
