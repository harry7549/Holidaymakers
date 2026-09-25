import { Fragment, useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import {
  Compass,
  Heart,
  LayoutGrid,
  LifeBuoy,
  List,
  MessageCircle,
  Mountain,
  Palmtree,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tent,
  Users,
  X,
  type LucideIcon,
} from "lucide-react"
import type { Category } from "../data/types"
import { useCatalog } from "../context/CatalogContext"
import { PackageCard } from "../components/PackageCard"
import { Reveal, StaggerGroup, StaggerItem } from "../components/Reveal"
import { Seo } from "../components/Seo"
import { cn, discountPercent } from "../lib/utils"

const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  Beach: Palmtree,
  Adventure: Mountain,
  Honeymoon: Heart,
  Family: Users,
  "Hill Station": Mountain,
  Wildlife: Tent,
  Pilgrimage: Star,
  Luxury: Sparkles,
  Cruise: LifeBuoy,
  International: Compass,
}

const allCategories: Category[] = [
  "Beach",
  "Honeymoon",
  "Adventure",
  "Hill Station",
  "Family",
  "Wildlife",
  "Pilgrimage",
  "Luxury",
  "Cruise",
  "International",
]

const durationOptions = [
  { label: "Any", value: "any" },
  { label: "Up to 5 days", value: "0-5" },
  { label: "6–7 days", value: "6-7" },
  { label: "8+ days", value: "8-999" },
]

const ratingOptions = [
  { label: "Any", value: "0" },
  { label: "4.5+", value: "4.5" },
  { label: "4.8+", value: "4.8" },
]

const sortOptions = [
  { label: "Most popular", value: "popular" },
  { label: "Price: low to high", value: "price-asc" },
  { label: "Price: high to low", value: "price-desc" },
  { label: "Biggest discount", value: "discount" },
  { label: "Top rated", value: "rating" },
]

const PAGE_SIZE = 9
const PROMO_SLOT = 5

function monthKey(dateStr: string) {
  return dateStr.slice(0, 7)
}

function monthLabel(ym: string) {
  const [y, m] = ym.split("-").map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
}

