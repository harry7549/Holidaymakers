import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { LayoutGrid, Map as MapIcon, Search, Star } from "lucide-react"
import { useCatalog } from "../context/CatalogContext"
import { SmartImage } from "../components/SmartImage"
import { DestinationsMap } from "../components/DestinationsMap"
import { Reveal, StaggerGroup, StaggerItem } from "../components/Reveal"
import { formatPrice, cn } from "../lib/utils"

const regions = ["All", "Domestic", "International"] as const
const views = ["grid", "map"] as const

export default function Destinations() {
  const { destinations } = useCatalog()
  const [query, setQuery] = useState("")
  const [region, setRegion] = useState<(typeof regions)[number]>("All")
  const [view, setView] = useState<(typeof views)[number]>("grid")

  const filtered = useMemo(() => {
    return destinations.filter((d) => {
      if (region !== "All" && d.region !== region) return false
      if (query && !`${d.name} ${d.country}`.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
  }, [query, region, destinations])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Reveal className="mb-8 text-center">
        <h1 className="font-display text-2xl font-bold text-ocean-950 sm:text-3xl">Explore Destinations</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-ocean-950/60">
          From tropical islands to ancient forts — discover where your next holiday could take you.
        </p>
      </Reveal>

      <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ocean-950/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search destination or country"
            className="w-full rounded-full border border-sand-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-ocean-400"
          />
        </div>
        <div className="flex gap-2">
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                region === r ? "border-ocean-600 bg-ocean-600 text-white" : "border-sand-200 text-ocean-950/70",
              )}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="flex gap-1 rounded-full border border-sand-200 p-1">
          <button
            onClick={() => setView("grid")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
              view === "grid" ? "bg-ocean-600 text-white" : "text-ocean-950/60",
            )}
          >
            <LayoutGrid size={14} /> Grid
          </button>
          <button
            onClick={() => setView("map")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
              view === "map" ? "bg-ocean-600 text-white" : "text-ocean-950/60",
            )}
          >
            <MapIcon size={14} /> Map
          </button>
        </div>
      </div>

      {view === "map" && <DestinationsMap destinations={filtered} />}

      {view === "grid" && (
      <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((d) => (
          <StaggerItem key={d.id}>
          <Link to={`/destinations/${d.id}`} className="group block overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-card transition-shadow hover:shadow-lift">
            <div className="relative">
              <SmartImage src={d.image} alt={d.name} className="aspect-[4/3] w-full" imgClassName="transition-transform duration-500 group-hover:scale-110" />
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-ocean-950 backdrop-blur">
                {d.region}
              </span>
            </div>
            <div className="p-4">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-ocean-950">{d.name}</h3>
                <span className="flex items-center gap-1 text-xs font-semibold text-ocean-950/70">
                  <Star size={13} className="fill-gold-400 text-gold-400" /> {d.rating}
                </span>
              </div>
              <p className="mb-2 text-xs text-ocean-950/50">{d.country}</p>
              <p className="mb-3 text-sm text-ocean-950/70">{d.tagline}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-ocean-950/50">{d.packageCount} packages · Best: {d.bestMonths}</span>
              </div>
              <p className="mt-2 font-display text-base font-bold text-ocean-950">From {formatPrice(d.fromPrice)}</p>
            </div>
          </Link>
          </StaggerItem>
        ))}
      </StaggerGroup>
      )}
    </div>
  )
}
