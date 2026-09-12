import { useState } from "react"
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Banknote, Building2, Check, ChevronLeft, ChevronRight, CreditCard, Lock, ShieldCheck, Smartphone } from "lucide-react"
import { getPackageBySlug } from "../lib/catalogHelpers"
import { useCatalog } from "../context/CatalogContext"
import { cn, formatDate, formatPrice } from "../lib/utils"
import { SmartImage } from "../components/SmartImage"
import { useTrip, type Traveler } from "../context/TripContext"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import { Reveal } from "../components/Reveal"

const checkoutAddOns = [
  { id: "insurance", label: "Travel Insurance", desc: "Medical & trip cancellation cover", price: 1499 },
  { id: "transfer", label: "Priority Airport Transfers", desc: "Dedicated pickup & drop-off", price: 1999 },
  { id: "guide", label: "Private Local Guide", desc: "English-speaking guide throughout", price: 3999 },
]

const paymentMethods = [
  { id: "card", label: "Credit / Debit Card", icon: CreditCard },
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "netbanking", label: "Net Banking", icon: Building2 },
  { id: "later", label: "Pay 20% Now, Rest Later", icon: Banknote },
]

const steps = ["Review", "Travelers", "Add-ons", "Payment"] as const

export default function Checkout() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { addBooking } = useTrip()
  const { user } = useAuth()
  const { showToast } = useToast()
  const { packages } = useCatalog()

  const pkg = slug ? getPackageBySlug(packages, slug) : undefined
  const initialTravelers = Number(searchParams.get("travelers") ?? 2)
  const initialDate = searchParams.get("date") ?? pkg?.startDates[0] ?? ""

  const [step, setStep] = useState(0)
  const [travelerCount, setTravelerCount] = useState(initialTravelers)
  const [date, setDate] = useState(initialDate)
  const [travelerDetails, setTravelerDetails] = useState<Traveler[]>(
    Array.from({ length: initialTravelers }, () => ({ name: "", age: "" })),
  )
  const [contactEmail, setContactEmail] = useState(user?.email ?? "")
  const [contactPhone, setContactPhone] = useState("")
  const [addOns, setAddOns] = useState<string[]>([])
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [processing, setProcessing] = useState(false)

  if (!pkg) return <Navigate to="/explore" replace />

  const syncTravelerCount = (count: number) => {
    setTravelerCount(count)
    setTravelerDetails((prev) => {
      const next = [...prev]
      while (next.length < count) next.push({ name: "", age: "" })
      return next.slice(0, count)
    })
  }

  const updateTraveler = (i: number, field: keyof Traveler, value: string) => {
    setTravelerDetails((prev) => prev.map((t, idx) => (idx === i ? { ...t, [field]: value } : t)))
  }

  const addOnTotal = addOns.reduce((sum, id) => sum + (checkoutAddOns.find((a) => a.id === id)?.price ?? 0) * travelerCount, 0)
  const packageTotal = pkg.price * travelerCount
  const taxes = Math.round((packageTotal + addOnTotal) * 0.05)
  const grandTotal = packageTotal + addOnTotal + taxes

  const toggleAddOn = (id: string) => setAddOns((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]))

  const canProceed = () => {
    if (step === 1) return travelerDetails.every((t) => t.name.trim())
    if (step === 2) return Boolean(contactEmail && contactPhone)
    return true
  }

  const confirmBooking = async () => {
    setProcessing(true)

    const bookingPayload = {
      packageId: pkg.id,
      packageTitle: pkg.title,
      image: pkg.image,
      startDate: date,
      travelers: travelerCount,
      addOns,
      totalPrice: grandTotal,
      travelerDetails,
      contactEmail,
      contactPhone,
    }

    // Falls back to a locally-generated id if the backend isn't set up yet
    // (or the request fails), so checkout still works end-to-end for demo
    // purposes — the booking just won't reach the admin panel in that case.
    let bookingId = `RM${Date.now().toString().slice(-8)}`
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      })
      if (res.ok) {
        const saved = await res.json()
        bookingId = saved.id
      }
    } catch {
      // handled by the fallback id above
    }

    addBooking({
      id: bookingId,
      ...bookingPayload,
      status: "upcoming",
      createdAt: new Date().toISOString(),
    })
    setProcessing(false)
    showToast("Booking confirmed! Check your email for details.")
    navigate(`/booking-confirmation/${bookingId}`)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Reveal><h1 className="mb-6 font-display text-2xl font-bold text-ocean-950">Complete Your Booking</h1></Reveal>

      <div className="mb-8 flex items-center justify-between">
        {steps.map((label, i) => (
          <div key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                  i < step ? "bg-ocean-600 text-white" : i === step ? "bg-sunset-500 text-white" : "bg-sand-100 text-ocean-950/40",
                )}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </span>
              <span className={cn("hidden text-xs font-medium sm:block", i === step ? "text-ocean-950" : "text-ocean-950/40")}>{label}</span>
            </div>
            {i < steps.length - 1 && <span className={cn("mx-2 h-0.5 flex-1", i < step ? "bg-ocean-600" : "bg-sand-200")} />}
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-sand-200 bg-white p-5 sm:p-7">
          {step === 0 && (
            <div>
              <h2 className="mb-4 font-display text-lg font-bold text-ocean-950">Review Your Trip</h2>
              <div className="flex gap-4 rounded-xl border border-sand-200 p-4">
                <SmartImage src={pkg.image} alt={pkg.title} className="h-20 w-24 shrink-0 rounded-lg" />
                <div>
                  <h3 className="font-display text-base font-bold text-ocean-950">{pkg.title}</h3>
                  <p className="text-sm text-ocean-950/60">
                    {pkg.destinationName}, {pkg.country} · {pkg.days}D/{pkg.nights}N
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-ocean-950/60">Departure Date</label>
                  <select
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-sand-200 px-3 py-2.5 text-sm outline-none focus:border-ocean-400"
                  >
                    {pkg.startDates.map((d) => (
                      <option key={d} value={d}>
                        {formatDate(d)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-ocean-950/60">Travelers</label>
                  <div className="flex items-center justify-between rounded-lg border border-sand-200 px-3 py-2">
                    <button onClick={() => syncTravelerCount(Math.max(1, travelerCount - 1))} className="flex h-7 w-7 items-center justify-center rounded-full bg-sand-100 text-sm font-bold">
                      −
                    </button>
                    <span className="text-sm font-semibold text-ocean-950">{travelerCount}</span>
                    <button onClick={() => syncTravelerCount(Math.min(pkg.groupSizeMax, travelerCount + 1))} className="flex h-7 w-7 items-center justify-center rounded-full bg-sand-100 text-sm font-bold">
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="mb-1 font-display text-lg font-bold text-ocean-950">Traveler Details</h2>
              <p className="mb-5 text-sm text-ocean-950/60">Enter details exactly as per government ID for each traveler.</p>
              <div className="space-y-4">
                {travelerDetails.map((t, i) => (
                  <div key={i} className="grid gap-3 rounded-xl border border-sand-200 p-4 sm:grid-cols-[1fr_120px]">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-ocean-950/60">Traveler {i + 1} Full Name</label>
                      <input
                        value={t.name}
                        onChange={(e) => updateTraveler(i, "name", e.target.value)}
                        placeholder="Full name"
                        className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-ocean-950/60">Age</label>
                      <input
                        value={t.age}
                        onChange={(e) => updateTraveler(i, "age", e.target.value)}
                        placeholder="Age"
                        inputMode="numeric"
                        className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-4 border-t border-sand-200 pt-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-ocean-950/60">Contact Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-ocean-950/60">Contact Phone</label>
                  <input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="mb-1 font-display text-lg font-bold text-ocean-950">Enhance Your Trip</h2>
              <p className="mb-5 text-sm text-ocean-950/60">Optional add-ons, priced per traveler.</p>
              <div className="space-y-3">
                {checkoutAddOns.map((addon) => {
                  const active = addOns.includes(addon.id)
                  return (
                    <button
                      key={addon.id}
                      onClick={() => toggleAddOn(addon.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors",
                        active ? "border-ocean-600 bg-ocean-50/50" : "border-sand-200",
                      )}
                    >
                      <div>
                        <p className="text-sm font-semibold text-ocean-950">{addon.label}</p>
                        <p className="text-xs text-ocean-950/50">{addon.desc}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-ocean-950">{formatPrice(addon.price)}</span>
                        <span
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                            active ? "border-ocean-600 bg-ocean-600 text-white" : "border-sand-300",
                          )}
                        >
                          {active && <Check size={13} />}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="mb-4 font-display text-lg font-bold text-ocean-950">Payment Method</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {paymentMethods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-4 text-left transition-colors",
                      paymentMethod === m.id ? "border-ocean-600 bg-ocean-50/50" : "border-sand-200",
                    )}
                  >
                    <m.icon size={18} className="text-ocean-600" />
                    <span className="text-sm font-semibold text-ocean-950">{m.label}</span>
                  </button>
                ))}
              </div>
              {paymentMethod === "card" && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <input placeholder="Card number" className="rounded-lg border border-sand-200 px-3 py-2.5 text-sm outline-none focus:border-ocean-400 sm:col-span-2" />
                  <input placeholder="MM / YY" className="rounded-lg border border-sand-200 px-3 py-2.5 text-sm outline-none focus:border-ocean-400" />
                  <input placeholder="CVV" className="rounded-lg border border-sand-200 px-3 py-2.5 text-sm outline-none focus:border-ocean-400" />
                </div>
              )}
              {paymentMethod === "upi" && (
                <input placeholder="yourname@upi" className="mt-5 w-full rounded-lg border border-sand-200 px-3 py-2.5 text-sm outline-none focus:border-ocean-400" />
              )}
              <p className="mt-5 flex items-center gap-1.5 text-xs text-ocean-950/50">
                <Lock size={12} /> This is a demo checkout — no real payment will be processed.
              </p>
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
                onClick={() => canProceed() && setStep((s) => Math.min(steps.length - 1, s + 1))}
                disabled={!canProceed()}
                className="flex items-center gap-1 rounded-full bg-ocean-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
              >
                Continue <ChevronRight size={15} />
              </button>
            ) : (
              <button
                onClick={confirmBooking}
                disabled={processing}
                className="flex items-center gap-2 rounded-full bg-sunset-500 px-6 py-2.5 text-sm font-bold text-white disabled:opacity-70"
              >
                {processing ? "Processing..." : `Pay ${formatPrice(grandTotal)}`}
              </button>
            )}
          </div>
        </div>

        {/* Price summary */}
        <div className="lg:sticky lg:top-20 lg:h-fit">
          <div className="rounded-2xl border border-sand-200 bg-white p-5">
            <h3 className="mb-4 font-display text-base font-bold text-ocean-950">Price Summary</h3>
            <div className="space-y-2 text-sm text-ocean-950/70">
              <div className="flex justify-between">
                <span>
                  {formatPrice(pkg.price)} × {travelerCount}
                </span>
                <span className="font-medium text-ocean-950">{formatPrice(packageTotal)}</span>
              </div>
              {addOns.map((id) => {
                const addon = checkoutAddOns.find((a) => a.id === id)
                if (!addon) return null
                return (
                  <div key={id} className="flex justify-between">
                    <span>{addon.label}</span>
                    <span className="font-medium text-ocean-950">{formatPrice(addon.price * travelerCount)}</span>
                  </div>
                )
              })}
              <div className="flex justify-between">
                <span>Taxes & fees</span>
                <span className="font-medium text-ocean-950">{formatPrice(taxes)}</span>
              </div>
            </div>
            <div className="mt-4 flex justify-between border-t border-sand-200 pt-4">
              <span className="font-semibold text-ocean-950">Total</span>
              <span className="font-display text-xl font-bold text-ocean-950">{formatPrice(grandTotal)}</span>
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-ocean-950/50">
              <ShieldCheck size={13} className="text-ocean-500" /> Secure booking · Free cancellation up to 15 days prior
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
