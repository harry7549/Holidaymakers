import { useState } from "react"
import { MapPin, Pencil, Plus, Trash2, X } from "lucide-react"
import { useAdminResource } from "../../hooks/useAdminResource"
import { adminCreate, adminDelete, adminUpdate } from "../../lib/adminApi"
import { useToast } from "../../context/ToastContext"
import { useCatalog } from "../../context/CatalogContext"
import { formatPrice } from "../../lib/utils"

interface DestinationRow {
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

const emptyForm = {
  id: "",
  name: "",
  country: "",
  region: "Domestic" as "Domestic" | "International",
  image: "",
  tagline: "",
  description: "",
  from_price: 0,
  package_count: 0,
  rating: 4.5,
  best_months: "",
  tags: "",
}

export default function AdminDestinations() {
  const { items, setItems, loading, error } = useAdminResource<DestinationRow>("destinations")
  const { refresh } = useCatalog()
  const { showToast } = useToast()
  const [form, setForm] = useState<typeof emptyForm | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const startCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const startEdit = (d: DestinationRow) => {
    setEditingId(d.id)
    setForm({
      id: d.id,
      name: d.name,
      country: d.country,
      region: d.region,
      image: d.image,
      tagline: d.tagline,
      description: d.description,
      from_price: d.from_price,
      package_count: d.package_count,
      rating: d.rating,
      best_months: d.best_months,
      tags: (d.tags || []).join(", "),
    })
  }

  const save = async () => {
    if (!form) return
    if (!form.id || !form.name || !form.country) {
      showToast("Id, name and country are required", "info")
      return
    }
    setSaving(true)
    const payload = {
      id: form.id,
      name: form.name,
      country: form.country,
      region: form.region,
      image: form.image,
      tagline: form.tagline,
      description: form.description,
      from_price: Number(form.from_price) || 0,
      package_count: Number(form.package_count) || 0,
      rating: Number(form.rating) || 4.5,
      best_months: form.best_months,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    }
    try {
      if (editingId) {
        const updated = await adminUpdate<DestinationRow>("destinations", editingId, payload)
        setItems((prev) => prev.map((d) => (d.id === editingId ? updated : d)))
        showToast("Destination updated")
      } else {
        const created = await adminCreate<DestinationRow>("destinations", payload)
        setItems((prev) => [created, ...prev])
        showToast("Destination added")
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ocean-950">
            <MapPin size={22} /> Destinations
          </h1>
          <p className="text-sm text-ocean-950/60">Places travellers can browse and filter by.</p>
        </div>
        <button onClick={startCreate} className="flex items-center gap-1.5 rounded-full bg-ocean-600 px-4 py-2.5 text-sm font-semibold text-white">
          <Plus size={15} /> Add Destination
        </button>
      </div>

      {form && (
        <div className="mb-6 rounded-2xl border border-ocean-300 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-ocean-950">{editingId ? "Edit Destination" : "New Destination"}</h2>
            <button onClick={() => setForm(null)}>
              <X size={18} />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              placeholder="Id (unique, e.g. bali)"
              value={form.id}
              disabled={Boolean(editingId)}
              onChange={(e) => setForm({ ...form, id: e.target.value })}
              className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400 disabled:bg-sand-100"
            />
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
            />
            <input
              placeholder="Country"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
            />
            <select
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value as "Domestic" | "International" })}
              className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
            >
              <option value="Domestic">Domestic</option>
              <option value="International">International</option>
            </select>
            <input
              placeholder="Image URL"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400 sm:col-span-2"
            />
            <input
              placeholder="Tagline"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400 sm:col-span-2"
            />
            <textarea
              placeholder="Description"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400 sm:col-span-2"
            />
            <input
              type="number"
              placeholder="Starting price (INR)"
              value={form.from_price}
              onChange={(e) => setForm({ ...form, from_price: Number(e.target.value) })}
              className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
            />
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              placeholder="Rating"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
              className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
            />
            <input
              placeholder="Best months (e.g. Oct – Mar)"
              value={form.best_months}
              onChange={(e) => setForm({ ...form, best_months: e.target.value })}
              className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
            />
            <input
              placeholder="Tags, comma separated (e.g. Beach, Family)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
            />
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="mt-4 rounded-full bg-ocean-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Destination"}
          </button>
        </div>
      )}

      {loading && <p className="text-sm text-ocean-950/50">Loading...</p>}
      {error && <p className="text-sm text-sunset-600">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((d) => (
          <div key={d.id} className="rounded-2xl border border-sand-200 bg-white p-4">
            <div className="mb-1 flex items-start justify-between">
              <p className="font-display text-base font-bold text-ocean-950">{d.name}</p>
              <div className="flex gap-1.5">
                <button onClick={() => startEdit(d)} className="text-ocean-950/50 hover:text-ocean-700">
                  <Pencil size={15} />
                </button>
                <button onClick={() => remove(d.id)} className="text-ocean-950/50 hover:text-sunset-600">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            <p className="text-xs text-ocean-950/50">
              {d.country} · {d.region}
            </p>
            <p className="mt-2 text-sm font-semibold text-ocean-950">From {formatPrice(d.from_price)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
