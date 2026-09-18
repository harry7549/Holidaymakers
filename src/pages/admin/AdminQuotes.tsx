import { Link } from "react-router-dom"
import { Mail, MapPin, Phone, Sparkles } from "lucide-react"
import { useAdminResource } from "../../hooks/useAdminResource"
import { adminUpdate } from "../../lib/adminApi"
import { formatDate, formatPrice } from "../../lib/utils"
import { useToast } from "../../context/ToastContext"
import { AdminPageHeader, AdminEmptyState, AdminErrorNotice, AdminSkeletonRows, Badge } from "../../components/admin/AdminUI"

interface QuoteRow {
  id: string
  destinations: string[]
  days: number
  travelers: number
  budget: number
  style: string
  name: string
  email: string
  phone: string
  notes: string
  status: string
  client_id: string | null
  geo_city: string
  geo_country: string
  created_at: string
}

const statusOptions = ["new", "contacted", "closed"]

export default function AdminQuotes() {
  const { items, setItems, loading, error } = useAdminResource<QuoteRow>("quotes")
  const { showToast } = useToast()

  const updateStatus = async (id: string, status: string) => {
    try {
      const updated = await adminUpdate<QuoteRow>("quotes", id, { status })
      setItems((prev) => prev.map((q) => (q.id === id ? updated : q)))
      showToast("Status updated")
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update", "info")
    }
  }

  return (
    <div>
      <AdminPageHeader icon={Sparkles} title="Custom Trip Quote Requests" subtitle="Leads from the Trip Builder — reach out and mark their status." />

      {loading && <AdminSkeletonRows />}
      {error && <AdminErrorNotice resource="quote requests" message={error} />}
      {!loading && items.length === 0 && !error && <AdminEmptyState label="No quote requests yet." />}

      <div className="space-y-3">
        {items.map((q) => (
          <div key={q.id} className="rounded-2xl border border-sand-200 bg-white p-4 transition-shadow hover:shadow-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-ocean-500 to-ocean-800 font-display text-sm font-bold text-white">
                  {q.name.charAt(0).toUpperCase() || "?"}
                </span>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-display text-base font-bold text-ocean-950">
                    {q.destinations.join(", ") || "Custom trip"}
                    {q.status === "new" && <Badge tone="sunset">New</Badge>}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ocean-950/50">
                    <span>{q.name}</span>
                    <span>
                      {q.days} days · {q.travelers} travelers · {q.style} style
                    </span>
                    <span>{formatDate(q.created_at)}</span>
                    {(q.geo_city || q.geo_country) && (
                      <span className="flex items-center gap-1">
                        <MapPin size={11} /> {[q.geo_city, q.geo_country].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <select
                value={q.status}
                onChange={(e) => updateStatus(q.id, e.target.value)}
                className="shrink-0 rounded-lg border border-sand-200 px-3 py-2 text-sm font-medium capitalize outline-none focus:border-ocean-400"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-sand-100 pt-3 text-sm text-ocean-950/70">
              <a href={`mailto:${q.email}`} className="flex items-center gap-1.5 hover:text-ocean-700">
                <Mail size={13} className="text-ocean-950/40" /> {q.email}
              </a>
              <a href={`tel:${q.phone}`} className="flex items-center gap-1.5 hover:text-ocean-700">
                <Phone size={13} className="text-ocean-950/40" /> {q.phone}
              </a>
              <span className="font-semibold text-ocean-950">Budget up to {formatPrice(q.budget)}</span>
              {q.client_id && (
                <Link to={`/admin/clients?open=${q.client_id}`} className="font-semibold text-ocean-600 hover:text-ocean-700">
                  View in CRM →
                </Link>
              )}
            </div>
            {q.notes && <p className="mt-2 text-sm text-ocean-950/60">"{q.notes}"</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
