/**
 * AuthContext - Manages authentication state across the application
 */
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { api } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signInWithOAuth: (provider: 'discord' | 'google') => Promise<void>
  signOut: () => Promise<void>
  sendPasswordResetEmail: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    api.getSession().then(({ session }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = api.getClient().auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await api.signIn(email, password)
    if (error) throw error
    setSession(data.session)
    setUser(data.user)
  }

  const signUp = async (email: string, password: string) => {
    const { data, error } = await api.signUp(email, password)
    if (error) throw error
    setSession(data.session)
    setUser(data.user)
  }

  const signInWithOAuth = async (provider: 'discord' | 'google') => {
    const { error } = await api.signInWithOAuth(provider, window.location.origin)
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await api.signOut()
    if (error) throw error
    setSession(null)
    setUser(null)
  }

  const sendPasswordResetEmail = async (email: string) => {
    const redirectUrl = `${window.location.origin}/reset-password`
    const { error } = await api.sendPasswordResetEmail(email, redirectUrl)
    if (error) throw error
  }

  const updatePassword = async (newPassword: string) => {
    const { error } = await api.updatePassword(newPassword)
    if (error) throw error
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithOAuth,
    signOut,
    sendPasswordResetEmail,
    updatePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
