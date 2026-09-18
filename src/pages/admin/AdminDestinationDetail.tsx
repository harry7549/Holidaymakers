import { useEffect, useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { ArrowLeft, Trash2 } from "lucide-react"
import { useAdminResource } from "../../hooks/useAdminResource"
import { adminCreate, adminDelete, adminUpdate } from "../../lib/adminApi"
import { useToast } from "../../context/ToastContext"
import { useCatalog } from "../../context/CatalogContext"
import { AdminErrorNotice, AdminSkeletonLines } from "../../components/admin/AdminUI"
import { ImageUploadField } from "../../components/admin/ImageUploadField"
import type { DestinationRow } from "./AdminDestinations"

function emptyForm() {
  return {
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
}

export default function AdminDestinationDetail() {
  const { id } = useParams<{ id: string }>()
  const isNew = id === "new"
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { refresh } = useCatalog()

  const { items, setItems, loading, error } = useAdminResource<DestinationRow>("destinations")
  const current = isNew ? null : items.find((d) => d.id === id)
  const [form, setForm] = useState<ReturnType<typeof emptyForm> | null>(isNew ? emptyForm() : null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isNew && current && !form) {
      setForm({
        id: current.id,
        name: current.name,
        country: current.country,
        region: current.region,
        image: current.image,
        tagline: current.tagline,
        description: current.description,
        from_price: current.from_price,
        package_count: current.package_count,
        rating: current.rating,
        best_months: current.best_months,
        tags: (current.tags || []).join(", "),
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, isNew])

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
      if (isNew) {
        const created = await adminCreate<DestinationRow>("destinations", payload)
        setItems((prev) => [created, ...prev])
        showToast("Destination added")
        refresh()
        navigate(`/admin/destinations/${created.id}`, { replace: true })
      } else if (id) {
        const updated = await adminUpdate<DestinationRow>("destinations", id, payload)
        setItems((prev) => prev.map((d) => (d.id === id ? updated : d)))
        showToast("Destination updated")
        refresh()
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save", "info")
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!id || !confirm("Delete this destination? This cannot be undone.")) return
    try {
      await adminDelete("destinations", id)
      refresh()
      showToast("Destination deleted")
      navigate("/admin/destinations")
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete", "info")
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/admin/destinations" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ocean-950/60 hover:text-ocean-950">
        <ArrowLeft size={15} /> Back to Destinations
      </Link>

      {error && <AdminErrorNotice resource="destinations" message={error} />}

      {!isNew && loading && !current && (
        <div className="rounded-2xl border border-sand-200 bg-surface p-5">
          <AdminSkeletonLines count={5} />
        </div>
      )}

      {!isNew && !loading && !current && !error && (
        <div className="rounded-2xl border border-dashed border-sand-300 p-10 text-center text-sm text-ocean-950/50">Destination not found.</div>
      )}

      {form && (
        <div className="rounded-2xl border border-sand-200 bg-surface p-6">
          <div className="mb-5 flex items-center justify-between">
            <h1 className="font-display text-xl font-bold text-ocean-950">{isNew ? "New Destination" : form.name || "Edit Destination"}</h1>
            {!isNew && (
              <button
                onClick={remove}
                className="flex items-center gap-1.5 rounded-full border border-sand-200 px-3 py-1.5 text-xs font-semibold text-ocean-950/60 hover:border-sunset-300 hover:text-sunset-600"
              >
                <Trash2 size={13} /> Delete
              </button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              placeholder="Id (unique, e.g. bali)"
              value={form.id}
              disabled={!isNew}
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
            <div className="sm:col-span-2">
              <ImageUploadField value={form.image} onChange={(v) => setForm({ ...form, image: v })} />
            </div>
            <input
              placeholder="Tagline"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400 sm:col-span-2"
            />
            <textarea
              placeholder="Description"
              rows={3}
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

          <button onClick={save} disabled={saving} className="mt-5 rounded-full bg-ocean-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
            {saving ? "Saving..." : "Save Destination"}
          </button>
        </div>
      )}
    </div>
  )
}
