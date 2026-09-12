import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  BadgeCheck,
  Clock4,
  Compass,
  Headset,
  MapPinned,
  Percent,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react"
import { testimonials } from "../data"
import { useCatalog } from "../context/CatalogContext"
import { SearchWidget } from "../components/SearchWidget"
import { PackageCard } from "../components/PackageCard"
import { RatingStars } from "../components/RatingStars"
import { SmartImage } from "../components/SmartImage"
import { CountdownTimer } from "../components/CountdownTimer"
import { ParallaxHero } from "../components/ParallaxHero"
import { Reveal, StaggerGroup, StaggerItem } from "../components/Reveal"
import { cn, formatPrice } from "../lib/utils"

const categoryChips = ["All", "Beach", "Honeymoon", "Family", "Adventure", "Luxury", "Hill Station"] as const

const stats = [
  { label: "Happy Travellers", value: "42,000+" },
  { label: "Verified Suppliers", value: "200+" },
  { label: "Destinations", value: "60+" },
  { label: "Avg. Rating", value: "4.8 / 5" },
]

const steps = [
  {
    icon: Compass,
    title: "Explore & Compare",
    body: "Browse curated packages or build your own from 200+ verified suppliers, filtered exactly your way.",
  },
  {
    icon: Sparkles,
    title: "Customize Freely",
    body: "Tweak hotels, add activities, change duration — every trip flexes to fit your style and budget.",
  },
  {
    icon: Wallet,
    title: "Book Securely",
    body: "Transparent pricing, flexible payment options, and instant confirmation — no hidden surprises.",
  },
  {
    icon: MapPinned,
    title: "Travel & Enjoy",
    body: "24/7 support during your trip, with your full itinerary, tickets and contacts in one place.",
  },
]

const whyUs = [
  { icon: ShieldCheck, title: "Verified Suppliers Only", body: "Every partner — online or offline — is vetted for quality, licensing and real traveller reviews." },
  { icon: Percent, title: "Best Price Guarantee", body: "Find it cheaper elsewhere within 24 hours of booking and we'll match it, plus 5% off." },
  { icon: Headset, title: "24/7 Trip Support", body: "A real human is one tap away on WhatsApp or call, throughout your journey — not just before booking." },
  { icon: Clock4, title: "Free Flexible Dates", body: "Reschedule most bookings up to 15 days before departure at no extra cost." },
]

