import { useState, type FormEvent } from "react"
import { BadgeCheck, Building2, Globe, Handshake, MapPin, Star } from "lucide-react"
import { useCatalog } from "../context/CatalogContext"
import { cn } from "../lib/utils"
import { useToast } from "../context/ToastContext"

const filters = ["All", "online", "offline"] as const

export default function Suppliers() {
  const { suppliers } = useCatalog()
  const [filter, setFilter] = useState<(typeof filters)[number]>("All")
  const [form, setForm] = useState({ business: "", contact: "", email: "", city: "", type: "offline", message: "" })
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { showToast } = useToast()

  const filtered = filter === "All" ? suppliers : suppliers.filter((s) => s.type === filter)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.business || !form.contact || !form.email) {
      showToast("Please fill in business name, contact and email", "info")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/supplier-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setSent(true)
      showToast("Partner application received! Our team will reach out within 2 business days.")
    } catch {
      showToast("Could not submit your application — please try again", "info")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <section className="bg-ocean-950 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
            <Handshake size={13} /> Supplier Network
          </span>
          <h1 className="font-display text-2xl font-bold text-white sm:text-4xl">
            200+ Verified Suppliers, Online & Offline
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/70 sm:text-base">
            Roamly partners with established local travel agencies and trusted online operators alike — every one
            vetted for licensing, service quality, and traveller satisfaction.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-center gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold capitalize transition-colors",
                filter === f ? "border-ocean-600 bg-ocean-600 text-white" : "border-sand-200 text-ocean-950/70",
              )}
            >
              {f === "All" ? "All Suppliers" : `${f} Partners`}
            </button>
          ))}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <div key={s.id} className="rounded-2xl border border-sand-200 bg-white p-5">
              <div className="mb-3 flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-display text-lg font-bold text-white",
                    s.color === "ocean" && "bg-ocean-600",
                    s.color === "sunset" && "bg-sunset-500",
                    s.color === "gold" && "bg-gold-500",
                  )}
                >
                  {s.logoInitial}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display text-base font-bold text-ocean-950">{s.name}</h3>
                    {s.verified && <BadgeCheck size={15} className="text-ocean-500" />}
                  </div>
                  <p className="flex items-center gap-1 text-xs text-ocean-950/50">
                    <MapPin size={11} /> {s.location}
                  </p>
                </div>
              </div>
              <p className="mb-3 text-sm text-ocean-950/70">{s.specialty}</p>
              <div className="flex items-center justify-between text-xs text-ocean-950/60">
                <span className="flex items-center gap-1">
                  <Star size={12} className="fill-gold-400 text-gold-400" /> {s.rating}
                </span>
                <span>{s.packagesCount} packages</span>
                <span className="flex items-center gap-1 capitalize">
                  {s.type === "online" ? <Globe size={12} /> : <Building2 size={12} />}
                  {s.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-sand-100 py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-ocean-950 sm:text-3xl">Become a Roamly Partner</h2>
            <p className="mt-3 text-sm text-ocean-950/60 sm:text-base">
              Whether you run a local travel agency or an online tour operation, list your packages on Roamly and
              reach thousands of ready-to-book travellers. No listing fees — we succeed only when you do.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-ocean-950/70">
              <li>✓ Zero upfront listing fees</li>
              <li>✓ Dashboard to manage bookings & availability</li>
              <li>✓ Marketing support across our traveller base</li>
              <li>✓ Fast, reliable payouts</li>
            </ul>
          </div>

          {sent ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-sand-200 bg-white p-8 text-center">
              <BadgeCheck size={32} className="mb-3 text-ocean-600" />
              <h3 className="font-display text-lg font-bold text-ocean-950">Application received!</h3>
              <p className="mt-1 text-sm text-ocean-950/60">Our partnerships team will contact you within 2 business days.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3 rounded-2xl border border-sand-200 bg-white p-6">
              <input
                placeholder="Business name"
                value={form.business}
                onChange={(e) => setForm({ ...form, business: e.target.value })}
                className="w-full rounded-lg border border-sand-200 px-4 py-2.5 text-sm outline-none focus:border-ocean-400"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  placeholder="Contact person"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  className="w-full rounded-lg border border-sand-200 px-4 py-2.5 text-sm outline-none focus:border-ocean-400"
                />
                <input
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full rounded-lg border border-sand-200 px-4 py-2.5 text-sm outline-none focus:border-ocean-400"
                />
              </div>
              <input
                type="email"
                placeholder="Business email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-sand-200 px-4 py-2.5 text-sm outline-none focus:border-ocean-400"
              />
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-lg border border-sand-200 px-4 py-2.5 text-sm outline-none focus:border-ocean-400"
              >
                <option value="offline">Offline / local travel agency</option>
                <option value="online">Online tour operator</option>
              </select>
              <textarea
                placeholder="Tell us about the packages you'd like to list"
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-lg border border-sand-200 px-4 py-2.5 text-sm outline-none focus:border-ocean-400"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-ocean-600 py-3 text-sm font-bold text-white hover:bg-ocean-700 disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
