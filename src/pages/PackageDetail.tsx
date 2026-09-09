import { useMemo, useState } from "react"
import { Link, Navigate, useNavigate, useParams } from "react-router-dom"
import {
  BadgeCheck,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  MapPin,
  Share2,
  ShieldCheck,
  Users,
  Utensils,
  X,
} from "lucide-react"
import { getPackageBySlug, getRelatedPackages } from "../data/packages"
import { suppliers } from "../data/suppliers"
import { cn, discountPercent, formatDate, formatPrice } from "../lib/utils"
import { RatingStars } from "../components/RatingStars"
import { SmartImage } from "../components/SmartImage"
import { WishlistButton } from "../components/WishlistButton"
import { PackageCard } from "../components/PackageCard"
import { useToast } from "../context/ToastContext"

const tabs = ["Overview", "Itinerary", "Inclusions", "Reviews", "Supplier", "FAQs"] as const

export default function PackageDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const pkg = slug ? getPackageBySlug(slug) : undefined

  const [activeImage, setActiveImage] = useState(0)
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Overview")
  const [travelers, setTravelers] = useState(2)
  const [selectedDate, setSelectedDate] = useState<string>(pkg?.startDates[0] ?? "")
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const related = useMemo(() => (pkg ? getRelatedPackages(pkg) : []), [pkg])

  if (!pkg) return <Navigate to="/explore" replace />

  const supplier = suppliers.find((s) => s.id === pkg.supplierId)
  const discount = discountPercent(pkg.price, pkg.originalPrice)
  const totalPrice = pkg.price * travelers

  const handleBook = () => {
    if (!selectedDate) {
      showToast("Please select a departure date", "info")
      return
    }
    navigate(`/checkout/${pkg.slug}?date=${selectedDate}&travelers=${travelers}`)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-1.5 text-xs text-ocean-950/50">
        <Link to="/" className="hover:text-ocean-700">
          Home
        </Link>
        <span>/</span>
        <Link to="/explore" className="hover:text-ocean-700">
          Packages
        </Link>
        <span>/</span>
        <span className="text-ocean-950/80">{pkg.title}</span>
      </div>

      {/* Gallery */}
      <div className="mb-6 grid gap-2 sm:grid-cols-[2fr_1fr]">
        <SmartImage src={pkg.gallery[activeImage] ?? pkg.image} alt={pkg.title} className="aspect-[16/10] w-full rounded-2xl sm:aspect-[4/3]" />
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-2">
          {pkg.gallery.slice(0, 4).map((img, i) => (
            <button
              key={img + i}
              onClick={() => setActiveImage(i)}
              className={cn(
                "overflow-hidden rounded-xl border-2 transition-colors",
                activeImage === i ? "border-ocean-600" : "border-transparent",
              )}
            >
              <SmartImage src={img} alt={`${pkg.title} ${i + 1}`} className="aspect-square w-full sm:aspect-[4/3]" />
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {/* Header */}
          <div className="mb-6">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {pkg.category.map((c) => (
                <span key={c} className="rounded-full bg-ocean-50 px-2.5 py-0.5 text-xs font-semibold text-ocean-700">
                  {c}
                </span>
              ))}
              {pkg.bestSeller && (
                <span className="rounded-full bg-sunset-500 px-2.5 py-0.5 text-xs font-bold text-white">Bestseller</span>
              )}
            </div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="font-display text-2xl font-bold text-ocean-950 sm:text-3xl">{pkg.title}</h1>
              <div className="flex shrink-0 gap-2">
                <WishlistButton packageId={pkg.id} className="static border border-sand-200" />
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href)
                    showToast("Link copied to clipboard")
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-sand-200 text-ocean-950/60 hover:bg-sand-100"
                >
                  <Share2 size={15} />
                </button>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ocean-950/70">
              <span className="flex items-center gap-1">
                <MapPin size={14} /> {pkg.destinationName}, {pkg.country}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} /> {pkg.days}D / {pkg.nights}N
              </span>
              <span className="flex items-center gap-1.5">
                <RatingStars rating={pkg.rating} size={13} />
                {pkg.rating} ({pkg.reviewsCount} reviews)
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-1 overflow-x-auto border-b border-sand-200 no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors",
                  activeTab === tab ? "border-ocean-600 text-ocean-700" : "border-transparent text-ocean-950/50 hover:text-ocean-950",
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "Overview" && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-3 font-display text-lg font-bold text-ocean-950">Trip Highlights</h2>
                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {pkg.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-sm text-ocean-950/80">
                      <Check size={16} className="mt-0.5 shrink-0 text-ocean-500" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid gap-4 rounded-2xl border border-sand-200 p-5 sm:grid-cols-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ocean-50 text-ocean-600">
                    <Users size={18} />
                  </span>
                  <div>
                    <p className="text-xs text-ocean-950/50">Group Size</p>
                    <p className="text-sm font-semibold text-ocean-950">Up to {pkg.groupSizeMax}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ocean-50 text-ocean-600">
                    <Utensils size={18} />
                  </span>
                  <div>
                    <p className="text-xs text-ocean-950/50">Meal Plan</p>
                    <p className="text-sm font-semibold text-ocean-950">{pkg.mealPlan}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ocean-50 text-ocean-600">
                    <ShieldCheck size={18} />
                  </span>
                  <div>
                    <p className="text-xs text-ocean-950/50">Difficulty</p>
                    <p className="text-sm font-semibold text-ocean-950">{pkg.difficulty}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {pkg.tags.map((t) => (
                  <span key={t} className="rounded-full bg-sand-100 px-3 py-1 text-xs font-medium text-ocean-950/70">
                    #{t.replace(/\s+/g, "")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Itinerary" && (
            <div className="space-y-5">
              {pkg.itinerary.map((day, i) => (
                <div key={day.day} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ocean-600 text-sm font-bold text-white">
                      {day.day}
                    </span>
                    {i < pkg.itinerary.length - 1 && <span className="mt-1 w-px flex-1 bg-sand-200" />}
                  </div>
                  <div className="pb-5">
                    <h3 className="font-display text-base font-bold text-ocean-950">
                      Day {day.day}: {day.title}
                    </h3>
                    <p className="mt-1 text-sm text-ocean-950/70">{day.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {day.activities.map((a) => (
                        <span key={a} className="rounded-full bg-ocean-50 px-2.5 py-1 text-xs font-medium text-ocean-700">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "Inclusions" && (
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="mb-3 font-display text-base font-bold text-ocean-950">What's Included</h3>
                <ul className="space-y-2">
                  {pkg.inclusions.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-ocean-950/80">
                      <Check size={16} className="mt-0.5 shrink-0 text-ocean-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-3 font-display text-base font-bold text-ocean-950">What's Not Included</h3>
                <ul className="space-y-2">
                  {pkg.exclusions.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-ocean-950/80">
                      <X size={16} className="mt-0.5 shrink-0 text-sunset-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === "Reviews" && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-sand-200 p-5">
                <div className="text-center">
                  <p className="font-display text-4xl font-bold text-ocean-950">{pkg.rating}</p>
                  <RatingStars rating={pkg.rating} className="mt-1 justify-center" />
                  <p className="mt-1 text-xs text-ocean-950/50">{pkg.reviewsCount} reviews</p>
                </div>
                <div className="flex-1 space-y-1.5 min-w-48">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const pct = star === 5 ? 68 : star === 4 ? 22 : star === 3 ? 7 : star === 2 ? 2 : 1
                    return (
                      <div key={star} className="flex items-center gap-2 text-xs text-ocean-950/60">
                        <span className="w-8">{star} ★</span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand-100">
                          <div className="h-full rounded-full bg-gold-400" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-8 text-right">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              {pkg.reviews.map((r) => (
                <div key={r.id} className="rounded-2xl border border-sand-200 p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full font-display text-sm font-bold text-white",
                          r.avatarColor === "ocean" && "bg-ocean-600",
                          r.avatarColor === "sunset" && "bg-sunset-500",
                          r.avatarColor === "gold" && "bg-gold-500",
                        )}
                      >
                        {r.name.charAt(0)}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-ocean-950">{r.name}</p>
                        <p className="text-xs text-ocean-950/50">
                          {r.tripType} · {formatDate(r.date)}
                        </p>
                      </div>
                    </div>
                    <RatingStars rating={r.rating} size={13} />
                  </div>
                  <h4 className="mb-1 text-sm font-semibold text-ocean-950">{r.title}</h4>
                  <p className="text-sm text-ocean-950/70">{r.body}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "Supplier" && supplier && (
            <div className="rounded-2xl border border-sand-200 p-6">
              <div className="flex items-start gap-4">
                <span
                  className={cn(
                    "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl font-display text-xl font-bold text-white",
                    supplier.color === "ocean" && "bg-ocean-600",
                    supplier.color === "sunset" && "bg-sunset-500",
                    supplier.color === "gold" && "bg-gold-500",
                  )}
                >
                  {supplier.logoInitial}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display text-lg font-bold text-ocean-950">{supplier.name}</h3>
                    {supplier.verified && <BadgeCheck size={16} className="text-ocean-500" />}
                  </div>
                  <p className="text-sm text-ocean-950/60">{supplier.location} · Partner since {supplier.since}</p>
                  <div className="mt-2 flex items-center gap-4 text-sm text-ocean-950/70">
                    <span className="flex items-center gap-1">
                      <RatingStars rating={supplier.rating} size={13} /> {supplier.rating}
                    </span>
                    <span>{supplier.packagesCount} packages</span>
                    <span className="rounded-full bg-sand-100 px-2 py-0.5 text-xs font-medium capitalize">
                      {supplier.type} partner
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-ocean-950/70">
                <strong className="text-ocean-950">Specialty:</strong> {supplier.specialty}
              </p>
              <Link to="/suppliers" className="mt-4 inline-block text-sm font-semibold text-ocean-700 hover:underline">
                View all suppliers →
              </Link>
            </div>
          )}

          {activeTab === "FAQs" && (
            <div className="space-y-2">
              {pkg.faqs.map((faq, i) => (
                <div key={faq.q} className="rounded-xl border border-sand-200">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-semibold text-ocean-950"
                  >
                    {faq.q}
                    <ChevronDown size={16} className={cn("shrink-0 transition-transform", openFaq === i && "rotate-180")} />
                  </button>
                  {openFaq === i && <p className="px-4 pb-4 text-sm text-ocean-950/70">{faq.a}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking Sidebar */}
        <div className="lg:sticky lg:top-20 lg:h-fit">
          <div className="rounded-2xl border border-sand-200 bg-white p-5 shadow-card">
            <div className="mb-4 flex items-baseline gap-2">
              {discount > 0 && <span className="text-sm text-ocean-950/40 line-through">{formatPrice(pkg.originalPrice)}</span>}
              <span className="font-display text-2xl font-bold text-ocean-950">{formatPrice(pkg.price)}</span>
              <span className="text-xs text-ocean-950/50">/ person</span>
            </div>
            {discount > 0 && (
              <p className="mb-4 text-xs font-semibold text-sunset-600">You save {discount}% on this package</p>
            )}

            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-ocean-950/60">
              <Calendar size={13} /> Departure Date
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mb-4 w-full rounded-lg border border-sand-200 px-3 py-2.5 text-sm font-medium text-ocean-950 outline-none focus:border-ocean-400"
            >
              {pkg.startDates.map((d) => (
                <option key={d} value={d}>
                  {formatDate(d)}
                </option>
              ))}
            </select>

            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-ocean-950/60">
              <Users size={13} /> Travelers
            </label>
            <div className="mb-5 flex items-center justify-between rounded-lg border border-sand-200 px-3 py-2">
              <button
                onClick={() => setTravelers((t) => Math.max(1, t - 1))}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-sand-100 text-sm font-bold text-ocean-950"
              >
                −
              </button>
              <span className="text-sm font-semibold text-ocean-950">
                {travelers} {travelers === 1 ? "traveler" : "travelers"}
              </span>
              <button
                onClick={() => setTravelers((t) => Math.min(pkg.groupSizeMax, t + 1))}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-sand-100 text-sm font-bold text-ocean-950"
              >
                +
              </button>
            </div>

            <div className="mb-4 flex items-center justify-between border-t border-sand-200 pt-4">
              <span className="text-sm font-medium text-ocean-950/70">Total Price</span>
              <span className="font-display text-xl font-bold text-ocean-950">{formatPrice(totalPrice)}</span>
            </div>

            <button
              onClick={handleBook}
              className="mb-2.5 w-full rounded-full bg-sunset-500 py-3 text-sm font-bold text-white transition-colors hover:bg-sunset-600"
            >
              Book Now
            </button>
            <Link
              to="/build-trip"
              className="block w-full rounded-full border border-sand-200 py-3 text-center text-sm font-semibold text-ocean-950 hover:border-ocean-300"
            >
              Customize This Trip
            </Link>

            {pkg.flexible && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-ocean-950/50">
                <ShieldCheck size={13} className="text-ocean-500" /> Free cancellation up to 15 days before departure
              </p>
            )}

            {supplier && (
              <div className="mt-4 flex items-center gap-2 border-t border-sand-200 pt-4 text-xs text-ocean-950/60">
                <BadgeCheck size={14} className="text-ocean-500" />
                Sold by <span className="font-semibold text-ocean-950">{supplier.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="mb-5 font-display text-2xl font-bold text-ocean-950">You Might Also Like</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <PackageCard key={p.id} pkg={p} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-14 z-30 border-t border-sand-200 bg-white p-3 shadow-lift sm:bottom-0 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-display text-lg font-bold text-ocean-950">{formatPrice(pkg.price)}</p>
            <p className="text-xs text-ocean-950/50">per person</p>
          </div>
          <button onClick={handleBook} className="rounded-full bg-sunset-500 px-6 py-3 text-sm font-bold text-white">
            Book Now
          </button>
        </div>
      </div>
    </div>
  )
}
