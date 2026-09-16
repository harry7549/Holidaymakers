import { BadgeCheck, Check, X } from "lucide-react"
import { useAdminResource } from "../../hooks/useAdminResource"
import { adminUpdate } from "../../lib/adminApi"
import { cn, formatDate } from "../../lib/utils"
import { useToast } from "../../context/ToastContext"
import { AdminPageHeader, AdminEmptyState, AdminErrorNotice } from "../../components/admin/AdminUI"

interface ApplicationRow {
  id: string
  business: string
  contact: string
  email: string
  city: string
  type: string
  message: string
  status: string
  created_at: string
}

export default function AdminSupplierApplications() {
  const { items, setItems, loading, error } = useAdminResource<ApplicationRow>("supplier-applications")
  const { showToast } = useToast()

  const updateStatus = async (id: string, status: string) => {
    try {
      const updated = await adminUpdate<ApplicationRow>("supplier-applications", id, { status })
      setItems((prev) => prev.map((a) => (a.id === id ? updated : a)))
      if (status === "approved") showToast("Approved — added to your suppliers list")
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update", "info")
    }
  }

  return (
    <div>
      <AdminPageHeader
        icon={BadgeCheck}
        title="Partner Applications"
        subtitle="Applications from the Suppliers page. Approving one automatically adds it to your Suppliers list."
      />

      {loading && <p className="text-sm text-ocean-950/50">Loading...</p>}
      {error && <AdminErrorNotice resource="partner applications" message={error} />}
      {!loading && items.length === 0 && !error && <AdminEmptyState label="No applications yet." />}

      <div className="space-y-3">
        {items.map((a) => (
          <div key={a.id} className={cn("rounded-2xl border bg-white p-4", a.status === "new" ? "border-ocean-300" : "border-sand-200")}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-base font-bold text-ocean-950">{a.business}</p>
                <p className="text-xs text-ocean-950/50">
                  {a.contact} · {a.email} · {a.city || "No city"} · {a.type} · {formatDate(a.created_at)}
                </p>
              </div>
              {a.status === "new" ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(a.id, "approved")}
                    className="flex items-center gap-1 rounded-full bg-ocean-600 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    <Check size={13} /> Approve
                  </button>
                  <button
                    onClick={() => updateStatus(a.id, "rejected")}
                    className="flex items-center gap-1 rounded-full border border-sand-200 px-3 py-1.5 text-xs font-semibold text-ocean-950"
                  >
                    <X size={13} /> Reject
                  </button>
                </div>
              ) : (
                <span className="rounded-full bg-sand-100 px-3 py-1 text-xs font-semibold capitalize text-ocean-950/70">{a.status}</span>
              )}
            </div>
            {a.message && <p className="mt-2 text-sm text-ocean-950/70">{a.message}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
