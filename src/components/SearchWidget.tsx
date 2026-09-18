import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Calendar, Loader2, MapPin, Search, Users } from "lucide-react"
import { useCatalog } from "../context/CatalogContext"
import { cn } from "../lib/utils"

const SEARCH_PROGRESS_MS = 700

export function SearchWidget({ className }: { className?: string }) {
  const navigate = useNavigate()
  const { destinations } = useCatalog()
  const [query, setQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [travelers, setTravelers] = useState(2)
  const [date, setDate] = useState("")
  const [searching, setSearching] = useState(false)

  const suggestions = useMemo(() => {
    if (!query.trim()) return destinations.slice(0, 6)
    const q = query.toLowerCase()
    return destinations.filter((d) => d.name.toLowerCase().includes(q) || d.country.toLowerCase().includes(q)).slice(0, 6)
  }, [query, destinations])

  const submit = (destinationName?: string) => {
    if (searching) return
    const params = new URLSearchParams()
    const term = destinationName ?? query
    if (term) params.set("q", term)
    if (travelers) params.set("travelers", String(travelers))
    if (date) params.set("date", date)
    setSearching(true)
    setTimeout(() => navigate(`/explore?${params.toString()}`), SEARCH_PROGRESS_MS)
  }

  return (
    <div className={cn("rounded-2xl border border-white/20 bg-white/95 p-3 shadow-lift backdrop-blur sm:p-4", className)}>
      <div className="grid gap-2 sm:grid-cols-[1.6fr_1fr_1fr_auto] sm:items-center sm:gap-0 sm:divide-x sm:divide-sand-200">
        <div className="relative px-1 sm:px-4">
          <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-ocean-950/60">
            <MapPin size={13} /> Where to?
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Search destinations, e.g. Bali"
            className="w-full bg-transparent text-sm font-medium text-ocean-950 outline-none placeholder:text-ocean-950/30"
          />
          {showSuggestions && (
            <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-y-auto rounded-xl border border-sand-200 bg-white p-2 shadow-lift">
              {suggestions.length === 0 && <p className="px-3 py-2 text-sm text-ocean-950/50">No destinations found</p>}
              {suggestions.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onMouseDown={() => submit(d.name)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-sand-100"
                >
                  <MapPin size={14} className="text-ocean-500" />
                  <span className="text-sm font-medium text-ocean-950">{d.name}</span>
                  <span className="text-xs text-ocean-950/50">{d.country}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-1 sm:px-4">
          <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-ocean-950/60">
            <Calendar size={13} /> When?
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-transparent text-sm font-medium text-ocean-950 outline-none"
          />
        </div>

        <div className="px-1 sm:px-4">
          <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-ocean-950/60">
            <Users size={13} /> Travelers
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTravelers((t) => Math.max(1, t - 1))}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-sand-100 text-sm font-bold text-ocean-950"
            >
              −
            </button>
            <span className="text-sm font-medium text-ocean-950">{travelers}</span>
            <button
              type="button"
              onClick={() => setTravelers((t) => Math.min(12, t + 1))}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-sand-100 text-sm font-bold text-ocean-950"
            >
              +
            </button>
          </div>
        </div>

        <div className="px-1 pt-1 sm:px-3 sm:pt-0">
          <button
            type="button"
            onClick={() => submit()}
            disabled={searching}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-sunset-500 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-sunset-600 disabled:opacity-90 sm:rounded-full sm:py-2.5"
          >
            {searching ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Getting you the best rates...
              </>
            ) : (
              <>
                <Search size={16} />
                Search
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
