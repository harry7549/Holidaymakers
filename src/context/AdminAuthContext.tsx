import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { Session } from "@supabase/supabase-js"
import { supabase, supabaseConfigured } from "../lib/supabaseClient"

interface AdminAuthContextValue {
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined)

// Admin and customer accounts share one Supabase Auth users table (see
// supabaseClient.ts), so a valid session alone doesn't prove admin access —
// it's only granted to user_ids listed in admin_users. Every self-registered
// customer would otherwise be able to sign in here with their own account.
async function isAllowedAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase.from("admin_users").select("user_id").eq("user_id", userId).maybeSingle()
  return Boolean(data)
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session && !(await isAllowedAdmin(data.session.user.id))) {
        await supabase.auth.signOut()
        setSession(null)
      } else {
        setSession(data.session)
      }
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (newSession && !(await isAllowedAdmin(newSession.user.id))) {
        await supabase.auth.signOut()
        setSession(null)
        return
      }
      setSession(newSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    if (data.session && !(await isAllowedAdmin(data.session.user.id))) {
      await supabase.auth.signOut()
      return { error: "This account doesn't have admin access." }
    }
    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return <AdminAuthContext.Provider value={{ session, loading, signIn, signOut }}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider")
  return ctx
}
