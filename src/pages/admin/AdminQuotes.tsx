import { Sparkles } from "lucide-react"
import { useAdminResource } from "../../hooks/useAdminResource"
import { adminUpdate } from "../../lib/adminApi"
import { formatDate, formatPrice } from "../../lib/utils"
import { useToast } from "../../context/ToastContext"

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
      <h1 className="mb-1 flex items-center gap-2 font-display text-2xl font-bold text-ocean-950">
        <Sparkles size={22} /> Custom Trip Quote Requests
      </h1>
      <p className="mb-6 text-sm text-ocean-950/60">Leads from the Trip Builder — reach out and mark their status.</p>

      {loading && <p className="text-sm text-ocean-950/50">Loading...</p>}
      {error && <p className="text-sm text-sunset-600">{error}</p>}
      {!loading && items.length === 0 && !error && (
        <div className="rounded-2xl border border-dashed border-sand-300 py-14 text-center text-sm text-ocean-950/60">
          No quote requests yet.
        </div>
      )}

      <div className="space-y-3">
        {items.map((q) => (
          <div key={q.id} className="rounded-2xl border border-sand-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-base font-bold text-ocean-950">{q.destinations.join(", ") || "Custom trip"}</p>
                <p className="text-xs text-ocean-950/50">
                  {q.days} days · {q.travelers} travelers · {q.style} style · {formatDate(q.created_at)}
                </p>
              </div>
              <select
                value={q.status}
                onChange={(e) => updateStatus(q.id, e.target.value)}
                className="rounded-lg border border-sand-200 px-3 py-2 text-sm font-medium capitalize outline-none focus:border-ocean-400"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ocean-950/70">
              <span>{q.name}</span>
              <span>{q.email}</span>
              <span>{q.phone}</span>
              <span className="font-semibold text-ocean-950">Budget up to {formatPrice(q.budget)}</span>
            </div>
            {q.notes && <p className="mt-2 text-sm text-ocean-950/60">"{q.notes}"</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
