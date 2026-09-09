import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Compass, Lock, Mail } from "lucide-react"
import { useAuth } from "../context/AuthContext"

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    login(email)
    navigate("/dashboard")
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-ocean-600 text-white">
          <Compass size={22} />
        </span>
        <h1 className="font-display text-2xl font-bold text-ocean-950">Welcome back</h1>
        <p className="mt-1 text-sm text-ocean-950/60">Sign in to manage your trips and bookings</p>
      </div>

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
            placeholder="you@example.com"
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
        <button type="submit" className="w-full rounded-full bg-ocean-600 py-3 text-sm font-bold text-white hover:bg-ocean-700">
          Sign In
        </button>
        <p className="text-center text-xs text-ocean-950/40">This is a demo login — any email & password works.</p>
      </form>

      <p className="mt-6 text-center text-sm text-ocean-950/60">
        New to Roamly?{" "}
        <Link to="/signup" className="font-semibold text-ocean-700 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  )
}
