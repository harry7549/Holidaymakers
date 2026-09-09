import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { LayoutGrid, List, SlidersHorizontal, X } from "lucide-react"
import { packages, destinations } from "../data"
import type { Category } from "../data/types"
import { PackageCard } from "../components/PackageCard"
import { cn, formatPrice } from "../lib/utils"

const allCategories: Category[] = [
  "Beach",
  "Adventure",
  "Honeymoon",
  "Family",
  "Hill Station",
  "Wildlife",
  "Pilgrimage",
  "Luxury",
  "Cruise",
  "International",
]

const durationOptions = [
  { label: "Any duration", value: "any" },
  { label: "Up to 3 nights", value: "0-3" },
  { label: "4 – 6 nights", value: "4-6" },
  { label: "7+ nights", value: "7-99" },
]

const sortOptions = [
  { label: "Most Popular", value: "popular" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Highest Rated", value: "rating" },
]

const MAX_PRICE = 140000

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [view, setView] = useState<"grid" | "list">("grid")
  const [filtersOpen, setFiltersOpen] = useState(false)

  const q = searchParams.get("q") ?? ""
  const sort = searchParams.get("sort") ?? "popular"
  const duration = searchParams.get("duration") ?? "any"
  const minRating = Number(searchParams.get("rating") ?? 0)
  const priceMax = Number(searchParams.get("priceMax") ?? MAX_PRICE)
  const activeCategories = searchParams.getAll("category")
  const activeDestinations = searchParams.getAll("destination")

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

  const clearFilters = () => setSearchParams(new URLSearchParams(), { replace: true })

  const results = useMemo(() => {
    let list = packages.filter((p) => {
      if (q) {
        const term = q.toLowerCase()
        const haystack = `${p.title} ${p.destinationName} ${p.country} ${p.tags.join(" ")}`.toLowerCase()
        if (!haystack.includes(term)) return false
      }
      if (activeCategories.length && !activeCategories.some((c) => p.category.includes(c as Category))) return false
      if (activeDestinations.length && !activeDestinations.includes(p.destinationId)) return false
      if (p.price > priceMax) return false
      if (minRating && p.rating < minRating) return false
      if (duration !== "any") {
        const [min, max] = duration.split("-").map(Number)
        if (p.nights < min || p.nights > max) return false
      }
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
      default:
        list = [...list].sort((a, b) => Number(b.trending) - Number(a.trending) || Number(b.bestSeller) - Number(a.bestSeller))
    }
    return list
  }, [q, activeCategories, activeDestinations, priceMax, minRating, duration, sort])

  const activeFilterCount =
    activeCategories.length + activeDestinations.length + (minRating ? 1 : 0) + (duration !== "any" ? 1 : 0) + (priceMax < MAX_PRICE ? 1 : 0)

  const FilterPanel = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-ocean-950">Filters</h3>
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="text-xs font-semibold text-sunset-600 hover:underline">
            Clear all
          </button>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-ocean-950">Category</p>
        <div className="flex flex-wrap gap-2">
          {allCategories.map((c) => (
            <button
              key={c}
              onClick={() => toggleMultiParam("category", c)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                activeCategories.includes(c)
                  ? "border-ocean-600 bg-ocean-600 text-white"
                  : "border-sand-200 text-ocean-950/70 hover:border-ocean-300",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-ocean-950">Max Price: {formatPrice(priceMax)}</p>
        <input
          type="range"
          min={10000}
          max={MAX_PRICE}
          step={5000}
          value={priceMax}
          onChange={(e) => updateParam("priceMax", e.target.value)}
          className="w-full accent-ocean-600"
        />
        <div className="mt-1 flex justify-between text-[11px] text-ocean-950/40">
          <span>{formatPrice(10000)}</span>
          <span>{formatPrice(MAX_PRICE)}+</span>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-ocean-950">Trip Duration</p>
        <div className="space-y-1.5">
          {durationOptions.map((d) => (
            <label key={d.value} className="flex cursor-pointer items-center gap-2 text-sm text-ocean-950/80">
              <input
                type="radio"
                name="duration"
                checked={duration === d.value}
                onChange={() => updateParam("duration", d.value === "any" ? null : d.value)}
                className="accent-ocean-600"
              />
              {d.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-ocean-950">Minimum Rating</p>
        <div className="flex gap-2">
          {[0, 4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => updateParam("rating", r === 0 ? null : String(r))}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                minRating === r ? "border-ocean-600 bg-ocean-600 text-white" : "border-sand-200 text-ocean-950/70",
              )}
            >
              {r === 0 ? "Any" : `${r}+ ★`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-ocean-950">Destination</p>
        <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
          {destinations.map((d) => (
            <label key={d.id} className="flex cursor-pointer items-center gap-2 text-sm text-ocean-950/80">
              <input
                type="checkbox"
                checked={activeDestinations.includes(d.id)}
                onChange={() => toggleMultiParam("destination", d.id)}
                className="accent-ocean-600"
              />
              {d.name}
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ocean-950 sm:text-3xl">
          {q ? `Packages for "${q}"` : "Explore All Packages"}
        </h1>
        <p className="mt-1 text-sm text-ocean-950/60">{results.length} packages found</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-2xl border border-sand-200 bg-white p-5">{FilterPanel}</div>
        </aside>

        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-2 rounded-full border border-sand-200 px-4 py-2 text-sm font-semibold text-ocean-950 lg:hidden"
            >
              <SlidersHorizontal size={15} />
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>

            <div className="ml-auto flex items-center gap-3">
              <select
                value={sort}
                onChange={(e) => updateParam("sort", e.target.value)}
                className="rounded-full border border-sand-200 bg-white px-3 py-2 text-sm font-medium text-ocean-950 outline-none"
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
                  className={cn("rounded-full p-1.5", view === "grid" ? "bg-ocean-600 text-white" : "text-ocean-950/50")}
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={cn("rounded-full p-1.5", view === "list" ? "bg-ocean-600 text-white" : "text-ocean-950/50")}
                >
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-sand-300 py-20 text-center">
              <p className="font-display text-lg font-bold text-ocean-950">No packages match your filters</p>
              <p className="mt-1 text-sm text-ocean-950/60">Try adjusting price range or clearing some filters</p>
              <button onClick={clearFilters} className="mt-4 rounded-full bg-ocean-600 px-5 py-2 text-sm font-semibold text-white">
                Clear filters
              </button>
            </div>
          ) : (
            <div className={cn("grid gap-5", view === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1")}>
              {results.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} layout={view} />
              ))}
            </div>
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-[85%] max-w-sm overflow-y-auto bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-lg font-bold text-ocean-950">Filters</span>
              <button onClick={() => setFiltersOpen(false)}>
                <X size={20} />
              </button>
            </div>
            {FilterPanel}
            <button
              onClick={() => setFiltersOpen(false)}
              className="mt-6 w-full rounded-full bg-ocean-600 py-3 text-sm font-bold text-white"
            >
              Show {results.length} results
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
