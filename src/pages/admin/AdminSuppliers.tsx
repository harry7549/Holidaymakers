import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { BadgeCheck, Briefcase, Globe2, Pencil, Plus, Star, Trash2, TrendingUp } from "lucide-react"
import { useAdminResource } from "../../hooks/useAdminResource"
import { adminDelete } from "../../lib/adminApi"
import { useToast } from "../../context/ToastContext"
import { useCatalog } from "../../context/CatalogContext"
import { cn, formatPrice } from "../../lib/utils"
import { AdminPageHeader, AdminEmptyState, AdminErrorNotice, AdminSearchBar, AdminSkeletonGrid, Badge } from "../../components/admin/AdminUI"

interface BookingRow {
  package_id: string | null
  total_price: number
  supplier_cost: number
  margin: number
  status: string
}

const colorGradients: Record<string, string> = {
  ocean: "from-ocean-500 to-ocean-800",
  sunset: "from-sunset-400 to-sunset-600",
  gold: "from-gold-400 to-gold-600",
}

export interface SupplierRow {
  id: string
  name: string
  type: "online" | "offline"
  location: string
  rating: number
  packages_count: number
  verified: boolean
  since: number
  specialty: string
  logo_initial: string
  color: string
}

export default function AdminSuppliers() {
  const { items, setItems, loading, error } = useAdminResource<SupplierRow>("suppliers")
  const { packages, refresh } = useCatalog()
  const { items: bookings } = useAdminResource<BookingRow>("bookings")
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [search, setSearch] = useState("")

  const filteredItems = items.filter((s) => s.name.toLowerCase().includes(search.trim().toLowerCase()))

  const statsBySupplier = useMemo(() => {
    const map = new Map<string, { count: number; revenue: number; cost: number; margin: number }>()
    for (const s of items) map.set(s.id, { count: 0, revenue: 0, cost: 0, margin: 0 })
    const packageSupplier = new Map(packages.map((p) => [p.id, p.supplierId]))
    for (const b of bookings) {
      if (!b.package_id || b.status === "cancelled") continue
      const supplierId = packageSupplier.get(b.package_id)
      const stat = supplierId ? map.get(supplierId) : undefined
      if (!stat) continue
      stat.count += 1
      stat.revenue += b.total_price
      stat.cost += b.supplier_cost
      stat.margin += b.margin
    }
    return map
  }, [items, packages, bookings])

  const remove = async (id: string) => {
    if (!confirm("Delete this supplier?")) return
    try {
      await adminDelete("suppliers", id)
      setItems((prev) => prev.filter((s) => s.id !== id))
      refresh()
      showToast("Supplier deleted")
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete", "info")
    }
  }

  return (
    <div>
      <AdminPageHeader
        icon={Globe2}
        title="Suppliers"
        subtitle="Your online and offline partner network."
        action={
          <button
            onClick={() => navigate("/admin/suppliers/new")}
            className="flex items-center gap-1.5 rounded-full bg-ocean-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ocean-700"
          >
            <Plus size={15} /> Add Supplier
          </button>
        }
      />

      {!loading && !error && items.length > 0 && (
        <AdminSearchBar value={search} onChange={setSearch} placeholder="Search suppliers by name..." resultCount={filteredItems.length} />
      )}

      {loading && <AdminSkeletonGrid />}
      {error && <AdminErrorNotice resource="suppliers" message={error} />}

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((s) => (
            <div
              key={s.id}
              onClick={() => navigate(`/admin/suppliers/${s.id}`)}
              className="group cursor-pointer rounded-2xl border border-sand-200 bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-ocean-200 hover:shadow-card"
            >
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white",
                      colorGradients[s.color] ?? colorGradients.ocean,
                    )}
                  >
                    {s.logo_initial || s.name.charAt(0)}
                  </span>
                  <div>
                    <p className="flex items-center gap-1 font-display text-sm font-bold text-ocean-950">
                      {s.name}
                      {s.verified && <BadgeCheck size={13} className="text-ocean-500" />}
                    </p>
                    <p className="text-xs text-ocean-950/50">{s.location}</p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/admin/suppliers/${s.id}`)
                    }}
                    className="rounded-lg p-1.5 text-ocean-950/50 hover:bg-sand-100 hover:text-ocean-700"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      remove(s.id)
                    }}
                    className="rounded-lg p-1.5 text-ocean-950/50 hover:bg-sand-100 hover:text-sunset-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="mb-3 flex items-center justify-between">
                <Badge tone={s.type === "online" ? "sunset" : "ocean"}>{s.type}</Badge>
                <span className="flex items-center gap-1 text-xs text-ocean-950/50">
                  <Star size={11} className="text-gold-500" /> {s.rating}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 rounded-xl bg-sand-50 p-2.5 text-center">
                <div>
                  <p className="flex items-center justify-center gap-1 text-sm font-bold text-ocean-950">
                    <Briefcase size={11} className="text-ocean-950/40" /> {statsBySupplier.get(s.id)?.count ?? 0}
                  </p>
                  <p className="text-[10px] text-ocean-950/40">Bookings</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-ocean-950">{formatPrice(statsBySupplier.get(s.id)?.cost ?? 0)}</p>
                  <p className="text-[10px] text-ocean-950/40">Paid to them</p>
                </div>
                <div>
                  <p className="flex items-center justify-center gap-1 text-sm font-bold text-ocean-600">
                    <TrendingUp size={11} /> {formatPrice(statsBySupplier.get(s.id)?.margin ?? 0)}
                  </p>
                  <p className="text-[10px] text-ocean-950/40">Your margin</p>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3">
              <AdminEmptyState label="No suppliers yet — add your first one above." />
            </div>
          )}
          {items.length > 0 && filteredItems.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3">
              <AdminEmptyState label={`No suppliers match "${search}".`} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
