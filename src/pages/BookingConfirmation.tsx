import { Link, Navigate, useParams } from "react-router-dom"
import { Calendar, Check, Download, Mail, MapPin, Phone, Users } from "lucide-react"
import { useTrip } from "../context/TripContext"
import { formatDate, formatPrice } from "../lib/utils"
import { SmartImage } from "../components/SmartImage"
import { useToast } from "../context/ToastContext"
import { Reveal } from "../components/Reveal"

export default function BookingConfirmation() {
  const { bookingId } = useParams()
  const { bookings } = useTrip()
  const { showToast } = useToast()
  const booking = bookings.find((b) => b.id === bookingId)

  if (!booking) return <Navigate to="/dashboard" replace />

  return (
    <Reveal as="div" className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ocean-50 text-ocean-600">
          <Check size={30} />
        </span>
        <h1 className="font-display text-2xl font-bold text-ocean-950 sm:text-3xl">Booking Confirmed!</h1>
        <p className="mt-2 text-sm text-ocean-950/60">
          Confirmation sent to <strong>{booking.contactEmail}</strong>. Booking ID:{" "}
          <span className="font-mono font-bold text-ocean-950">{booking.id}</span>
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white">
        <SmartImage src={booking.image} alt={booking.packageTitle} className="aspect-video w-full" />
        <div className="p-6">
          <h2 className="font-display text-lg font-bold text-ocean-950">{booking.packageTitle}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm text-ocean-950/70">
              <Calendar size={15} className="text-ocean-500" /> {formatDate(booking.startDate)}
            </div>
            <div className="flex items-center gap-2 text-sm text-ocean-950/70">
              <Users size={15} className="text-ocean-500" /> {booking.travelers} travelers
            </div>
            <div className="flex items-center gap-2 text-sm text-ocean-950/70">
              <Mail size={15} className="text-ocean-500" /> {booking.contactEmail}
            </div>
            <div className="flex items-center gap-2 text-sm text-ocean-950/70">
              <Phone size={15} className="text-ocean-500" /> {booking.contactPhone}
            </div>
          </div>
          {booking.addOns.length > 0 && (
            <div className="mt-4 border-t border-sand-200 pt-4">
              <p className="mb-1.5 text-xs font-semibold text-ocean-950/60">Add-ons</p>
              <div className="flex flex-wrap gap-1.5">
                {booking.addOns.map((a) => (
                  <span key={a} className="rounded-full bg-sand-100 px-2.5 py-1 text-xs font-medium capitalize text-ocean-950/70">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="mt-4 flex items-center justify-between border-t border-sand-200 pt-4">
            <span className="text-sm font-semibold text-ocean-950/70">Total Paid</span>
            <span className="font-display text-xl font-bold text-ocean-950">{formatPrice(booking.totalPrice)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => showToast("Itinerary PDF would download here in production", "info")}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-sand-200 py-3 text-sm font-semibold text-ocean-950 hover:border-ocean-300"
        >
          <Download size={15} /> Download Itinerary
        </button>
        <Link
          to="/dashboard"
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ocean-600 py-3 text-sm font-semibold text-white hover:bg-ocean-700"
        >
          Go to My Trips
        </Link>
      </div>

      <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-ocean-950/50">
        <MapPin size={13} /> Need changes? Reach us anytime on WhatsApp or via your dashboard.
      </p>
    </Reveal>
  )
}
