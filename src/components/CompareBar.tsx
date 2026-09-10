import { Link, useLocation } from "react-router-dom"
import { Scale, X } from "lucide-react"
import { useTrip } from "../context/TripContext"
import { useCatalog } from "../context/CatalogContext"
import { SmartImage } from "./SmartImage"
import { shouldShowCompareBar } from "../lib/bottomBars"

export function CompareBar() {
  const { compareList, toggleCompare, clearCompare } = useTrip()
  const { packages } = useCatalog()
  const location = useLocation()

  if (!shouldShowCompareBar(location.pathname, compareList.length)) return null

  const items = compareList.map((id) => packages.find((p) => p.id === id)).filter(Boolean)

  return (
    <div className="fixed inset-x-0 bottom-14 z-40 sm:bottom-0">
      <div className="mx-auto max-w-5xl px-3 pb-3 sm:px-6 sm:pb-6">
        <div className="flex items-center gap-3 rounded-2xl border border-sand-200 bg-white p-3 shadow-lift sm:gap-4 sm:p-4">
          <div className="flex items-center gap-2 shrink-0">
            <Scale size={18} className="text-ocean-600" />
            <span className="hidden text-sm font-semibold text-ocean-950 sm:inline">Compare</span>
          </div>
          <div className="flex flex-1 gap-2 overflow-x-auto no-scrollbar">
            {items.map((pkg) => (
              <div key={pkg!.id} className="relative shrink-0">
                <SmartImage src={pkg!.image} alt={pkg!.title} className="h-11 w-11 rounded-lg" />
                <button
                  onClick={() => toggleCompare(pkg!.id)}
                  className="absolute -right-1.5 -top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-ocean-950 text-white"
                  aria-label="Remove"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
          <button onClick={clearCompare} className="hidden shrink-0 text-xs font-medium text-ocean-950/50 hover:text-ocean-950 sm:block">
            Clear
          </button>
          <Link
            to="/compare"
            className="shrink-0 rounded-full bg-ocean-600 px-4 py-2 text-xs font-semibold text-white hover:bg-ocean-700 sm:text-sm"
          >
            Compare ({items.length})
          </Link>
        </div>
      </div>
    </div>
  )
}
