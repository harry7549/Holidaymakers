import { useState, type FormEvent } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { Compass, Lock, Mail } from "lucide-react"
import { useAdminAuth } from "../../context/AdminAuthContext"
import { supabaseConfigured } from "../../lib/supabaseClient"

export default function AdminLogin() {
  const { session, loading, signIn } = useAdminAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && session) return <Navigate to="/admin" replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = await signIn(email, password)
    setSubmitting(false)
    if (error) {
      setError(error)
      return
    }
    navigate("/admin")
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-sand-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-ocean-600 text-white">
            <Compass size={22} />
          </span>
          <h1 className="font-display text-2xl font-bold text-ocean-950">Roamly Admin</h1>
          <p className="mt-1 text-sm text-ocean-950/60">Sign in to manage packages, bookings and more</p>
        </div>

        {!supabaseConfigured && (
          <div className="mb-4 rounded-lg bg-gold-400/20 px-4 py-3 text-xs text-ocean-950">
            Supabase isn't configured yet — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then create your admin
            user in the Supabase dashboard (Authentication → Users). See README for the full setup.
          </div>
        )}

        <form onSubmit={submit} className="space-y-3 rounded-2xl border border-sand-200 bg-white p-6">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-ocean-950/60">
              <Mail size={13} /> Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourbusiness.com"
              className="w-full rounded-lg border border-sand-200 px-4 py-2.5 text-sm outline-none focus:border-ocean-400"
            />
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-ocean-950/60">
              <Lock size={13} /> Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-sand-200 px-4 py-2.5 text-sm outline-none focus:border-ocean-400"
            />
          </div>
          {error && <p className="text-sm font-medium text-sunset-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-ocean-600 py-3 text-sm font-bold text-white hover:bg-ocean-700 disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  )
}
