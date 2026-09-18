import { BadgeCheck, Building2, Check, Globe, Mail, MapPin, Phone, User, X } from "lucide-react"
import { useAdminResource } from "../../hooks/useAdminResource"
import { adminUpdate } from "../../lib/adminApi"
import { cn, formatDate } from "../../lib/utils"
import { useToast } from "../../context/ToastContext"
import { AdminPageHeader, AdminEmptyState, AdminErrorNotice, AdminSkeletonRows, Badge } from "../../components/admin/AdminUI"

interface ApplicationRow {
  id: string
  business: string
  contact: string
  email: string
  phone: string
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

      {loading && <AdminSkeletonRows />}
      {error && <AdminErrorNotice resource="partner applications" message={error} />}
      {!loading && items.length === 0 && !error && <AdminEmptyState label="No applications yet." />}

      <div className="space-y-3">
        {items.map((a) => (
          <div key={a.id} className={cn("rounded-2xl border bg-white p-5", a.status === "new" ? "border-ocean-300" : "border-sand-200")}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-ocean-500 to-ocean-800 font-display text-base font-bold text-white">
                  {a.business.charAt(0).toUpperCase() || "?"}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-bold text-ocean-950">{a.business}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-ocean-950/50">
                    {a.type === "online" ? <Globe size={11} /> : <Building2 size={11} />}
                    <span className="capitalize">{a.type}</span> · Applied {formatDate(a.created_at)}
                  </p>
                </div>
              </div>
              {a.status === "new" ? (
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => updateStatus(a.id, "approved")}
                    className="flex items-center gap-1 rounded-full bg-ocean-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-ocean-700"
                  >
                    <Check size={13} /> Approve
                  </button>
                  <button
                    onClick={() => updateStatus(a.id, "rejected")}
                    className="flex items-center gap-1 rounded-full border border-sand-200 px-3 py-1.5 text-xs font-semibold text-ocean-950 hover:border-sunset-300 hover:text-sunset-600"
                  >
                    <X size={13} /> Reject
                  </button>
                </div>
              ) : (
                <Badge tone={a.status === "approved" ? "ocean" : "neutral"}>{a.status}</Badge>
              )}
            </div>

            <div className="mt-4 grid gap-2 border-t border-sand-100 pt-4 text-xs text-ocean-950/70 sm:grid-cols-2">
              <p className="flex items-center gap-1.5">
                <User size={12} className="shrink-0 text-ocean-950/40" /> {a.contact}
              </p>
              <a href={a.phone ? `tel:${a.phone}` : undefined} className="flex items-center gap-1.5 hover:text-ocean-700">
                <Phone size={12} className="shrink-0 text-ocean-950/40" /> {a.phone || "No phone given"}
              </a>
              <a href={`mailto:${a.email}`} className="flex items-center gap-1.5 hover:text-ocean-700">
                <Mail size={12} className="shrink-0 text-ocean-950/40" /> {a.email}
              </a>
              <p className="flex items-center gap-1.5">
                <MapPin size={12} className="shrink-0 text-ocean-950/40" /> {a.city || "No city given"}
              </p>
            </div>

            {a.message && (
              <div className="mt-3 rounded-xl bg-sand-50 p-3">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-ocean-950/40">Their pitch</p>
                <p className="text-sm text-ocean-950/70">{a.message}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
