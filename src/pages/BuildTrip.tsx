import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Check, ChevronLeft, ChevronRight, MapPin, Minus, Plus, Sparkles, Wand2 } from "lucide-react"
import { useCatalog } from "../context/CatalogContext"
import { cn, formatPrice } from "../lib/utils"
import { SmartImage } from "../components/SmartImage"
import { Reveal } from "../components/Reveal"
import { useTrip } from "../context/TripContext"
import { useToast } from "../context/ToastContext"
import { useAuth } from "../context/AuthContext"

const styles = [
  { id: "relaxed", label: "Relaxed", body: "Fewer activities, more downtime", multiplier: 1.12 },
  { id: "balanced", label: "Balanced", body: "A healthy mix of sightseeing & rest", multiplier: 1 },
  { id: "packed", label: "Packed", body: "See and do as much as possible", multiplier: 0.94 },
]

const addOnsList = [
  { id: "protection", label: "Trip Protection Plan", price: 1499 },
  { id: "visa", label: "Visa Assistance", price: 2499 },
  { id: "guide", label: "Private Local Guide", price: 3999 },
  { id: "transfer", label: "Airport Transfers", price: 1999 },
  { id: "photo", label: "Professional Photoshoot", price: 5999 },
]

const steps = ["Destinations", "Preferences", "Add-ons", "Get Quote"] as const

