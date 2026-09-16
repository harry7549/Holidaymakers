import { useState } from "react"
import { Clock, Percent, Pencil, Plus, Trash2, X } from "lucide-react"
import { useAdminResource } from "../../hooks/useAdminResource"
import { adminCreate, adminDelete, adminUpdate } from "../../lib/adminApi"
import { useToast } from "../../context/ToastContext"
import { useCatalog } from "../../context/CatalogContext"
import { formatDate } from "../../lib/utils"
import { SmartImage } from "../../components/SmartImage"
import { ImageUploadField } from "../../components/admin/ImageUploadField"
import { AdminPageHeader, AdminEmptyState, AdminErrorNotice, AdminSkeletonGrid } from "../../components/admin/AdminUI"

interface DealRow {
  id: string
  title: string
  subtitle: string
  discount_percent: number
  code: string
  expires_at: string
  image: string
  package_id: string | null
}

function emptyForm(packageId: string) {
  return {
    id: `deal-${Date.now()}`,
    title: "",
    subtitle: "",
    discount_percent: 10,
    code: "",
    expires_at: "",
    image: "",
    package_id: packageId,
  }
}

export default function AdminDeals() {
  const { items, setItems, loading, error } = useAdminResource<DealRow>("deals")
  const { packages, refresh } = useCatalog()
  const { showToast } = useToast()
  const [form, setForm] = useState<ReturnType<typeof emptyForm> | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const startCreate = () => {
    setEditingId(null)
    setForm(emptyForm(packages[0]?.id ?? ""))
  }

  const startEdit = (d: DealRow) => {
    setEditingId(d.id)
    setForm({
      id: d.id,
      title: d.title,
      subtitle: d.subtitle,
      discount_percent: d.discount_percent,
      code: d.code,
      expires_at: d.expires_at?.slice(0, 16) ?? "",
      image: d.image,
      package_id: d.package_id ?? "",
    })
  }

  const save = async () => {
    if (!form) return
    if (!form.title || !form.code || !form.package_id) {
      showToast("Title, code and a linked package are required", "info")
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        const updated = await adminUpdate<DealRow>("deals", editingId, form)
        setItems((prev) => prev.map((d) => (d.id === editingId ? updated : d)))
        showToast("Deal updated")
      } else {
        const created = await adminCreate<DealRow>("deals", form)
        setItems((prev) => [created, ...prev])
        showToast("Deal added")
      }
      setForm(null)
      setEditingId(null)
      refresh()
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save", "info")
    } finally {
      setSaving(false)
    }
  }

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
          <button onClick={startCreate} className="flex items-center gap-1.5 rounded-full bg-ocean-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ocean-700">
            <Plus size={15} /> Add Deal
          </button>
        }
      />

      {form && (
        <div className="mb-6 rounded-2xl border border-ocean-300 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-ocean-950">{editingId ? "Edit Deal" : "New Deal"}</h2>
            <button onClick={() => setForm(null)}>
              <X size={18} />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400 sm:col-span-2"
            />
            <input
              placeholder="Subtitle"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400 sm:col-span-2"
            />
            <select
              value={form.package_id}
              onChange={(e) => setForm({ ...form, package_id: e.target.value })}
              className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400 sm:col-span-2"
            >
              <option value="">Select linked package...</option>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Discount %"
              value={form.discount_percent}
              onChange={(e) => setForm({ ...form, discount_percent: Number(e.target.value) })}
              className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
            />
            <input
              placeholder="Promo code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
            />
            <input
              type="datetime-local"
              value={form.expires_at}
              onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
              className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
            />
            <div>
              <ImageUploadField value={form.image} onChange={(v) => setForm({ ...form, image: v })} placeholder="Image URL (defaults to package image)" />
            </div>
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="mt-4 rounded-full bg-ocean-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Deal"}
          </button>
        </div>
      )}

      {loading && <AdminSkeletonGrid />}
      {error && <AdminErrorNotice resource="deals" message={error} />}

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((d) => (
            <div
              key={d.id}
              className="group overflow-hidden rounded-2xl border border-sand-200 bg-white transition-all hover:-translate-y-0.5 hover:border-ocean-200 hover:shadow-card"
            >
              <div className="relative h-24">
                <SmartImage src={d.image} alt={d.title} className="h-full w-full" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className="absolute left-2 top-2 rounded-full bg-sunset-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                  {d.discount_percent}% OFF
                </span>
                <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => startEdit(d)} className="rounded-lg bg-white/95 p-1.5 text-ocean-950/60 shadow-sm hover:text-ocean-700">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => remove(d.id)} className="rounded-lg bg-white/95 p-1.5 text-ocean-950/60 shadow-sm hover:text-sunset-600">
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
          {items.length === 0 && <div className="sm:col-span-2 lg:col-span-3"><AdminEmptyState label="No deals yet — add your first one above." /></div>}
        </div>
      )}
    </div>
  )
}
