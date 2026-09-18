import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AlertTriangle, Compass, Mail, Phone, User } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { Reveal } from "../components/Reveal"

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" })
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    setSubmitting(true)
    setError("")
    const { error } = await signUp(form.email, form.password, form.name, form.phone)
    setSubmitting(false)
    if (error) {
      setError(error)
      return
    }
    navigate("/dashboard")
  }

  return (
    <Reveal as="div" className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-ocean-600 text-white">
          <Compass size={22} />
        </span>
        <h1 className="font-display text-2xl font-bold text-ocean-950">Create your account</h1>
        <p className="mt-1 text-sm text-ocean-950/60">Save wishlists, track bookings & get personalized deals</p>
      </div>

      <form onSubmit={submit} className="space-y-3 rounded-2xl border border-sand-200 bg-white p-6">
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-sunset-50 px-3 py-2.5 text-xs text-sunset-700">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {error}
          </div>
        )}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-ocean-950/60">
            <User size={13} /> Full Name
          </label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your name"
            className="w-full rounded-lg border border-sand-200 px-4 py-2.5 text-sm outline-none focus:border-ocean-400"
          />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-ocean-950/60">
            <Mail size={13} /> Email
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-sand-200 px-4 py-2.5 text-sm outline-none focus:border-ocean-400"
          />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-ocean-950/60">
            <Phone size={13} /> Phone
          </label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+91 98765 43210"
            className="w-full rounded-lg border border-sand-200 px-4 py-2.5 text-sm outline-none focus:border-ocean-400"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ocean-950/60">Password</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="At least 6 characters"
            className="w-full rounded-lg border border-sand-200 px-4 py-2.5 text-sm outline-none focus:border-ocean-400"
          />
        </div>
        <button type="submit" disabled={submitting} className="w-full rounded-full bg-ocean-600 py-3 text-sm font-bold text-white hover:bg-ocean-700 disabled:opacity-60">
          {submitting ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ocean-950/60">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-ocean-700 hover:underline">
          Sign in
        </Link>
      </p>
    </Reveal>
  )
}
