import { Link, Navigate } from "react-router-dom"
import { Calendar, Compass, Heart, LogOut, Mail, MapPin, Phone, Sparkles, Users } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useTrip } from "../context/TripContext"
import { formatDate, formatPrice } from "../lib/utils"
import { SmartImage } from "../components/SmartImage"
import { Reveal, StaggerGroup, StaggerItem } from "../components/Reveal"

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { bookings, wishlist, quoteRequests } = useTrip()

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Reveal className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ocean-100 text-xl font-bold text-ocean-700">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <h1 className="font-display text-xl font-bold text-ocean-950">Hi, {user.name}</h1>
            <p className="flex items-center gap-1.5 text-sm text-ocean-950/60">
              <Mail size={13} /> {user.email}
            </p>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-1.5 rounded-full border border-sand-200 px-4 py-2 text-sm font-semibold text-ocean-950 hover:border-sunset-300 hover:text-sunset-600">
          <LogOut size={14} /> Sign Out
        </button>
      </Reveal>

      <StaggerGroup className="mb-8 grid grid-cols-3 gap-3 sm:gap-4">
        <StaggerItem className="rounded-2xl border border-sand-200 bg-white p-4 text-center">
          <p className="font-display text-2xl font-bold text-ocean-950">{bookings.length}</p>
          <p className="text-xs text-ocean-950/60">Bookings</p>
        </StaggerItem>
        <StaggerItem className="rounded-2xl border border-sand-200 bg-white p-4 text-center">
          <p className="font-display text-2xl font-bold text-ocean-950">{wishlist.length}</p>
          <p className="text-xs text-ocean-950/60">Wishlisted</p>
        </StaggerItem>
        <StaggerItem className="rounded-2xl border border-sand-200 bg-white p-4 text-center">
          <p className="font-display text-2xl font-bold text-ocean-950">{quoteRequests.length}</p>
          <p className="text-xs text-ocean-950/60">Custom Quotes</p>
        </StaggerItem>
      </StaggerGroup>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-ocean-950">My Trips</h2>
        <Link to="/explore" className="text-sm font-semibold text-ocean-700 hover:underline">
          Book another trip →
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="mb-10 rounded-2xl border border-dashed border-sand-300 py-14 text-center">
          <Compass size={28} className="mx-auto mb-2 text-ocean-950/30" />
          <p className="text-sm font-semibold text-ocean-950">No bookings yet</p>
          <p className="mt-1 text-sm text-ocean-950/60">Start exploring packages to plan your next holiday.</p>
          <Link to="/explore" className="mt-4 inline-block rounded-full bg-ocean-600 px-5 py-2.5 text-sm font-semibold text-white">
            Browse Packages
          </Link>
        </div>
      ) : (
        <div className="mb-10 space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="flex flex-col gap-4 rounded-2xl border border-sand-200 bg-white p-4 sm:flex-row">
              <SmartImage src={b.image} alt={b.packageTitle} className="h-32 w-full shrink-0 rounded-xl sm:h-24 sm:w-32" />
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-base font-bold text-ocean-950">{b.packageTitle}</h3>
                    <span className="shrink-0 rounded-full bg-ocean-50 px-2.5 py-1 text-[11px] font-bold capitalize text-ocean-700">
                      {b.status}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ocean-950/60">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {formatDate(b.startDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} /> {b.travelers} travelers
                    </span>
                    <span>ID: {b.id}</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-display text-base font-bold text-ocean-950">{formatPrice(b.totalPrice)}</span>
                  <Link to={`/booking-confirmation/${b.id}`} className="text-xs font-semibold text-ocean-700 hover:underline">
                    View details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {quoteRequests.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-4 font-display text-lg font-bold text-ocean-950">Custom Trip Requests</h2>
          <div className="space-y-3">
            {quoteRequests.map((q) => (
              <div key={q.id} className="rounded-2xl border border-sand-200 bg-white p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles size={15} className="text-sunset-500" />
                  <p className="text-sm font-semibold text-ocean-950">{q.destinations.join(", ")}</p>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ocean-950/60">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {q.days} days
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={12} /> {q.travelers} travelers
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone size={12} /> {q.phone}
                  </span>
                </div>
                <p className="mt-2 text-xs font-semibold text-ocean-950/50">Estimated budget up to {formatPrice(q.budget)} · Our team will follow up soon</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-sand-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 font-display text-lg font-bold text-ocean-950">
            <Heart size={16} className="text-sunset-500" /> Wishlist
          </h2>
          <Link to="/wishlist" className="text-sm font-semibold text-ocean-700 hover:underline">
            View all →
          </Link>
        </div>
        <p className="text-sm text-ocean-950/60">
          {wishlist.length === 0 ? "You haven't saved any packages yet." : `You have ${wishlist.length} package(s) saved for later.`}
        </p>
      </div>
    </div>
  )
}