export default function Home() {
  const { packages, destinations, suppliers, deals } = useCatalog()
  const [activeCategory, setActiveCategory] = useState<(typeof categoryChips)[number]>("All")

  const featured = useMemo(() => {
    const base = packages.filter((p) => p.featured)
    if (activeCategory === "All") return base.slice(0, 8)
    return packages.filter((p) => p.category.includes(activeCategory)).slice(0, 8)
  }, [activeCategory, packages])

  const trending = destinations.filter((d) => d.rating >= 4.6).slice(0, 10)

  return (
    <div>
      <ParallaxHero
        image="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2000&q=80"
        imageAlt="Aerial view of a boat gliding over turquoise water"
        eyebrow="200+ verified suppliers · Book with confidence"
        heading={
          <>
            Your next holiday, <span className="text-accent-serif text-gold-400">exactly</span> the way you imagine
            it
          </>
        }
        subtext="Compare ready-made packages or build a fully custom itinerary — from beach escapes to mountain adventures, all in one flexible, transparent platform."
      />

      {/* SEARCH + TRUST */}
      <section className="relative -mt-1 bg-ocean-950 pb-16 pt-4 sm:pb-20">
        <Reveal className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SearchWidget />
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-medium text-white/50">Popular:</span>
            {["Bali", "Maldives", "Kerala", "Kashmir", "Dubai", "Swiss Alps"].map((d) => (
              <Link
                key={d}
                to={`/explore?q=${encodeURIComponent(d)}`}
                className="rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-white/80 transition-colors hover:border-sunset-400 hover:text-sunset-300"
              >
                {d}
              </Link>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-4 px-4 sm:grid-cols-4 sm:px-6 lg:px-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-2xl font-bold text-white sm:text-3xl">{s.value}</div>
              <div className="mt-1 text-xs text-white/50">{s.label}</div>
            </div>
          ))}
        </Reveal>

        <svg viewBox="0 0 1440 60" className="relative mt-14 block w-full text-sand-50" preserveAspectRatio="none" style={{ height: 40 }}>
          <path fill="currentColor" d="M0,32 C240,60 480,0 720,16 C960,32 1200,60 1440,24 L1440,60 L0,60 Z" />
        </svg>
      </section>

      {/* TRENDING DESTINATIONS */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Reveal className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-ocean-950 sm:text-3xl">Trending Destinations</h2>
            <p className="mt-1 text-sm text-ocean-950/60">Handpicked spots travellers are loving right now</p>
          </div>
          <Link to="/destinations" className="hidden shrink-0 text-sm font-semibold text-ocean-600 hover:text-ocean-700 sm:block">
            View all →
          </Link>
        </Reveal>
        <StaggerGroup className="-mx-4 flex snap-x-mandatory gap-4 overflow-x-auto px-4 pb-4 no-scrollbar sm:mx-0 sm:px-0">
          {trending.map((d) => (
            <StaggerItem key={d.id} className="w-64 shrink-0 snap-start sm:w-72">
              <Link to={`/destinations/${d.id}`} className="group relative block overflow-hidden rounded-2xl shadow-card">
                <SmartImage src={d.image} alt={d.name} className="aspect-[3/4] w-full" imgClassName="transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-white/80">
                    <RatingStars rating={d.rating} size={11} />
                    {d.rating}
                  </div>
                  <h3 className="font-display text-lg font-bold">{d.name}</h3>
                  <p className="text-xs text-white/70">{d.tagline}</p>
                  <p className="mt-2 text-xs font-semibold text-gold-300">From {formatPrice(d.fromPrice)}</p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
        <Link to="/destinations" className="mt-4 block text-center text-sm font-semibold text-ocean-600 sm:hidden">
          View all destinations →
        </Link>
      </section>

      {/* FEATURED PACKAGES */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-ocean-950 sm:text-3xl">Featured Packages</h2>
              <p className="mt-1 text-sm text-ocean-950/60">Curated favourites across styles and budgets</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {categoryChips.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors sm:text-sm",
                    activeCategory === c
                      ? "border-ocean-600 bg-ocean-600 text-white"
                      : "border-sand-200 text-ocean-950/70 hover:border-ocean-300",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </Reveal>

          <StaggerGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((pkg) => (
              <StaggerItem key={pkg.id}>
                <PackageCard pkg={pkg} />
              </StaggerItem>
            ))}
          </StaggerGroup>

          <Reveal className="mt-8 text-center">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 rounded-full border-2 border-ocean-600 px-6 py-3 text-sm font-semibold text-ocean-700 transition-colors hover:bg-ocean-600 hover:text-white"
            >
              Explore all {packages.length}+ packages
            </Link>
          </Reveal>
        </div>
      </section>

      {/* BUILD YOUR TRIP CTA */}
      <Reveal as="section" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sunset-500 to-sunset-700 p-8 sm:p-12">
          <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-16 left-10 h-56 w-56 rounded-full bg-ocean-950/20 blur-2xl" />
          <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                <Sparkles size={13} /> New — Trip Builder
              </span>
              <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
                Can't find the perfect package? Build your own.
              </h2>
              <p className="mt-2 text-sm text-white/85 sm:text-base">
                Pick destinations, set your pace, add the activities you love, and get a live price estimate —
                then let our experts turn it into a real itinerary.
              </p>
            </div>
            <Link
              to="/build-trip"
              className="shrink-0 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-sunset-600 shadow-lg transition-transform hover:scale-105"
            >
              Start Building →
            </Link>
          </div>
        </div>
      </Reveal>

      {/* DEALS */}
      <section className="bg-ocean-950 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Limited-Time Deals</h2>
              <p className="mt-1 text-sm text-white/60">Grab these before the clock runs out</p>
            </div>
            <Link to="/deals" className="hidden text-sm font-semibold text-gold-400 hover:text-gold-300 sm:block">
              All deals →
            </Link>
          </Reveal>
          <StaggerGroup className="grid gap-5 sm:grid-cols-3">
            {deals.map((deal) => {
              const pkg = packages.find((p) => p.id === deal.packageId)
              if (!pkg) return null
              return (
                <StaggerItem key={deal.id} className="overflow-hidden rounded-2xl border border-white/10 bg-ocean-900/60">
                  <div className="relative">
                    <SmartImage src={deal.image} alt={deal.title} className="aspect-video w-full" />
                    <span className="absolute left-3 top-3 rounded-full bg-sunset-500 px-2.5 py-1 text-xs font-bold text-white">
                      {deal.discountPercent}% OFF
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-lg font-bold text-white">{deal.title}</h3>
                    <p className="mt-0.5 text-xs text-white/60">{deal.subtitle}</p>
                    <CountdownTimer target={deal.expiresAt} className="my-3" />
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-white/50">
                        Code: <span className="font-mono font-bold text-gold-400">{deal.code}</span>
                      </div>
                      <Link to={`/package/${pkg.slug}`} className="text-xs font-semibold text-white underline underline-offset-2">
                        View deal →
                      </Link>
                    </div>
                  </div>
                </StaggerItem>
              )
            })}
          </StaggerGroup>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal className="mb-10 text-center">
          <h2 className="font-display text-2xl font-bold text-ocean-950 sm:text-3xl">How Roamly Works</h2>
          <p className="mt-2 text-sm text-ocean-950/60">Four simple steps from inspiration to landing at your destination</p>
        </Reveal>
        <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <StaggerItem key={step.title} className="relative rounded-2xl border border-sand-200 bg-white p-6">
              <span className="absolute right-5 top-5 font-display text-3xl font-bold text-sand-200">0{i + 1}</span>
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-ocean-50 text-ocean-600">
                <step.icon size={20} />
              </span>
              <h3 className="mb-1.5 font-display text-lg font-bold text-ocean-950">{step.title}</h3>
              <p className="text-sm text-ocean-950/60">{step.body}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* WHY US */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-10 text-center">
            <h2 className="font-display text-2xl font-bold text-ocean-950 sm:text-3xl">Why Travellers Choose Roamly</h2>
          </Reveal>
          <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyUs.map((item) => (
              <StaggerItem key={item.title} className="text-center">
                <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sunset-50 text-sunset-500">
                  <item.icon size={24} />
                </span>
                <h3 className="mb-1.5 font-display text-base font-bold text-ocean-950">{item.title}</h3>
                <p className="text-sm text-ocean-950/60">{item.body}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* SUPPLIER NETWORK */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-ocean-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-ocean-700">
              Our Network
            </span>
            <h2 className="font-display text-2xl font-bold text-ocean-950 sm:text-3xl">
              Powered by 200+ verified online & offline suppliers
            </h2>
            <p className="mt-3 text-sm text-ocean-950/60 sm:text-base">
              From boutique local travel agencies who know every hidden trail, to established online operators
              covering the globe — every supplier on Roamly is vetted, rated, and held to the same quality bar.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {suppliers.slice(0, 6).map((s) => (
                <div key={s.id} className="flex items-center gap-2.5 rounded-xl border border-sand-200 p-3">
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-display text-sm font-bold text-white",
                      s.color === "ocean" && "bg-ocean-600",
                      s.color === "sunset" && "bg-sunset-500",
                      s.color === "gold" && "bg-gold-500",
                    )}
                  >
                    {s.logoInitial}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-ocean-950">{s.name}</p>
                    <p className="flex items-center gap-1 text-[11px] text-ocean-950/50">
                      {s.verified && <BadgeCheck size={11} className="text-ocean-500" />}
                      {s.type === "online" ? "Online partner" : "Offline agency"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/suppliers"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ocean-700 hover:text-ocean-800"
            >
              Meet our supplier network →
            </Link>
          </Reveal>
          <Reveal delay={0.1} className="relative">
            <div className="grid grid-cols-2 gap-4">
              <SmartImage
                src="https://images.unsplash.com/photo-1600298881974-6be191ceeda1?auto=format&fit=crop&w=600&q=80"
                alt="Tea estate guide"
                className="aspect-square rounded-2xl"
              />
              <SmartImage
                src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80"
                alt="Local expert"
                className="mt-8 aspect-square rounded-2xl"
              />
              <SmartImage
                src="https://images.unsplash.com/photo-1521401830884-6c03c1c87ebb?auto=format&fit=crop&w=600&q=80"
                alt="Travel planning"
                className="aspect-square rounded-2xl"
              />
              <SmartImage
                src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80"
                alt="Happy travellers"
                className="mt-8 aspect-square rounded-2xl"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-sand-100 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-10 text-center">
            <h2 className="font-display text-2xl font-bold text-ocean-950 sm:text-3xl">Loved by Thousands of Travellers</h2>
          </Reveal>
          <StaggerGroup className="-mx-4 flex snap-x-mandatory gap-5 overflow-x-auto px-4 pb-4 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 sm:pb-0 lg:grid-cols-4">
            {testimonials.map((t) => (
              <StaggerItem key={t.id} className="w-80 shrink-0 snap-start rounded-2xl bg-white p-5 shadow-card sm:w-auto">
                <RatingStars rating={t.rating} />
                <p className="mt-3 text-sm text-ocean-950/80">"{t.quote}"</p>
                <div className="mt-4 flex items-center gap-3">
                  <SmartImage src={t.image} alt={t.name} className="h-10 w-10 rounded-full" />
                  <div>
                    <p className="text-sm font-semibold text-ocean-950">{t.name}</p>
                    <p className="text-xs text-ocean-950/50">
                      {t.location} · {t.tripName}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* FINAL CTA */}
      <Reveal as="section" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-ocean-950 px-6 py-12 text-center sm:px-12">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Ready to plan your next escape?</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-white/60 sm:text-base">
            Talk to a trip expert or start exploring — either way, your perfect holiday is a few clicks away.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/explore" className="rounded-full bg-sunset-500 px-6 py-3 text-sm font-bold text-white hover:bg-sunset-600">
              Browse Packages
            </Link>
            <Link to="/contact" className="rounded-full border border-white/25 px-6 py-3 text-sm font-bold text-white hover:bg-white/10">
              Talk to an Expert
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  )
}
