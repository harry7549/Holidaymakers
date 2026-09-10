import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { Check, Scale, X } from "lucide-react"
import { useTrip } from "../context/TripContext"
import { useCatalog } from "../context/CatalogContext"
import type { Package, Supplier } from "../data/types"
import { SmartImage } from "../components/SmartImage"
import { RatingStars } from "../components/RatingStars"
import { formatPrice } from "../lib/utils"

function buildRows(suppliers: Supplier[]): { label: string; render: (p: Package) => ReactNode }[] {
  return [
    { label: "Price / person", render: (p) => <span className="font-display text-lg font-bold text-ocean-950">{formatPrice(p.price)}</span> },
    { label: "Duration", render: (p) => `${p.days}D / ${p.nights}N` },
    { label: "Rating", render: (p) => <RatingStars rating={p.rating} /> },
    { label: "Hotel Rating", render: (p) => `${p.hotelRating}-star` },
    { label: "Meal Plan", render: (p) => p.mealPlan },
    { label: "Group Size", render: (p) => `Up to ${p.groupSizeMax}` },
    { label: "Difficulty", render: (p) => p.difficulty },
    { label: "Flexible Dates", render: (p) => (p.flexible ? <Check size={16} className="text-ocean-500" /> : <X size={16} className="text-sunset-500" />) },
    { label: "Supplier", render: (p) => suppliers.find((s) => s.id === p.supplierId)?.name ?? "—" },
  ]
}

export default function Compare() {
  const { compareList, toggleCompare } = useTrip()
  const { packages, suppliers } = useCatalog()
  const rows = buildRows(suppliers)
  const items = compareList.map((id) => packages.find((p) => p.id === id)).filter(Boolean) as Package[]

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <span className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-ocean-50 text-ocean-600">
          <Scale size={18} />
        </span>
        <h1 className="font-display text-2xl font-bold text-ocean-950 sm:text-3xl">Compare Packages</h1>
        <p className="mt-1 text-sm text-ocean-950/60">Compare up to 3 packages side by side</p>
      </div>

      {items.length === 0 ? (
        <div className="mx-auto max-w-md rounded-2xl border border-dashed border-sand-300 py-16 text-center">
          <p className="text-sm font-semibold text-ocean-950">No packages selected for comparison</p>
          <p className="mt-1 text-sm text-ocean-950/60">Click "Compare" on any package card to add it here.</p>
          <Link to="/explore" className="mt-4 inline-block rounded-full bg-ocean-600 px-5 py-2.5 text-sm font-semibold text-white">
            Explore Packages
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="w-40"></th>
                {items.map((p) => (
                  <th key={p.id} className="p-3 text-left align-top">
                    <div className="relative w-full max-w-56 overflow-hidden rounded-xl border border-sand-200 bg-white">
                      <button
                        onClick={() => toggleCompare(p.id)}
                        className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/90"
                      >
                        <X size={13} />
                      </button>
                      <SmartImage src={p.image} alt={p.title} className="aspect-video w-full" />
                      <div className="p-3">
                        <p className="font-display text-sm font-bold leading-snug text-ocean-950">{p.title}</p>
                        <Link to={`/package/${p.slug}`} className="mt-2 block rounded-full bg-ocean-600 py-1.5 text-center text-xs font-semibold text-white">
                          View
                        </Link>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={row.label} className={ri % 2 === 0 ? "bg-white" : "bg-sand-50"}>
                  <td className="p-3 text-sm font-semibold text-ocean-950/70">{row.label}</td>
                  {items.map((p) => (
                    <td key={p.id} className="p-3 text-sm text-ocean-950">
                      {row.render(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