export default function Explore() {
  const { packages } = useCatalog()
  const [searchParams, setSearchParams] = useSearchParams()
  const [view, setView] = useState<"grid" | "list">("grid")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const q = searchParams.get("q") ?? ""
  const sort = searchParams.get("sort") ?? "popular"
  const duration = searchParams.get("duration") ?? "any"
  const region = searchParams.get("region") ?? "all"
  const month = searchParams.get("month") ?? "any"
  const minRating = Number(searchParams.get("rating") ?? 0)
  const activeCategories = searchParams.getAll("category") as Category[]

  const priceBounds = useMemo(() => {
    if (packages.length === 0) return { min: 0, max: 150000 }
    const prices = packages.map((p) => p.price)
    return { min: Math.min(...prices), max: Math.max(...prices) }
  }, [packages])

  const minPrice = Number(searchParams.get("minPrice") ?? priceBounds.min)
  const maxPrice = Number(searchParams.get("maxPrice") ?? priceBounds.max)

  const availableMonths = useMemo(() => {
    const set = new Set<string>()
    packages.forEach((p) => p.startDates.forEach((d) => set.add(monthKey(d))))
    return Array.from(set).sort().slice(0, 6)
  }, [packages])

  const priceHistogram = useMemo(() => {
    const buckets = 10
    const span = Math.max(1, priceBounds.max - priceBounds.min)
    const counts = new Array(buckets).fill(0)
    packages.forEach((p) => {
      const idx = Math.min(buckets - 1, Math.floor(((p.price - priceBounds.min) / span) * buckets))
      counts[idx]++
    })
    const maxCount = Math.max(1, ...counts)
    return counts.map((c, i) => ({
      pct: (c / maxCount) * 100,
      active: i >= Math.floor(((minPrice - priceBounds.min) / span) * buckets) && i <= Math.floor(((maxPrice - priceBounds.min) / span) * buckets),
    }))
  }, [packages, priceBounds, minPrice, maxPrice])

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams)
    if (value === null || value === "") next.delete(key)
    else next.set(key, value)
    setSearchParams(next, { replace: true })
  }

  const toggleMultiParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    const current = next.getAll(key)
    next.delete(key)
    if (current.includes(value)) {
      current.filter((v) => v !== value).forEach((v) => next.append(key, v))
    } else {
      ;[...current, value].forEach((v) => next.append(key, v))
    }
    setSearchParams(next, { replace: true })
  }

  const setSingleCategory = (c: Category | null) => {
    const next = new URLSearchParams(searchParams)
    next.delete("category")
    if (c) next.append("category", c)
    setSearchParams(next, { replace: true })
  }

  const clearFilters = () => setSearchParams(new URLSearchParams(q ? { q } : {}), { replace: true })

  const results = useMemo(() => {
    let list = packages.filter((p) => {
      if (q) {
        const term = q.toLowerCase()
        const haystack = `${p.title} ${p.destinationName} ${p.country} ${p.tags.join(" ")}`.toLowerCase()
        if (!haystack.includes(term)) return false
      }
      if (activeCategories.length && !activeCategories.some((c) => p.category.includes(c))) return false
      if (region === "domestic" && p.region !== "Domestic") return false
      if (region === "international" && p.region !== "International") return false
      if (p.price < minPrice || p.price > maxPrice) return false
      if (minRating && p.rating < minRating) return false
      if (duration !== "any") {
        const [min, max] = duration.split("-").map(Number)
        if (p.days < min || p.days > max) return false
      }
      if (month !== "any" && !p.startDates.some((d) => monthKey(d) === month)) return false
      return true
    })

    switch (sort) {
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price)
        break
      case "rating":
        list = [...list].sort((a, b) => b.rating - a.rating)
        break
      case "discount":
        list = [...list].sort((a, b) => discountPercent(b.price, b.originalPrice) - discountPercent(a.price, a.originalPrice))
        break
      default:
        list = [...list].sort((a, b) => Number(b.trending) - Number(a.trending) || Number(b.bestSeller) - Number(a.bestSeller))
    }
    return list
  }, [q, activeCategories, region, minPrice, maxPrice, minRating, duration, month, sort, packages])

  // A filter change should show the first page again, not whatever was scrolled to before.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [q, activeCategories, region, minPrice, maxPrice, minRating, duration, month, sort])

  const activeFilterCount =
    activeCategories.length +
    (minRating ? 1 : 0) +
    (duration !== "any" ? 1 : 0) +
    (region !== "all" ? 1 : 0) +
    (month !== "any" ? 1 : 0) +
    (minPrice > priceBounds.min || maxPrice < priceBounds.max ? 1 : 0)

  const visible = results.slice(0, visibleCount)

  const FilterPanel = (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between pb-3">
        <h3 className="font-display text-xl font-extrabold text-ocean-950">Filters</h3>
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="text-xs font-bold text-ocean-950/60 underline underline-offset-2 hover:text-sunset-600">
            Reset
          </button>
        )}
      </div>

      <div className="border-t border-sand-200 py-5">
        <p className="mb-3 text-sm font-extrabold text-ocean-950">Where</p>
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-sand-100 p-1">
          {[
            { label: "All", value: "all" },
            { label: "India", value: "domestic" },
            { label: "International", value: "international" },
          ].map((o) => (
            <button
              key={o.value}
              onClick={() => updateParam("region", o.value === "all" ? null : o.value)}
              className={cn(
                "rounded-lg py-2 text-xs font-bold transition-colors",
                region === o.value ? "bg-surface text-ocean-950 shadow-sm" : "text-ocean-950/50",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-sand-200 py-5">
        <p className="mb-3 text-sm font-extrabold text-ocean-950">Budget per person</p>
        <div className="flex h-12 items-end gap-[3px]">
          {priceHistogram.map((b, i) => (
            <span
              key={i}
              className={cn("flex-1 rounded-t-sm", b.active ? "bg-ocean-950" : "bg-sand-200")}
              style={{ height: `${Math.max(8, b.pct)}%` }}
            />
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <label className="flex-1 rounded-xl border border-sand-200 px-3 py-2">
            <span className="block text-[11px] font-bold text-ocean-950/50">Min</span>
            <input
              type="number"
              value={minPrice}
              min={priceBounds.min}
              max={maxPrice}
              step={1000}
              onChange={(e) => updateParam("minPrice", e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-ocean-950 outline-none"
            />
          </label>
          <span className="text-ocean-950/30">–</span>
          <label className="flex-1 rounded-xl border border-sand-200 px-3 py-2">
            <span className="block text-[11px] font-bold text-ocean-950/50">Max</span>
            <input
              type="number"
              value={maxPrice}
              min={minPrice}
              max={priceBounds.max}
              step={1000}
              onChange={(e) => updateParam("maxPrice", e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-ocean-950 outline-none"
            />
          </label>
        </div>
      </div>

      <div className="border-t border-sand-200 py-5">
        <p className="mb-3 text-sm font-extrabold text-ocean-950">Duration</p>
        <div className="flex flex-wrap gap-2">
          {durationOptions.map((d) => (
            <button
              key={d.value}
              onClick={() => updateParam("duration", d.value === "any" ? null : d.value)}
              className={cn(
                "rounded-full px-3.5 py-2 text-xs font-semibold transition-colors",
                duration === d.value ? "bg-ocean-950 text-white" : "bg-surface text-ocean-950 ring-1 ring-inset ring-sand-200",
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {availableMonths.length > 0 && (
        <div className="border-t border-sand-200 py-5">
          <p className="mb-3 text-sm font-extrabold text-ocean-950">Departure month</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateParam("month", null)}
              className={cn(
                "rounded-full px-3.5 py-2 text-xs font-semibold transition-colors",
                month === "any" ? "bg-ocean-950 text-white" : "bg-surface text-ocean-950 ring-1 ring-inset ring-sand-200",
              )}
            >
              Any
            </button>
            {availableMonths.map((m) => (
              <button
                key={m}
                onClick={() => updateParam("month", m)}
                className={cn(
                  "rounded-full px-3.5 py-2 text-xs font-semibold transition-colors",
                  month === m ? "bg-ocean-950 text-white" : "bg-surface text-ocean-950 ring-1 ring-inset ring-sand-200",
                )}
              >
                {monthLabel(m)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-sand-200 py-5">
        <p className="mb-3 text-sm font-extrabold text-ocean-950">Guest rating</p>
        <div className="flex flex-col gap-2.5">
          {ratingOptions.map((r) => (
            <label key={r.value} className="flex cursor-pointer items-center gap-3 text-sm text-ocean-950/80">
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-1 ring-inset",
                  minRating === Number(r.value) ? "bg-ocean-950 ring-ocean-950" : "ring-sand-300",
                )}
              >
                {minRating === Number(r.value) && <span className="h-2 w-2 rounded-full bg-white" />}
              </span>
              <input type="radio" name="rating" className="sr-only" checked={minRating === Number(r.value)} onChange={() => updateParam("rating", r.value === "0" ? null : r.value)} />
              {r.value === "0" ? (
                "Any"
              ) : (
                <span className="flex items-center gap-1">
                  {r.label} <Star size={13} className="fill-gold-400 text-gold-400" />
                </span>
              )}
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-sand-200 pt-5">
        <p className="mb-3 text-sm font-extrabold text-ocean-950">Trip type</p>
        <div className="flex flex-col gap-2.5">
          {allCategories.map((c) => (
            <label key={c} className="flex cursor-pointer items-center gap-3 text-sm text-ocean-950/80">
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-md ring-1 ring-inset",
                  activeCategories.includes(c) ? "bg-ocean-950 ring-ocean-950 text-white" : "ring-sand-300",
                )}
              >
                {activeCategories.includes(c) && <X size={12} className="rotate-45" strokeWidth={3} />}
              </span>
              <input
                type="checkbox"
                className="sr-only"
                checked={activeCategories.includes(c)}
                onChange={() => toggleMultiParam("category", c)}
              />
              {c}
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  const promo = (
    <div className="flex h-full flex-col justify-between gap-4 rounded-2xl bg-sunset-500 p-6 text-white">
      <div className="flex flex-col gap-2">
        <h3 className="font-display text-2xl font-extrabold leading-tight">Can&apos;t decide? We&apos;ll build it for you</h3>
        <p className="text-sm text-white/90">Share your budget and dates. Get a custom itinerary and quote.</p>
      </div>
      <Link to="/build-trip" className="rounded-full bg-white px-5 py-2.5 text-center text-sm font-bold text-ocean-950">
        Build a Trip
      </Link>
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Seo page="explore" />
      <Reveal className="mb-2 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold text-ocean-950/50">
            <Link to="/" className="hover:text-ocean-700">
              Home
            </Link>{" "}
            › Explore
          </p>
          <h1 className="font-display text-3xl font-extrabold text-ocean-950 sm:text-4xl">
            {q ? `Packages for "${q}"` : "Explore packages"}
          </h1>
        </div>
        <div className="flex w-full items-center gap-2 rounded-full border border-sand-200 bg-surface px-4 py-2.5 shadow-card sm:w-96">
          <Search size={17} className="shrink-0 text-ocean-950/40" />
          <input
            value={q}
            onChange={(e) => updateParam("q", e.target.value)}
            placeholder="Search Bali, Kerala, Japan…"
            className="w-full bg-transparent text-sm text-ocean-950 outline-none placeholder:text-ocean-950/35"
          />
        </div>
      </Reveal>

      <div className="my-6 flex gap-6 overflow-x-auto border-b border-sand-200 pb-px no-scrollbar">
        {[{ label: "All", value: null as Category | null, icon: Compass }, ...allCategories.map((c) => ({ label: c, value: c, icon: CATEGORY_ICONS[c] }))].map(
          (t) => {
            const isActive = t.value === null ? activeCategories.length === 0 : activeCategories.length === 1 && activeCategories[0] === t.value
            return (
              <button
                key={t.label}
                onClick={() => setSingleCategory(t.value)}
                className={cn(
                  "flex shrink-0 flex-col items-center gap-1.5 border-b-2 px-1 pb-3 text-xs font-semibold transition-colors",
                  isActive ? "border-ocean-950 text-ocean-950" : "border-transparent text-ocean-950/45 hover:text-ocean-950/70",
                )}
              >
                <t.icon size={22} />
                {t.label}
              </button>
            )
          },
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-2xl border border-sand-200 bg-surface p-5">{FilterPanel}</div>
        </aside>

        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <button
                onClick={() => setFiltersOpen(true)}
                className="flex items-center gap-2 rounded-full border border-sand-200 px-4 py-2 text-sm font-semibold text-ocean-950 lg:hidden"
              >
                <SlidersHorizontal size={15} />
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
              <p className="hidden text-sm text-ocean-950/60 lg:block">
                <span className="font-bold text-ocean-950">{results.length}</span> trips · prices are per person
              </p>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <select
                value={sort}
                onChange={(e) => updateParam("sort", e.target.value)}
                className="rounded-full border border-sand-200 bg-surface px-3 py-2 text-sm font-medium text-ocean-950 outline-none"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    Sort: {o.label}
                  </option>
                ))}
              </select>
              <div className="hidden items-center gap-1 rounded-full border border-sand-200 p-1 sm:flex">
                <button
                  onClick={() => setView("grid")}
                  aria-label="Grid view"
                  className={cn("rounded-full p-1.5", view === "grid" ? "bg-ocean-950 text-white" : "text-ocean-950/50")}
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => setView("list")}
                  aria-label="List view"
                  className={cn("rounded-full p-1.5", view === "list" ? "bg-ocean-950 text-white" : "text-ocean-950/50")}
                >
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-sand-300 py-20 text-center">
              <p className="font-display text-lg font-bold text-ocean-950">No packages match your filters</p>
              <p className="mt-1 text-sm text-ocean-950/60">Try widening the budget or clearing some filters</p>
              <button onClick={clearFilters} className="mt-4 rounded-full bg-ocean-950 px-5 py-2 text-sm font-semibold text-white">
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <StaggerGroup className={cn("grid gap-5", view === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1")}>
                {visible.map((pkg, i) => (
                  <Fragment key={pkg.id}>
                    <StaggerItem>
                      <PackageCard pkg={pkg} layout={view} />
                    </StaggerItem>
                    {view === "grid" && i === PROMO_SLOT && <StaggerItem key="promo">{promo}</StaggerItem>}
                  </Fragment>
                ))}
              </StaggerGroup>

              {visibleCount < results.length && (
                <div className="mt-10 flex flex-col items-center gap-3">
                  <div className="h-1 w-60 overflow-hidden rounded-full bg-sand-200">
                    <div className="h-full bg-ocean-950" style={{ width: `${(visible.length / results.length) * 100}%` }} />
                  </div>
                  <p className="text-sm text-ocean-950/50">
                    Showing {visible.length} of {results.length} trips
                  </p>
                  <button
                    onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                    className="rounded-full border border-sand-200 px-6 py-3 text-sm font-bold text-ocean-950 hover:border-ocean-300"
                  >
                    Show more trips
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ocean-950/40" onClick={() => setFiltersOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-[88%] max-w-sm overflow-y-auto bg-surface p-5 pt-14">
            <button onClick={() => setFiltersOpen(false)} aria-label="Close filters" className="absolute right-5 top-5 text-ocean-950/60">
              <X size={20} />
            </button>
            {FilterPanel}
            <button
              onClick={() => setFiltersOpen(false)}
              className="sticky bottom-0 mt-6 w-full rounded-full bg-ocean-950 py-3.5 text-sm font-bold text-white"
            >
              Show {results.length} results
            </button>
          </div>
        </div>
      )}

      <div className="mt-14 flex items-center gap-3 rounded-2xl bg-sand-100 px-5 py-4 text-sm text-ocean-950/70">
        <MessageCircle size={18} className="shrink-0 text-ocean-950/50" />
        Can&apos;t find the right trip? <span className="font-semibold text-ocean-950">WhatsApp us</span> and we&apos;ll help you find one.
      </div>
    </div>
  )
}
