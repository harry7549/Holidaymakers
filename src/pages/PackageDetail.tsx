import { useMemo, useState } from "react"
import { Link, Navigate, useNavigate, useParams } from "react-router-dom"
import {
  BadgeCheck,
  Bed,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Compass,
  Download,
  Grid3x3,
  Heart,
  MapPin,
  MessageCircle,
  Share2,
  ShieldCheck,
  Sparkles,
  Users,
  Utensils,
  X,
  type LucideIcon,
} from "lucide-react"
import { getPackageBySlug, getRelatedPackages } from "../lib/catalogHelpers"
import { useCatalog } from "../context/CatalogContext"
import { cn, discountPercent, formatDate, formatPrice } from "../lib/utils"
import { sanitizeRichText } from "../lib/sanitizeHtml"
import { RatingStars } from "../components/RatingStars"
import { SmartImage } from "../components/SmartImage"
import { WishlistButton } from "../components/WishlistButton"
import { PackageCard } from "../components/PackageCard"
import { Reveal, StaggerGroup, StaggerItem } from "../components/Reveal"
import { useToast } from "../context/ToastContext"

const HIGHLIGHT_ICONS = [Sparkles, Heart, Compass, ShieldCheck, MapPin, Calendar]

export default function PackageDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { packages, suppliers } = useCatalog()
  const pkg = slug ? getPackageBySlug(packages, slug) : undefined

  const [lightbox, setLightbox] = useState<number | null>(null)
  const [travelers, setTravelers] = useState(2)
  const [selectedDate, setSelectedDate] = useState<string>(pkg?.startDates[0] ?? "")
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const related = useMemo(() => (pkg ? getRelatedPackages(packages, pkg) : []), [pkg, packages])

  if (!pkg) return <Navigate to="/explore" replace />

  const gallery = pkg.gallery.length > 0 ? pkg.gallery : [pkg.image]
  const supplier = suppliers.find((s) => s.id === pkg.supplierId)
  const discount = discountPercent(pkg.price, pkg.originalPrice)
  const totalPrice = pkg.price * travelers
  const badge = pkg.bestSeller ? "Best seller" : pkg.rating >= 4.9 ? "Top rated" : null
  const whatsappHref = `https://wa.me/919876543210?text=${encodeURIComponent(`Hi! I'm interested in ${pkg.title}.`)}`

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
      <div className="mb-4 flex items-center gap-1.5 text-xs font-medium text-ocean-950/50">
        <Link to="/" className="hover:text-ocean-700">
          Home
        </Link>
        <span>›</span>
        <Link to="/explore" className="hover:text-ocean-700">
          Explore
        </Link>
        <span>›</span>
        <span className="text-ocean-950/75">{pkg.destinationName}</span>
      </div>

      {/* Header */}
      <Reveal className="mb-5">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {pkg.category.slice(0, 3).map((c) => (
            <span key={c} className="rounded-full bg-sand-100 px-2.5 py-1 text-xs font-semibold text-ocean-950/80">
              {c}
            </span>
          ))}
          {badge && <span className="rounded-full bg-sunset-500 px-2.5 py-1 text-xs font-bold text-white">{badge}</span>}
        </div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="min-w-0 font-display text-3xl font-extrabold text-ocean-950 sm:text-4xl">{pkg.title}</h1>
          <div className="flex shrink-0 gap-2">
            <WishlistButton packageId={pkg.id} className="static bg-sand-100" />
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href)
                showToast("Link copied to clipboard")
              }}
              aria-label="Share this package"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-sand-100 text-ocean-950/60 hover:bg-sand-200"
            >
              <Share2 size={15} />
            </button>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ocean-950/70">
          <a href="#reviews" className="flex items-center gap-1.5 font-semibold text-ocean-950 hover:underline">
            <RatingStars rating={pkg.rating} size={14} />
            {pkg.rating} ({pkg.reviewsCount} reviews)
          </a>
          <span className="flex items-center gap-1">
            <MapPin size={14} /> {pkg.destinationName}, {pkg.country}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={14} /> {pkg.days}D / {pkg.nights}N
          </span>
        </div>
      </Reveal>

      {/* Gallery */}
      <Reveal className="mb-8 grid h-64 grid-cols-2 gap-2 sm:h-[420px] sm:grid-rows-2">
        <button onClick={() => setLightbox(0)} className="row-span-2 overflow-hidden rounded-2xl">
          <SmartImage src={gallery[0]} alt={pkg.title} className="h-full w-full" />
        </button>
        <button onClick={() => setLightbox(1 % gallery.length)} className="hidden overflow-hidden rounded-2xl sm:block">
          <SmartImage src={gallery[1] ?? gallery[0]} alt={`${pkg.title} 2`} className="h-full w-full" />
        </button>
        <button onClick={() => setLightbox(0)} className="relative hidden overflow-hidden rounded-2xl sm:block">
          <SmartImage src={gallery[2] ?? gallery[0]} alt={`${pkg.title} 3`} className="h-full w-full" />
          <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-surface px-3 py-2 text-xs font-bold text-ocean-950 shadow-sm">
            <Grid3x3 size={14} /> All photos
          </span>
        </button>
      </Reveal>

      {lightbox !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ocean-950/90 p-4">
          <button onClick={() => setLightbox(null)} aria-label="Close" className="absolute right-5 top-5 text-white/80 hover:text-white">
            <X size={26} />
          </button>
          <button
            onClick={() => setLightbox((i) => ((i ?? 0) - 1 + gallery.length) % gallery.length)}
            aria-label="Previous photo"
            className="absolute left-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-6"
          >
            <ChevronLeft size={22} />
          </button>
          <SmartImage src={gallery[lightbox]} alt={pkg.title} className="aspect-[4/3] max-h-[80vh] w-full max-w-3xl rounded-2xl" />
          <button
            onClick={() => setLightbox((i) => ((i ?? 0) + 1) % gallery.length)}
            aria-label="Next photo"
            className="absolute right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-6"
          >
            <ChevronRight size={22} />
          </button>
          <span className="absolute bottom-6 text-sm font-medium text-white/70">
            {lightbox + 1} / {gallery.length}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-10">
          {/* Facts */}
          <Reveal className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-2xl border border-sand-200 p-5 sm:grid-cols-3">
            <Fact icon={Calendar} label={`${pkg.days} days / ${pkg.nights} nights`} />
            <Fact icon={Users} label={`Up to ${pkg.groupSizeMax} travellers`} />
            <Fact icon={Bed} label={`${pkg.hotelRating}★ hotels`} />
            <Fact icon={Utensils} label={pkg.mealPlan} />
            <Fact icon={ShieldCheck} label={pkg.difficulty} />
            {pkg.transport[0] && <Fact icon={Compass} label={pkg.transport.join(" + ")} />}
          </Reveal>

          {/* Highlights */}
          {pkg.highlights.length > 0 && (
            <div>
              <h2 className="mb-4 font-display text-2xl font-extrabold text-ocean-950">Highlights</h2>
              <StaggerGroup className="grid gap-3 sm:grid-cols-2">
                {pkg.highlights.map((h, i) => {
                  const Icon = HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length]
                  return (
                    <StaggerItem key={h} className="flex items-center gap-3 rounded-2xl bg-sand-100 p-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-ocean-950/70">
                        <Icon size={17} />
                      </span>
                      <p className="text-sm font-semibold text-ocean-950">{h}</p>
                    </StaggerItem>
                  )
                })}
              </StaggerGroup>
            </div>
          )}

          {/* Itinerary */}
          <div>
            <div className="mb-4 flex items-end justify-between">
              <h2 className="font-display text-2xl font-extrabold text-ocean-950">Itinerary</h2>
              <Link
                to={`/itinerary/${pkg.id}?date=${selectedDate}&travelers=${travelers}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-ocean-950/60 hover:text-ocean-700"
              >
                <Download size={13} /> Download PDF
              </Link>
            </div>
            <div className="space-y-0">
              {pkg.itinerary.map((day, i) => (
                <div key={day.day} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ocean-950 font-display text-sm font-bold text-white">
                      {day.day}
                    </span>
                    {i < pkg.itinerary.length - 1 && <span className="mt-1 w-px flex-1 bg-sand-200" />}
                  </div>
                  <div className="pb-7">
                    <p className="text-xs font-bold uppercase tracking-wide text-ocean-950/45">Day {day.day}</p>
                    <h3 className="mb-1 font-display text-lg font-bold text-ocean-950">{day.title}</h3>
                    <div
                      className="whitespace-pre-line text-sm text-ocean-950/70 [&_a]:text-ocean-700 [&_a]:underline [&_li]:ml-4 [&_ol]:list-decimal [&_ul]:list-disc"
                      dangerouslySetInnerHTML={{ __html: sanitizeRichText(day.description) }}
                    />
                    {day.image && (
                      <SmartImage src={day.image} alt={day.title} className="mt-3 aspect-video w-full max-w-md rounded-xl" />
                    )}
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {day.activities.map((a) => (
                        <span key={a} className="rounded-full bg-sand-100 px-3 py-1.5 text-xs font-medium text-ocean-950/70">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inclusions */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-sand-200 p-6">
              <h3 className="mb-3 font-display text-base font-extrabold text-ocean-950">What&apos;s included</h3>
              <ul className="space-y-2.5">
                {pkg.inclusions.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-ocean-950/80">
                    <Check size={16} className="mt-0.5 shrink-0 text-ocean-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-sand-200 p-6">
              <h3 className="mb-3 font-display text-base font-extrabold text-ocean-950">Not included</h3>
              <ul className="space-y-2.5">
                {pkg.exclusions.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-ocean-950/80">
                    <X size={16} className="mt-0.5 shrink-0 text-ocean-950/40" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Reviews */}
          <div id="reviews" className="scroll-mt-24">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="font-display text-2xl font-extrabold text-ocean-950">Reviews</h2>
              <span className="flex items-center gap-1.5 font-display text-lg font-extrabold text-ocean-950">
                <RatingStars rating={pkg.rating} size={16} /> {pkg.rating}
              </span>
              <span className="text-sm text-ocean-950/50">· {pkg.reviewsCount} reviews</span>
            </div>
            <div className="mb-5 flex flex-wrap items-center gap-6 rounded-2xl border border-sand-200 p-5">
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
            <StaggerGroup className="grid gap-4 sm:grid-cols-2">
              {pkg.reviews.map((r) => (
                <StaggerItem key={r.id} className="rounded-2xl border border-sand-200 p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sunset-50 font-display text-sm font-bold text-sunset-700">
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
                  {r.photo && (
                    <SmartImage src={r.photo} alt={`Photo from ${r.name}'s trip`} className="mt-3 h-40 w-full max-w-xs rounded-xl sm:h-32" />
                  )}
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>

          {/* Supplier */}
          {supplier && (
            <div className="rounded-2xl border border-sand-200 p-6">
              <h3 className="mb-4 font-display text-lg font-extrabold text-ocean-950">Sold &amp; operated by</h3>
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
                  <p className="text-sm text-ocean-950/60">
                    {supplier.location} · Partner since {supplier.since}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-sm text-ocean-950/70">
                    <span className="flex items-center gap-1">
                      <RatingStars rating={supplier.rating} size={13} /> {supplier.rating}
                    </span>
                    <span>{supplier.packagesCount} packages</span>
                    <span className="rounded-full bg-sand-100 px-2 py-0.5 text-xs font-medium capitalize">{supplier.type} partner</span>
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

          {/* FAQs */}
          {pkg.faqs.length > 0 && (
            <div>
              <h2 className="mb-4 font-display text-2xl font-extrabold text-ocean-950">Frequently asked questions</h2>
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
            </div>
          )}
        </div>

        {/* Booking Sidebar */}
        <div className="lg:sticky lg:top-20 lg:h-fit">
          <div className="rounded-2xl border border-sand-200 bg-surface p-6 shadow-card">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-xs text-ocean-950/50">Starting from</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl font-extrabold tracking-tight text-ocean-950">{formatPrice(pkg.price)}</span>
                  {discount > 0 && <span className="text-sm text-ocean-950/40 line-through">{formatPrice(pkg.originalPrice)}</span>}
                </div>
                <p className="text-xs text-ocean-950/50">per person</p>
              </div>
              {discount > 0 && <span className="rounded-full bg-sunset-500 px-2.5 py-1.5 text-xs font-bold text-white">{discount}% off</span>}
            </div>

            <p className="mb-2 text-xs font-bold text-ocean-950">Choose a date</p>
            <div className="mb-5 grid grid-cols-4 gap-2">
              {pkg.startDates.slice(0, 4).map((d) => {
                const dt = new Date(d)
                const active = selectedDate === d
                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDate(d)}
                    className={cn(
                      "flex flex-col items-center gap-0.5 rounded-xl py-2.5 text-xs font-bold transition-colors",
                      active ? "bg-sand-100 text-ocean-950 ring-2 ring-inset ring-ocean-950" : "bg-sand-50 text-ocean-950/70 ring-1 ring-inset ring-sand-200",
                    )}
                  >
                    <span>{dt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                    <span className="text-[10px] font-medium opacity-70">{dt.getFullYear()}</span>
                  </button>
                )
              })}
            </div>

            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ocean-950">
              <Users size={13} /> Travellers
            </label>
            <div className="mb-5 flex items-center justify-between rounded-xl border border-sand-200 px-3 py-2">
              <button
                onClick={() => setTravelers((t) => Math.max(1, t - 1))}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-sand-100 text-sm font-bold text-ocean-950"
              >
                −
              </button>
              <span className="text-sm font-semibold text-ocean-950">
                {travelers} {travelers === 1 ? "traveller" : "travellers"}
              </span>
              <button
                onClick={() => setTravelers((t) => Math.min(pkg.groupSizeMax, t + 1))}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-sand-100 text-sm font-bold text-ocean-950"
              >
                +
              </button>
            </div>

            <div className="mb-4 space-y-1.5 border-t border-sand-200 pt-4 text-sm">
              <div className="flex items-center justify-between text-ocean-950/60">
                <span>
                  {formatPrice(pkg.price)} × {travelers}
                </span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex items-center justify-between font-display text-lg font-extrabold text-ocean-950">
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <button
              onClick={handleBook}
              className="mb-2.5 w-full rounded-full bg-sunset-500 py-3.5 text-sm font-bold text-white transition-colors hover:bg-sunset-600"
            >
              Book now
            </button>
            <Link
              to="/build-trip"
              className="block w-full rounded-full border border-sand-200 py-3 text-center text-sm font-semibold text-ocean-950 hover:border-ocean-300"
            >
              Get a custom quote
            </Link>

            <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-sand-100 p-3.5 text-xs text-ocean-950/70">
              <ShieldCheck size={20} className="shrink-0 text-ocean-600" />
              <span>
                <strong className="text-ocean-950">Best-Price Guarantee.</strong> Found it cheaper? We&apos;ll match it.
              </span>
            </div>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex items-center justify-center gap-1.5 py-1 text-center text-xs font-semibold text-ocean-950/60 hover:text-ocean-700"
            >
              <MessageCircle size={13} /> Questions? Chat on WhatsApp
            </a>

            {pkg.flexible && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-ocean-950/50">
                <ShieldCheck size={13} className="text-ocean-500" /> Free cancellation up to 15 days before departure
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-14">
          <Reveal>
            <h2 className="mb-5 font-display text-2xl font-extrabold text-ocean-950">You might also like</h2>
          </Reveal>
          <StaggerGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <StaggerItem key={p.id}>
                <PackageCard pkg={p} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      )}

      {/* Mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-14 z-30 border-t border-sand-200 bg-surface p-3 shadow-lift sm:bottom-0 lg:hidden">
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

function Fact({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sand-100 text-ocean-950/70">
        <Icon size={18} />
      </span>
      <p className="text-sm font-semibold text-ocean-950">{label}</p>
    </div>
  )
}
