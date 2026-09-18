import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Award, ExternalLink, Flame, Package as PackageIcon, Pencil, Plus, Sparkles, Star, Trash2 } from "lucide-react"
import { useAdminResource } from "../../hooks/useAdminResource"
import { adminDelete, adminUpdate } from "../../lib/adminApi"
import { useToast } from "../../context/ToastContext"
import { useCatalog } from "../../context/CatalogContext"
import { formatPrice } from "../../lib/utils"
import { SmartImage } from "../../components/SmartImage"
import { InlineCostEditor } from "../../components/admin/InlineCostEditor"
import { AdminPageHeader, AdminEmptyState, AdminErrorNotice, AdminSearchBar, AdminSkeletonGrid, Badge } from "../../components/admin/AdminUI"
import type { PackageRow } from "../../components/admin/PackageFormShared"

export default function AdminPackages() {
  const { items, setItems, loading, error } = useAdminResource<PackageRow>("packages")
  const { refresh } = useCatalog()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [search, setSearch] = useState("")

  const filteredItems = items.filter((p) => p.title.toLowerCase().includes(search.trim().toLowerCase()))

  const remove = async (id: string) => {
    if (!confirm("Delete this package? This cannot be undone.")) return
    try {
      await adminDelete("packages", id)
      setItems((prev) => prev.filter((p) => p.id !== id))
      refresh()
      showToast("Package deleted")
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete", "info")
    }
  }

  return (
    <div>
      <AdminPageHeader
        icon={PackageIcon}
        title="Packages"
        subtitle="Every holiday package shown on the site, and their prices."
        action={
          <button
            onClick={() => navigate("/admin/packages/new")}
            className="flex items-center gap-1.5 rounded-full bg-ocean-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ocean-700"
          >
            <Plus size={15} /> Add Package
          </button>
        }
      />

      {!loading && !error && items.length > 0 && (
        <AdminSearchBar value={search} onChange={setSearch} placeholder="Search packages by title..." resultCount={filteredItems.length} />
      )}

      {loading && <AdminSkeletonGrid />}
      {error && <AdminErrorNotice resource="packages" message={error} />}

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/admin/packages/${p.id}`)}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-sand-200 bg-white transition-all hover:-translate-y-0.5 hover:border-ocean-200 hover:shadow-card"
            >
              <div className="relative h-32">
                <SmartImage src={p.image} alt={p.title} className="h-full w-full" />
                <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                  {p.featured && (
                    <Badge tone="gold">
                      <span className="inline-flex items-center gap-0.5">
                        <Star size={9} /> Featured
                      </span>
                    </Badge>
                  )}
                  {p.trending && (
                    <Badge tone="sunset">
                      <span className="inline-flex items-center gap-0.5">
                        <Flame size={9} /> Trending
                      </span>
                    </Badge>
                  )}
                  {p.best_seller && (
                    <Badge tone="ocean">
                      <span className="inline-flex items-center gap-0.5">
                        <Award size={9} /> Bestseller
                      </span>
                    </Badge>
                  )}
                </div>
                <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <a
                    href={`/package/${p.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    title="Preview live page"
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-lg bg-white/95 p-1.5 text-ocean-950/60 shadow-sm hover:text-ocean-700"
                  >
                    <ExternalLink size={13} />
                  </a>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/admin/packages/${p.id}`)
                    }}
                    className="rounded-lg bg-white/95 p-1.5 text-ocean-950/60 shadow-sm hover:text-ocean-700"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      remove(p.id)
                    }}
                    className="rounded-lg bg-white/95 p-1.5 text-ocean-950/60 shadow-sm hover:text-sunset-600"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <p className="truncate font-display text-base font-bold text-ocean-950">{p.title}</p>
                <p className="mt-0.5 text-xs text-ocean-950/50">
                  {p.destination_name}, {p.country} · {p.days}D/{p.nights}N
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-ocean-950">{formatPrice(p.price)}</p>
                  <span className="flex items-center gap-1 text-xs text-ocean-950/50">
                    <Sparkles size={11} className="text-gold-500" /> {p.rating}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between border-t border-sand-100 pt-1.5" onClick={(e) => e.stopPropagation()}>
                  <InlineCostEditor
                    label="Cost"
                    value={p.cost_price ?? 0}
                    onSave={async (v) => {
                      const updated = await adminUpdate<PackageRow>("packages", p.id, { cost_price: v })
                      setItems((prev) => prev.map((row) => (row.id === p.id ? updated : row)))
                    }}
                  />
                  <span className="text-xs font-semibold text-ocean-600">Margin {formatPrice(p.price - (p.cost_price ?? 0))}</span>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3">
              <AdminEmptyState label="No packages yet — add your first one above." />
            </div>
          )}
          {items.length > 0 && filteredItems.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3">
              <AdminEmptyState label={`No packages match "${search}".`} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
