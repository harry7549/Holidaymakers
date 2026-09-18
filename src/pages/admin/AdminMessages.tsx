import { Link } from "react-router-dom"
import { Mail, MapPin } from "lucide-react"
import { useAdminResource } from "../../hooks/useAdminResource"
import { adminUpdate } from "../../lib/adminApi"
import { cn, formatDate } from "../../lib/utils"
import { useToast } from "../../context/ToastContext"
import { AdminPageHeader, AdminEmptyState, AdminErrorNotice, AdminSkeletonRows, Badge } from "../../components/admin/AdminUI"

interface MessageRow {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: string
  client_id: string | null
  geo_city: string
  geo_country: string
  created_at: string
}

export default function AdminMessages() {
  const { items, setItems, loading, error } = useAdminResource<MessageRow>("messages")
  const { showToast } = useToast()

  const updateStatus = async (id: string, status: string) => {
    try {
      const updated = await adminUpdate<MessageRow>("messages", id, { status })
      setItems((prev) => prev.map((m) => (m.id === id ? updated : m)))
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update", "info")
    }
  }

  return (
    <div>
      <AdminPageHeader icon={Mail} title="Contact Messages" subtitle="Messages submitted through the Contact page." />

      {loading && <AdminSkeletonRows />}
      {error && <AdminErrorNotice resource="messages" message={error} />}
      {!loading && items.length === 0 && !error && <AdminEmptyState label="No messages yet." />}

      <div className="space-y-3">
        {items.map((m) => (
          <div key={m.id} className={cn("rounded-2xl border bg-surface p-4", m.status === "new" ? "border-ocean-300" : "border-sand-200")}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-ocean-500 to-ocean-800 font-display text-sm font-bold text-white">
                  {m.name.charAt(0).toUpperCase() || "?"}
                </span>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-display text-base font-bold text-ocean-950">
                    {m.subject || "(No subject)"}
                    {m.status === "new" && <Badge tone="sunset">New</Badge>}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ocean-950/50">
                    <span className="font-medium text-ocean-950/70">{m.name}</span>
                    <a href={`mailto:${m.email}`} className="hover:text-ocean-700">
                      {m.email}
                    </a>
                    <span>{formatDate(m.created_at)}</span>
                    {(m.geo_city || m.geo_country) && (
                      <span className="flex items-center gap-1">
                        <MapPin size={11} /> {[m.geo_city, m.geo_country].filter(Boolean).join(", ")}
                      </span>
                    )}
                    {m.client_id && (
                      <Link to={`/admin/clients/${m.client_id}`} className="font-semibold text-ocean-600 hover:text-ocean-700">
                        View in CRM →
                      </Link>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                {m.status !== "read" && m.status !== "replied" && (
                  <button onClick={() => updateStatus(m.id, "read")} className="rounded-full border border-sand-200 px-3 py-1.5 text-xs font-semibold text-ocean-950">
                    Mark read
                  </button>
                )}
                {m.status !== "replied" && (
                  <button onClick={() => updateStatus(m.id, "replied")} className="rounded-full bg-ocean-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-ocean-700">
                    Mark replied
                  </button>
                )}
                {m.status === "replied" && <Badge tone="ocean">Replied</Badge>}
              </div>
            </div>
            <div className="mt-3 rounded-xl bg-sand-50 p-3">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-ocean-950/40">Their message</p>
              <p className="text-sm text-ocean-950/70">{m.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
