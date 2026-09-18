import { useEffect, useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { ArrowLeft, Trash2 } from "lucide-react"
import { useAdminResource } from "../../hooks/useAdminResource"
import { adminCreate, adminDelete, adminUpdate } from "../../lib/adminApi"
import { useToast } from "../../context/ToastContext"
import { useCatalog } from "../../context/CatalogContext"
import { AdminErrorNotice, AdminSkeletonLines } from "../../components/admin/AdminUI"
import { ImageUploadField } from "../../components/admin/ImageUploadField"
import type { DealRow } from "./AdminDeals"

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

export default function AdminDealDetail() {
  const { id } = useParams<{ id: string }>()
  const isNew = id === "new"
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { packages, refresh } = useCatalog()

  const { items, setItems, loading, error } = useAdminResource<DealRow>("deals")
  const current = isNew ? null : items.find((d) => d.id === id)
  const [form, setForm] = useState<ReturnType<typeof emptyForm> | null>(isNew ? emptyForm(packages[0]?.id ?? "") : null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isNew && current && !form) {
      setForm({
        id: current.id,
        title: current.title,
        subtitle: current.subtitle,
        discount_percent: current.discount_percent,
        code: current.code,
        expires_at: current.expires_at?.slice(0, 16) ?? "",
        image: current.image,
        package_id: current.package_id ?? "",
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, isNew])

  const save = async () => {
    if (!form) return
    if (!form.title || !form.code || !form.package_id) {
      showToast("Title, code and a linked package are required", "info")
      return
    }
    setSaving(true)
    try {
      if (isNew) {
        const created = await adminCreate<DealRow>("deals", form)
        setItems((prev) => [created, ...prev])
        showToast("Deal added")
        refresh()
        navigate(`/admin/deals/${created.id}`, { replace: true })
      } else if (id) {
        const updated = await adminUpdate<DealRow>("deals", id, form)
        setItems((prev) => prev.map((d) => (d.id === id ? updated : d)))
        showToast("Deal updated")
        refresh()
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save", "info")
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!id || !confirm("Delete this deal?")) return
    try {
      await adminDelete("deals", id)
      refresh()
      showToast("Deal deleted")
      navigate("/admin/deals")
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete", "info")
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/admin/deals" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ocean-950/60 hover:text-ocean-950">
        <ArrowLeft size={15} /> Back to Deals
      </Link>

      {error && <AdminErrorNotice resource="deals" message={error} />}

      {!isNew && loading && !current && (
        <div className="rounded-2xl border border-sand-200 bg-white p-5">
          <AdminSkeletonLines count={5} />
        </div>
      )}

      {!isNew && !loading && !current && !error && (
        <div className="rounded-2xl border border-dashed border-sand-300 p-10 text-center text-sm text-ocean-950/50">Deal not found.</div>
      )}

      {form && (
        <div className="rounded-2xl border border-sand-200 bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <h1 className="font-display text-xl font-bold text-ocean-950">{isNew ? "New Deal" : form.title || "Edit Deal"}</h1>
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

          <button onClick={save} disabled={saving} className="mt-5 rounded-full bg-ocean-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
            {saving ? "Saving..." : "Save Deal"}
          </button>
        </div>
      )}
    </div>
  )
}
