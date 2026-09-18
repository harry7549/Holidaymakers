import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Clock, Percent, Pencil, Plus, Trash2 } from "lucide-react"
import { useAdminResource } from "../../hooks/useAdminResource"
import { adminDelete } from "../../lib/adminApi"
import { useToast } from "../../context/ToastContext"
import { useCatalog } from "../../context/CatalogContext"
import { formatDate } from "../../lib/utils"
import { SmartImage } from "../../components/SmartImage"
import { AdminPageHeader, AdminEmptyState, AdminErrorNotice, AdminSearchBar, AdminSkeletonGrid } from "../../components/admin/AdminUI"

export interface DealRow {
  id: string
  title: string
  subtitle: string
  discount_percent: number
  code: string
  expires_at: string
  image: string
  package_id: string | null
}

export default function AdminDeals() {
  const { items, setItems, loading, error } = useAdminResource<DealRow>("deals")
  const { refresh } = useCatalog()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [search, setSearch] = useState("")

  const filteredItems = items.filter((d) => d.title.toLowerCase().includes(search.trim().toLowerCase()))

  const remove = async (id: string) => {
    if (!confirm("Delete this deal?")) return
    try {
      await adminDelete("deals", id)
      setItems((prev) => prev.filter((d) => d.id !== id))
      refresh()
      showToast("Deal deleted")
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete", "info")
    }
  }

  return (
    <div>
      <AdminPageHeader
        icon={Percent}
        title="Deals"
        subtitle="Limited-time offers shown on the homepage and Deals page."
        action={
          <button
            onClick={() => navigate("/admin/deals/new")}
            className="flex items-center gap-1.5 rounded-full bg-ocean-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ocean-700"
          >
            <Plus size={15} /> Add Deal
          </button>
        }
      />

      {!loading && !error && items.length > 0 && (
        <AdminSearchBar value={search} onChange={setSearch} placeholder="Search deals by title..." resultCount={filteredItems.length} />
      )}

      {loading && <AdminSkeletonGrid />}
      {error && <AdminErrorNotice resource="deals" message={error} />}

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((d) => (
            <div
              key={d.id}
              onClick={() => navigate(`/admin/deals/${d.id}`)}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-sand-200 bg-white transition-all hover:-translate-y-0.5 hover:border-ocean-200 hover:shadow-card"
            >
              <div className="relative h-24">
                <SmartImage src={d.image} alt={d.title} className="h-full w-full" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className="absolute left-2 top-2 rounded-full bg-sunset-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">{d.discount_percent}% OFF</span>
                <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/admin/deals/${d.id}`)
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
                <p className="truncate font-display text-base font-bold text-ocean-950">{d.title}</p>
                <p className="mt-0.5 truncate text-xs text-ocean-950/50">{d.subtitle}</p>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <code className="rounded bg-sand-100 px-1.5 py-0.5 font-mono font-semibold text-ocean-950/70">{d.code}</code>
                  <span className="flex items-center gap-1 text-ocean-950/50">
                    <Clock size={11} /> {d.expires_at ? formatDate(d.expires_at) : "—"}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3">
              <AdminEmptyState label="No deals yet — add your first one above." />
            </div>
          )}
          {items.length > 0 && filteredItems.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3">
              <AdminEmptyState label={`No deals match "${search}".`} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
