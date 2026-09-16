import { Link, Navigate, useParams, useSearchParams } from "react-router-dom"
import { BadgeCheck, Calendar, Check, Compass, Mail, MapPin, Phone, Printer, Users, X } from "lucide-react"
import { useCatalog } from "../context/CatalogContext"
import { getPackageById } from "../lib/catalogHelpers"
import { formatDate, formatPrice } from "../lib/utils"

export default function ItineraryPrint() {
  const { packageId } = useParams()
  const [searchParams] = useSearchParams()
  const { packages, suppliers } = useCatalog()
  const pkg = packageId ? getPackageById(packages, packageId) : undefined

  if (!pkg) return <Navigate to="/explore" replace />

  const supplier = suppliers.find((s) => s.id === pkg.supplierId)
  const date = searchParams.get("date") || pkg.startDates[0]
  const travelers = Number(searchParams.get("travelers")) || 2
  const bookingId = searchParams.get("bookingId")
  const totalPrice = pkg.price * travelers

  return (
    <div className="min-h-svh bg-sand-100">
      <div className="no-print sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-sand-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
        <Link to={`/package/${pkg.slug}`} className="text-sm font-semibold text-ocean-950/60 hover:text-ocean-950">
          ← Back to package
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-full bg-ocean-600 px-4 py-2 text-sm font-bold text-white hover:bg-ocean-700"
        >
          <Printer size={15} /> Download as PDF
        </button>
      </div>

      <div className="mx-auto max-w-3xl bg-white px-6 py-10 print:px-0 print:py-0 sm:px-10">
        {/* Doc header */}
        <div className="mb-8 flex items-start justify-between gap-4 border-b border-sand-200 pb-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ocean-600 text-white">
              <Compass size={18} />
            </span>
            <div>
              <p className="font-display text-base font-bold text-ocean-950">Roamly Holidays</p>
              <p className="text-xs text-ocean-950/50">Trip Itinerary</p>
            </div>
          </div>
          <div className="text-right text-xs text-ocean-950/50">
            {bookingId && (
              <p>
                Booking ID: <span className="font-mono font-semibold text-ocean-950">{bookingId}</span>
              </p>
            )}
            <p>Generated {formatDate(new Date().toISOString())}</p>
          </div>
        </div>

        {/* Trip summary */}
        <h1 className="font-display text-2xl font-bold text-ocean-950 sm:text-3xl">{pkg.title}</h1>
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ocean-950/60">
          <MapPin size={14} /> {pkg.destinationName}, {pkg.country} · {pkg.days}D / {pkg.nights}N
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl border border-sand-200 p-4 sm:grid-cols-4">
          <div>
            <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-ocean-950/40">
              <Calendar size={11} /> Departure
            </p>
            <p className="mt-0.5 text-sm font-bold text-ocean-950">{date ? formatDate(date) : "Flexible"}</p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-ocean-950/40">
              <Users size={11} /> Travelers
            </p>
            <p className="mt-0.5 text-sm font-bold text-ocean-950">{travelers}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ocean-950/40">Price / person</p>
            <p className="mt-0.5 text-sm font-bold text-ocean-950">{formatPrice(pkg.price)}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ocean-950/40">Total</p>
            <p className="mt-0.5 text-sm font-bold text-ocean-950">{formatPrice(totalPrice)}</p>
          </div>
        </div>

        {/* Day by day */}
        <div className="mt-8">
          <h2 className="mb-4 font-display text-lg font-bold text-ocean-950">Day-by-Day Itinerary</h2>
          <div className="space-y-5">
            {pkg.itinerary.map((day, i) => (
              <div key={day.day} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ocean-600 text-xs font-bold text-white">
                    {day.day}
                  </span>
                  {i < pkg.itinerary.length - 1 && <span className="mt-1 w-px flex-1 bg-sand-200" />}
                </div>
                <div className="pb-1">
                  <h3 className="font-display text-sm font-bold text-ocean-950">
                    Day {day.day}: {day.title}
                  </h3>
                  <p className="mt-1 text-sm text-ocean-950/70">{day.description}</p>
                  {day.activities.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {day.activities.map((a) => (
                        <span key={a} className="rounded-full bg-ocean-50 px-2.5 py-1 text-xs font-medium text-ocean-700">
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inclusions / exclusions */}
        <div className="mt-8 grid gap-6 border-t border-sand-200 pt-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-2.5 font-display text-sm font-bold text-ocean-950">What's Included</h3>
            <ul className="space-y-1.5">
              {pkg.inclusions.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-ocean-950/80">
                  <Check size={14} className="mt-0.5 shrink-0 text-ocean-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2.5 font-display text-sm font-bold text-ocean-950">What's Not Included</h3>
            <ul className="space-y-1.5">
              {pkg.exclusions.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-ocean-950/80">
                  <X size={14} className="mt-0.5 shrink-0 text-sunset-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Supplier */}
        {supplier && (
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-sand-200 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ocean-600 font-display text-sm font-bold text-white">
              {supplier.logoInitial}
            </span>
            <div>
              <p className="flex items-center gap-1.5 text-sm font-bold text-ocean-950">
                {supplier.name}
                {supplier.verified && <BadgeCheck size={14} className="text-ocean-500" />}
              </p>
              <p className="text-xs text-ocean-950/50">Operated by this verified {supplier.type} partner</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 border-t border-sand-200 pt-6 text-center text-xs text-ocean-950/50">
          <p className="font-semibold text-ocean-950/70">Need changes to this trip?</p>
          <p className="mt-1 flex items-center justify-center gap-4">
            <span className="flex items-center gap-1">
              <Phone size={12} /> +91 98765 43210
            </span>
            <span className="flex items-center gap-1">
              <Mail size={12} /> hello@roamly.travel
            </span>
          </p>
          <p className="mt-3">Thank you for planning your holiday with Roamly Holidays.</p>
        </div>
      </div>
    </div>
  )
}
