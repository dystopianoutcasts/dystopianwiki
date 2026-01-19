import React, { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isEmailVerified: boolean
  pendingVerification: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signOut: () => Promise<void>
  sendPasswordResetEmail: (email: string) => Promise<void>
  signInWithOAuth: (provider: 'discord' | 'google') => Promise<void>
  resendVerificationEmail: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [pendingVerification, setPendingVerification] = useState(false)

  // Check if email is verified
  const isEmailVerified = user?.email_confirmed_at != null

  useEffect(() => {
    // Get initial session
    api.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = api.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      // Clear pending verification when user confirms email
      if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
        setPendingVerification(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await api.signIn(email, password)
    if (error) throw error

    // Check if email is verified
    if (data.user && !data.user.email_confirmed_at) {
      // User exists but email not verified - don't grant access
      setPendingVerification(true)
      throw new Error('Please verify your email address before signing in. Check your inbox for the verification link.')
    }

    setSession(data.session)
    setUser(data.user)
  }

  const signUp = async (email: string, password: string, username: string) => {
    // Use mobile deep link for email verification redirect
    const redirectUrl = 'dystopianwiki://verify-email'

    const { error } = await api.signUp(email, password, { username }, redirectUrl)
    if (error) throw error

    // After signup, user needs to verify email
    // Don't set session/user - they need to verify first
    setPendingVerification(true)

    // Note: Supabase may return a session even before verification if
    // "Confirm email" is disabled in Supabase dashboard. We explicitly
    // don't grant access until verified.
  }

  const signOut = async () => {
    const { error } = await api.signOut()
    if (error) throw error
    setSession(null)
    setUser(null)
    setPendingVerification(false)
  }

  const sendPasswordResetEmail = async (email: string) => {
    // Use deep link for mobile password reset
    const redirectUrl = 'dystopianwiki://reset-password'
    const { error } = await api.sendPasswordResetEmail(email, redirectUrl)
    if (error) throw error
  }

  const signInWithOAuth = async (provider: 'discord' | 'google') => {
    const { error } = await api.signInWithOAuth(provider)
    if (error) throw error
    // OAuth redirects are handled by Supabase SDK + deep linking
  }

  const resendVerificationEmail = async (email: string) => {
    const redirectUrl = 'dystopianwiki://verify-email'
    const { error } = await api.resendVerificationEmail(email, redirectUrl)
    if (error) throw error
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isEmailVerified,
        pendingVerification,
        signIn,
        signUp,
        signOut,
        sendPasswordResetEmail,
        signInWithOAuth,
        resendVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
