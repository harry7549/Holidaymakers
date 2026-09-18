import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { Session } from "@supabase/supabase-js"
import { supabaseCustomer, supabaseConfigured } from "../lib/supabaseClient"
import { useToast } from "./ToastContext"

export interface User {
  id: string
  name: string
  email: string
  phone?: string
}

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function toUser(session: Session | null): User | null {
  if (!session) return null
  const meta = session.user.user_metadata as { full_name?: string; phone?: string }
  return {
    id: session.user.id,
    email: session.user.email ?? "",
    name: meta.full_name || session.user.email?.split("@")[0] || "Traveler",
    phone: meta.phone,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false)
      return
    }

    supabaseCustomer.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabaseCustomer.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    const { data, error } = await supabaseCustomer.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone: phone || "" } },
    })
    if (error) return { error: error.message }
    if (data.session) {
      showToast(`Welcome, ${fullName}!`)
    } else {
      showToast("Check your email to confirm your account", "info")
    }
    return { error: null }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabaseCustomer.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    showToast("Welcome back!")
    return { error: null }
  }

  const logout = async () => {
    await supabaseCustomer.auth.signOut()
    showToast("Signed out", "info")
  }

  return <AuthContext.Provider value={{ user: toUser(session), session, loading, signUp, signIn, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