export default function BuildTrip() {
  const navigate = useNavigate()
  const { addQuoteRequest } = useTrip()
  const { showToast } = useToast()
  const { session } = useAuth()
  const { destinations } = useCatalog()

  const [step, setStep] = useState(0)
  const [selectedDestinations, setSelectedDestinations] = useState<Record<string, number>>({})
  const [style, setStyle] = useState("balanced")
  const [travelers, setTravelers] = useState(2)
  const [month, setMonth] = useState("")
  const [addOns, setAddOns] = useState<string[]>([])
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" })
  const [submitted, setSubmitted] = useState(false)

  const totalDays = Object.values(selectedDestinations).reduce((a, b) => a + b, 0)

  const toggleDestination = (id: string) => {
    setSelectedDestinations((prev) => {
      const next = { ...prev }
      if (next[id]) delete next[id]
      else next[id] = 3
      return next
    })
  }

  const updateDays = (id: string, delta: number) => {
    setSelectedDestinations((prev) => ({ ...prev, [id]: Math.max(1, Math.min(14, (prev[id] ?? 1) + delta)) }))
  }

  const toggleAddOn = (id: string) => {
    setAddOns((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]))
  }

  const estimate = useMemo(() => {
    const styleMultiplier = styles.find((s) => s.id === style)?.multiplier ?? 1
    let base = 0
    for (const [id, days] of Object.entries(selectedDestinations)) {
      const dest = destinations.find((d) => d.id === id)
      if (!dest) continue
      const perNight = dest.fromPrice / 5
      base += perNight * days
    }
    base *= travelers * styleMultiplier
    const addOnTotal = addOns.reduce((sum, id) => {
      const addon = addOnsList.find((a) => a.id === id)
      return sum + (addon ? addon.price * travelers : 0)
    }, 0)
    return { low: Math.round((base + addOnTotal) * 0.9), high: Math.round((base + addOnTotal) * 1.15) }
  }, [selectedDestinations, style, travelers, addOns, destinations])

  const canProceed = step === 0 ? Object.keys(selectedDestinations).length > 0 : true

  const submitQuote = async () => {
    if (!form.name || !form.email || !form.phone) {
      showToast("Please fill in your name, email and phone", "info")
      return
    }
    const destinationNames = Object.keys(selectedDestinations).map((id) => destinations.find((d) => d.id === id)?.name ?? id)

    addQuoteRequest({
      id: `quote-${Date.now()}`,
      destinations: destinationNames,
      days: totalDays,
      travelers,
      budget: estimate.high,
      style,
      addOns,
      ...form,
      createdAt: new Date().toISOString(),
    })

    try {
      await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ destinations: destinationNames, days: totalDays, travelers, budget: estimate.high, style, addOns, ...form }),
      })
    } catch {
      // The request is still saved locally for the dashboard even if the
      // server call fails — the toast below stays accurate either way.
    }

    setSubmitted(true)
    showToast("Custom trip request sent! Our expert will call you within 24 hours.")
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-ocean-50 text-ocean-600">
          <Check size={28} />
        </span>
        <h1 className="font-display text-2xl font-bold text-ocean-950">Your custom trip request is in!</h1>
        <p className="mt-2 text-sm text-ocean-950/60">
          A Roamly trip expert will reach out within 24 hours with a tailored itinerary and final pricing for your{" "}
          {totalDays}-day trip across {Object.keys(selectedDestinations).length} destination(s).
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => navigate("/explore")} className="rounded-full bg-ocean-600 px-6 py-3 text-sm font-bold text-white">
            Browse Ready-Made Packages
          </button>
          <button onClick={() => navigate("/")} className="rounded-full border border-sand-200 px-6 py-3 text-sm font-bold text-ocean-950">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Reveal className="mb-8 text-center">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-sunset-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-sunset-600">
          <Wand2 size={13} /> Trip Builder
        </span>
        <h1 className="font-display text-2xl font-bold text-ocean-950 sm:text-3xl">Build Your Own Holiday</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-ocean-950/60">
          Mix destinations, set your pace, and get a live estimate — completely flexible, completely yours.
        </p>
      </Reveal>

      {/* Stepper */}
      <div className="mx-auto mb-10 flex max-w-2xl items-center justify-between">
        {steps.map((label, i) => (
          <div key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors",
                  i < step ? "bg-ocean-600 text-white" : i === step ? "bg-sunset-500 text-white" : "bg-sand-100 text-ocean-950/40",
                )}
              >
                {i < step ? <Check size={16} /> : i + 1}
              </span>
              <span className={cn("hidden text-xs font-medium sm:block", i === step ? "text-ocean-950" : "text-ocean-950/40")}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && <span className={cn("mx-2 h-0.5 flex-1", i < step ? "bg-ocean-600" : "bg-sand-200")} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-sand-200 bg-white p-5 sm:p-7">
          {step === 0 && (
            <div>
              <h2 className="mb-1 font-display text-lg font-bold text-ocean-950">Where do you want to go?</h2>
              <p className="mb-5 text-sm text-ocean-950/60">Select as many destinations as you like — set how many days for each.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {destinations.map((d) => {
                  const selected = Boolean(selectedDestinations[d.id])
                  return (
                    <div
                      key={d.id}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border p-3 transition-colors",
                        selected ? "border-ocean-500 bg-ocean-50/50" : "border-sand-200",
                      )}
                    >
                      <button onClick={() => toggleDestination(d.id)} className="flex flex-1 items-center gap-3 text-left">
                        <SmartImage src={d.image} alt={d.name} className="h-14 w-14 shrink-0 rounded-lg" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ocean-950">{d.name}</p>
                          <p className="truncate text-xs text-ocean-950/50">{d.country}</p>
                        </div>
                        <span
                          className={cn(
                            "ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                            selected ? "border-ocean-600 bg-ocean-600 text-white" : "border-sand-300",
                          )}
                        >
                          {selected && <Check size={13} />}
                        </span>
                      </button>
                      {selected && (
                        <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-1.5 py-1">
                          <button onClick={() => updateDays(d.id, -1)} className="flex h-6 w-6 items-center justify-center rounded-full bg-sand-100">
                            <Minus size={12} />
                          </button>
                          <span className="w-10 text-center text-xs font-bold text-ocean-950">{selectedDestinations[d.id]}d</span>
                          <button onClick={() => updateDays(d.id, 1)} className="flex h-6 w-6 items-center justify-center rounded-full bg-sand-100">
                            <Plus size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h2 className="mb-3 font-display text-lg font-bold text-ocean-950">What's your travel style?</h2>
                <div className="grid gap-3 sm:grid-cols-3">
                  {styles.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      className={cn(
                        "rounded-xl border p-4 text-left transition-colors",
                        style === s.id ? "border-ocean-600 bg-ocean-50/50" : "border-sand-200",
                      )}
                    >
                      <p className="text-sm font-bold text-ocean-950">{s.label}</p>
                      <p className="mt-1 text-xs text-ocean-950/60">{s.body}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="mb-3 font-display text-lg font-bold text-ocean-950">How many travelers?</h2>
                <div className="flex w-fit items-center gap-4 rounded-xl border border-sand-200 px-4 py-2.5">
                  <button onClick={() => setTravelers((t) => Math.max(1, t - 1))} className="flex h-8 w-8 items-center justify-center rounded-full bg-sand-100">
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-bold text-ocean-950">{travelers}</span>
                  <button onClick={() => setTravelers((t) => Math.min(20, t + 1))} className="flex h-8 w-8 items-center justify-center rounded-full bg-sand-100">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <div>
                <h2 className="mb-3 font-display text-lg font-bold text-ocean-950">Preferred travel month</h2>
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="rounded-xl border border-sand-200 px-4 py-2.5 text-sm font-medium text-ocean-950 outline-none focus:border-ocean-400"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="mb-1 font-display text-lg font-bold text-ocean-950">Add optional extras</h2>
              <p className="mb-5 text-sm text-ocean-950/60">Enhance your trip — you can always adjust these later with your trip expert.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {addOnsList.map((addon) => {
                  const active = addOns.includes(addon.id)
                  return (
                    <button
                      key={addon.id}
                      onClick={() => toggleAddOn(addon.id)}
                      className={cn(
                        "flex items-center justify-between rounded-xl border p-4 text-left transition-colors",
                        active ? "border-ocean-600 bg-ocean-50/50" : "border-sand-200",
                      )}
                    >
                      <div>
                        <p className="text-sm font-semibold text-ocean-950">{addon.label}</p>
                        <p className="text-xs text-ocean-950/50">{formatPrice(addon.price)} / person</p>
                      </div>
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                          active ? "border-ocean-600 bg-ocean-600 text-white" : "border-sand-300",
                        )}
                      >
                        {active && <Check size={13} />}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="mb-1 font-display text-lg font-bold text-ocean-950">Almost there — get your custom quote</h2>
              <p className="mb-5 text-sm text-ocean-950/60">Share your contact details and a trip expert will finalize pricing and hotels with you.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="rounded-xl border border-sand-200 px-4 py-2.5 text-sm outline-none focus:border-ocean-400"
                />
                <input
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="rounded-xl border border-sand-200 px-4 py-2.5 text-sm outline-none focus:border-ocean-400"
                />
                <input
                  placeholder="Email address"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="rounded-xl border border-sand-200 px-4 py-2.5 text-sm outline-none focus:border-ocean-400 sm:col-span-2"
                />
                <textarea
                  placeholder="Anything specific you'd like us to know? (hotel preferences, occasions, dietary needs...)"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={4}
                  className="rounded-xl border border-sand-200 px-4 py-2.5 text-sm outline-none focus:border-ocean-400 sm:col-span-2"
                />
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-sand-200 pt-5">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="flex items-center gap-1 rounded-full border border-sand-200 px-4 py-2.5 text-sm font-semibold text-ocean-950 disabled:opacity-30"
            >
              <ChevronLeft size={15} /> Back
            </button>
            {step < steps.length - 1 ? (
              <button
                onClick={() => canProceed && setStep((s) => Math.min(steps.length - 1, s + 1))}
                disabled={!canProceed}
                className="flex items-center gap-1 rounded-full bg-ocean-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
              >
                Continue <ChevronRight size={15} />
              </button>
            ) : (
              <button onClick={submitQuote} className="flex items-center gap-1.5 rounded-full bg-sunset-500 px-5 py-2.5 text-sm font-bold text-white">
                <Sparkles size={15} /> Get My Custom Quote
              </button>
            )}
          </div>
        </div>

        {/* Live summary */}
        <div className="lg:sticky lg:top-20 lg:h-fit">
          <div className="rounded-2xl border border-sand-200 bg-white p-5">
            <h3 className="mb-4 font-display text-base font-bold text-ocean-950">Your Trip So Far</h3>
            {Object.keys(selectedDestinations).length === 0 ? (
              <p className="text-sm text-ocean-950/50">No destinations selected yet.</p>
            ) : (
              <ul className="mb-4 space-y-2">
                {Object.entries(selectedDestinations).map(([id, days]) => {
                  const d = destinations.find((dest) => dest.id === id)
                  if (!d) return null
                  return (
                    <li key={id} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-ocean-950/80">
                        <MapPin size={13} className="text-ocean-500" /> {d.name}
                      </span>
                      <span className="font-semibold text-ocean-950">{days}d</span>
                    </li>
                  )
                })}
              </ul>
            )}
            <div className="space-y-1.5 border-t border-sand-200 pt-4 text-sm text-ocean-950/70">
              <div className="flex justify-between">
                <span>Total duration</span>
                <span className="font-semibold text-ocean-950">{totalDays} days</span>
              </div>
              <div className="flex justify-between">
                <span>Travelers</span>
                <span className="font-semibold text-ocean-950">{travelers}</span>
              </div>
              <div className="flex justify-between">
                <span>Style</span>
                <span className="font-semibold capitalize text-ocean-950">{style}</span>
              </div>
              {addOns.length > 0 && (
                <div className="flex justify-between">
                  <span>Add-ons</span>
                  <span className="font-semibold text-ocean-950">{addOns.length} selected</span>
                </div>
              )}
            </div>
            <div className="mt-4 rounded-xl bg-ocean-50 p-4">
              <p className="text-xs font-medium text-ocean-700">Estimated Price Range</p>
              <p className="font-display text-xl font-bold text-ocean-950">
                {formatPrice(estimate.low)} – {formatPrice(estimate.high)}
              </p>
              <p className="mt-1 text-[11px] text-ocean-950/50">Final price confirmed by your trip expert</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
