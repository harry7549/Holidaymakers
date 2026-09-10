import { useState } from "react"
import { BadgeCheck, Globe2, Pencil, Plus, Trash2, X } from "lucide-react"
import { useAdminResource } from "../../hooks/useAdminResource"
import { adminCreate, adminDelete, adminUpdate } from "../../lib/adminApi"
import { useToast } from "../../context/ToastContext"
import { useCatalog } from "../../context/CatalogContext"
import { cn } from "../../lib/utils"

interface SupplierRow {
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

const emptyForm = {
  id: "",
  name: "",
  type: "offline" as "online" | "offline",
  location: "",
  rating: 4.5,
  packages_count: 0,
  verified: false,
  since: new Date().getFullYear(),
  specialty: "",
  logo_initial: "",
  color: "ocean",
}

export default function AdminSuppliers() {
  const { items, setItems, loading, error } = useAdminResource<SupplierRow>("suppliers")
  const { refresh } = useCatalog()
  const { showToast } = useToast()
  const [form, setForm] = useState<typeof emptyForm | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const startCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const startEdit = (s: SupplierRow) => {
    setEditingId(s.id)
    setForm({ ...s })
  }

  const save = async () => {
    if (!form) return
    if (!form.id || !form.name) {
      showToast("Id and name are required", "info")
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        const updated = await adminUpdate<SupplierRow>("suppliers", editingId, form)
        setItems((prev) => prev.map((s) => (s.id === editingId ? updated : s)))
        showToast("Supplier updated")
      } else {
        const created = await adminCreate<SupplierRow>("suppliers", form)
        setItems((prev) => [created, ...prev])
        showToast("Supplier added")
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ocean-950">
            <Globe2 size={22} /> Suppliers
          </h1>
          <p className="text-sm text-ocean-950/60">Your online and offline partner network.</p>
        </div>
        <button onClick={startCreate} className="flex items-center gap-1.5 rounded-full bg-ocean-600 px-4 py-2.5 text-sm font-semibold text-white">
          <Plus size={15} /> Add Supplier
        </button>
      </div>

      {form && (
        <div className="mb-6 rounded-2xl border border-ocean-300 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-ocean-950">{editingId ? "Edit Supplier" : "New Supplier"}</h2>
            <button onClick={() => setForm(null)}>
              <X size={18} />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              placeholder="Id (unique, e.g. sup-7)"
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
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as "online" | "offline" })}
              className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
            >
              <option value="offline">Offline agency</option>
              <option value="online">Online operator</option>
            </select>
            <input
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
            />
            <input
              placeholder="Specialty"
              value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
              className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400 sm:col-span-2"
            />
            <input
              placeholder="Logo initial (1 letter)"
              maxLength={2}
              value={form.logo_initial}
              onChange={(e) => setForm({ ...form, logo_initial: e.target.value })}
              className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
            />
            <select
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
            >
              <option value="ocean">Ocean (teal)</option>
              <option value="sunset">Sunset (orange)</option>
              <option value="gold">Gold</option>
            </select>
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
              type="number"
              placeholder="Partner since (year)"
              value={form.since}
              onChange={(e) => setForm({ ...form, since: Number(e.target.value) })}
              className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
            />
            <label className="flex items-center gap-2 text-sm text-ocean-950/80">
              <input type="checkbox" checked={form.verified} onChange={(e) => setForm({ ...form, verified: e.target.checked })} className="accent-ocean-600" />
              Verified partner
            </label>
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="mt-4 rounded-full bg-ocean-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Supplier"}
          </button>
        </div>
      )}

      {loading && <p className="text-sm text-ocean-950/50">Loading...</p>}
      {error && <p className="text-sm text-sunset-600">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((s) => (
          <div key={s.id} className="rounded-2xl border border-sand-200 bg-white p-4">
            <div className="mb-1 flex items-start justify-between">
              <div className="flex items-center gap-1.5">
                <p className="font-display text-base font-bold text-ocean-950">{s.name}</p>
                {s.verified && <BadgeCheck size={14} className="text-ocean-500" />}
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => startEdit(s)} className="text-ocean-950/50 hover:text-ocean-700">
                  <Pencil size={15} />
                </button>
                <button onClick={() => remove(s.id)} className="text-ocean-950/50 hover:text-sunset-600">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            <p className="text-xs text-ocean-950/50">{s.location}</p>
            <p className={cn("mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize", s.type === "online" ? "bg-sunset-50 text-sunset-600" : "bg-ocean-50 text-ocean-700")}>
              {s.type}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
