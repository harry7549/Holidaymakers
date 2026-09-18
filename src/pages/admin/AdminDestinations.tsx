import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react"
import { useAdminResource } from "../../hooks/useAdminResource"
import { adminDelete } from "../../lib/adminApi"
import { useToast } from "../../context/ToastContext"
import { useCatalog } from "../../context/CatalogContext"
import { formatPrice } from "../../lib/utils"
import { SmartImage } from "../../components/SmartImage"
import { AdminPageHeader, AdminEmptyState, AdminErrorNotice, AdminSearchBar, AdminSkeletonGrid, Badge } from "../../components/admin/AdminUI"

export interface DestinationRow {
  id: string
  name: string
  country: string
  region: "Domestic" | "International"
  image: string
  tagline: string
  description: string
  from_price: number
  package_count: number
  rating: number
  best_months: string
  tags: string[]
}

export default function AdminDestinations() {
  const { items, setItems, loading, error } = useAdminResource<DestinationRow>("destinations")
  const { refresh } = useCatalog()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [search, setSearch] = useState("")

  const filteredItems = items.filter((d) => d.name.toLowerCase().includes(search.trim().toLowerCase()))

  const remove = async (id: string) => {
    if (!confirm("Delete this destination? This cannot be undone.")) return
    try {
      await adminDelete("destinations", id)
      setItems((prev) => prev.filter((d) => d.id !== id))
      refresh()
      showToast("Destination deleted")
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete", "info")
    }
  }

  return (
    <div>
      <AdminPageHeader
        icon={MapPin}
        title="Destinations"
        subtitle="Places travellers can browse and filter by."
        action={
          <button
            onClick={() => navigate("/admin/destinations/new")}
            className="flex items-center gap-1.5 rounded-full bg-ocean-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ocean-700"
          >
            <Plus size={15} /> Add Destination
          </button>
        }
      />

      {!loading && !error && items.length > 0 && (
        <AdminSearchBar value={search} onChange={setSearch} placeholder="Search destinations by name..." resultCount={filteredItems.length} />
      )}

      {loading && <AdminSkeletonGrid />}
      {error && <AdminErrorNotice resource="destinations" message={error} />}

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((d) => (
            <div
              key={d.id}
              onClick={() => navigate(`/admin/destinations/${d.id}`)}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-sand-200 bg-white transition-all hover:-translate-y-0.5 hover:border-ocean-200 hover:shadow-card"
            >
              <div className="relative h-28">
                <SmartImage src={d.image} alt={d.name} className="h-full w-full" />
                <div className="absolute left-2 top-2">
                  <Badge tone={d.region === "International" ? "sunset" : "ocean"}>{d.region}</Badge>
                </div>
                <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/admin/destinations/${d.id}`)
                    }}
                    className="rounded-lg bg-white/95 p-1.5 text-ocean-950/60 shadow-sm hover:text-ocean-700"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      remove(d.id)
                    }}
                    className="rounded-lg bg-white/95 p-1.5 text-ocean-950/60 shadow-sm hover:text-sunset-600"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <p className="truncate font-display text-base font-bold text-ocean-950">{d.name}</p>
                <p className="mt-0.5 text-xs text-ocean-950/50">{d.country}</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-ocean-950">From {formatPrice(d.from_price)}</p>
                  <span className="flex items-center gap-1 text-xs text-ocean-950/50">
                    <Star size={11} className="text-gold-500" /> {d.rating}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3">
              <AdminEmptyState label="No destinations yet — add your first one above." />
            </div>
          )}
          {items.length > 0 && filteredItems.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3">
              <AdminEmptyState label={`No destinations match "${search}".`} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
