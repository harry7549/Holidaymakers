import { useEffect, useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { ArrowLeft, Trash2 } from "lucide-react"
import { useAdminResource } from "../../hooks/useAdminResource"
import { adminCreate, adminDelete, adminUpdate } from "../../lib/adminApi"
import { useToast } from "../../context/ToastContext"
import { useCatalog } from "../../context/CatalogContext"
import { formatPrice } from "../../lib/utils"
import { AdminErrorNotice, AdminSkeletonLines } from "../../components/admin/AdminUI"
import { InlineCostEditor } from "../../components/admin/InlineCostEditor"
import type { SupplierRow } from "./AdminSuppliers"

function emptyForm() {
  return {
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
}

export default function AdminSupplierDetail() {
  const { id } = useParams<{ id: string }>()
  const isNew = id === "new"
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { packages, refresh } = useCatalog()

  const { items, setItems, loading, error } = useAdminResource<SupplierRow>("suppliers")
  const current = isNew ? null : items.find((s) => s.id === id)
  const [form, setForm] = useState<ReturnType<typeof emptyForm> | null>(isNew ? emptyForm() : null)
  const [saving, setSaving] = useState(false)
  const [assignPkgId, setAssignPkgId] = useState("")
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    if (!isNew && current && !form) {
      setForm({ ...current })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, isNew])

  const save = async () => {
    if (!form) return
    if (!form.id || !form.name) {
      showToast("Id and name are required", "info")
      return
    }
    setSaving(true)
    try {
      if (isNew) {
        const created = await adminCreate<SupplierRow>("suppliers", form)
        setItems((prev) => [created, ...prev])
        showToast("Supplier added")
        refresh()
        navigate(`/admin/suppliers/${created.id}`, { replace: true })
      } else if (id) {
        const updated = await adminUpdate<SupplierRow>("suppliers", id, form)
        setItems((prev) => prev.map((s) => (s.id === id ? updated : s)))
        showToast("Supplier updated")
        refresh()
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save", "info")
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!id || !confirm("Delete this supplier?")) return
    try {
      await adminDelete("suppliers", id)
      refresh()
      showToast("Supplier deleted")
      navigate("/admin/suppliers")
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete", "info")
    }
  }

  const assignPackage = async () => {
    if (!assignPkgId || !id) return
    setAssigning(true)
    try {
      await adminUpdate("packages", assignPkgId, { supplier_id: id })
      refresh()
      setAssignPkgId("")
      showToast("Package assigned")
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to assign", "info")
    } finally {
      setAssigning(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/admin/suppliers" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ocean-950/60 hover:text-ocean-950">
        <ArrowLeft size={15} /> Back to Suppliers
      </Link>

      {error && <AdminErrorNotice resource="suppliers" message={error} />}

      {!isNew && loading && !current && (
        <div className="rounded-2xl border border-sand-200 bg-white p-5">
          <AdminSkeletonLines count={5} />
        </div>
      )}

      {!isNew && !loading && !current && !error && (
        <div className="rounded-2xl border border-dashed border-sand-300 p-10 text-center text-sm text-ocean-950/50">Supplier not found.</div>
      )}

      {form && (
        <div className="rounded-2xl border border-sand-200 bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <h1 className="font-display text-xl font-bold text-ocean-950">{isNew ? "New Supplier" : form.name || "Edit Supplier"}</h1>
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
              placeholder="Id (unique, e.g. sup-7)"
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

          {!isNew && id && (
            <div className="mt-5 border-t border-sand-100 pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ocean-950/40">
                Their packages & what they charge you (updates often — edit directly here)
              </p>
              {packages.filter((p) => p.supplierId === id).length === 0 ? (
                <p className="mb-3 text-xs text-ocean-950/40">No packages linked to this supplier yet — assign one below.</p>
              ) : (
                <div className="mb-3 space-y-1.5">
                  {packages
                    .filter((p) => p.supplierId === id)
                    .map((p) => (
                      <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg bg-sand-50 px-3 py-2 text-xs">
                        <span className="min-w-0 truncate font-medium text-ocean-950/80">{p.title}</span>
                        <span className="shrink-0 text-ocean-950/50">Sell {formatPrice(p.price)}</span>
                        <div className="shrink-0">
                          <InlineCostEditor
                            value={p.costPrice ?? 0}
                            onSave={async (v) => {
                              await adminUpdate("packages", p.id, { cost_price: v })
                              refresh()
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              )}
              <div className="flex gap-2">
                <select
                  value={assignPkgId}
                  onChange={(e) => setAssignPkgId(e.target.value)}
                  className="w-full rounded-lg border border-sand-200 px-3 py-2 text-xs outline-none focus:border-ocean-400"
                >
                  <option value="">Assign an existing package to this supplier...</option>
                  {packages
                    .filter((p) => p.supplierId !== id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} {p.supplierId ? "(currently with another supplier)" : ""}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={assignPackage}
                  disabled={!assignPkgId || assigning}
                  className="shrink-0 rounded-lg bg-ocean-600 px-3 py-2 text-xs font-semibold text-white hover:bg-ocean-700 disabled:opacity-50"
                >
                  {assigning ? "Assigning..." : "Assign"}
                </button>
              </div>
              <p className="mt-2 text-xs text-ocean-950/40">
                To create a brand-new package for this supplier, add it from the Packages tab and pick this supplier there.
              </p>
            </div>
          )}

          <button onClick={save} disabled={saving} className="mt-5 rounded-full bg-ocean-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
            {saving ? "Saving..." : "Save Supplier"}
          </button>
        </div>
      )}
    </div>
  )
}
