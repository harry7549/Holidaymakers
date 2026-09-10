import { Calendar } from "lucide-react"
import { useAdminResource } from "../../hooks/useAdminResource"
import { adminUpdate } from "../../lib/adminApi"
import { formatDate, formatPrice } from "../../lib/utils"
import { useToast } from "../../context/ToastContext"

interface BookingRow {
  id: string
  package_title: string
  start_date: string | null
  travelers: number
  total_price: number
  status: string
  contact_email: string
  contact_phone: string
  created_at: string
}

const statusOptions = ["upcoming", "confirmed", "completed", "cancelled"]

export default function AdminBookings() {
  const { items, setItems, loading, error } = useAdminResource<BookingRow>("bookings")
  const { showToast } = useToast()

  const updateStatus = async (id: string, status: string) => {
    try {
      const updated = await adminUpdate<BookingRow>("bookings", id, { status })
      setItems((prev) => prev.map((b) => (b.id === id ? updated : b)))
      showToast("Booking status updated")
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update", "info")
    }
  }

  return (
    <div>
      <h1 className="mb-1 flex items-center gap-2 font-display text-2xl font-bold text-ocean-950">
        <Calendar size={22} /> Bookings
      </h1>
      <p className="mb-6 text-sm text-ocean-950/60">Every booking made through checkout, newest first.</p>

      {loading && <p className="text-sm text-ocean-950/50">Loading...</p>}
      {error && <p className="text-sm text-sunset-600">{error}</p>}

      {!loading && items.length === 0 && !error && (
        <div className="rounded-2xl border border-dashed border-sand-300 py-14 text-center text-sm text-ocean-950/60">
          No bookings yet.
        </div>
      )}

      <div className="space-y-3">
        {items.map((b) => (
          <div key={b.id} className="rounded-2xl border border-sand-200 bg-white p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <p className="font-display text-base font-bold text-ocean-950">{b.package_title}</p>
              <p className="text-xs text-ocean-950/50">
                ID {b.id} · {b.start_date ? formatDate(b.start_date) : "No date"} · {b.travelers} travelers
              </p>
              <p className="mt-1 text-xs text-ocean-950/60">
                {b.contact_email} · {b.contact_phone}
              </p>
            </div>
            <div className="mt-3 flex items-center gap-3 sm:mt-0 sm:shrink-0">
              <span className="font-display text-lg font-bold text-ocean-950">{formatPrice(b.total_price)}</span>
              <select
                value={b.status}
                onChange={(e) => updateStatus(b.id, e.target.value)}
                className="rounded-lg border border-sand-200 px-3 py-2 text-sm font-medium capitalize outline-none focus:border-ocean-400"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
