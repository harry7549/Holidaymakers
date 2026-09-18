import { Calendar } from "lucide-react"
import { useAdminResource } from "../../hooks/useAdminResource"
import { adminUpdate } from "../../lib/adminApi"
import { formatDate, formatPrice, cn } from "../../lib/utils"
import { useToast } from "../../context/ToastContext"
import { AdminPageHeader, AdminEmptyState, AdminErrorNotice, AdminSkeletonRows } from "../../components/admin/AdminUI"

const statusDot: Record<string, string> = {
  upcoming: "bg-gold-500",
  confirmed: "bg-ocean-500",
  completed: "bg-emerald-500",
  cancelled: "bg-sunset-500",
}

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
      <AdminPageHeader icon={Calendar} title="Bookings" subtitle="Every booking made through checkout, newest first." />

      {loading && <AdminSkeletonRows />}
      {error && <AdminErrorNotice resource="bookings" message={error} />}

      {!loading && items.length === 0 && !error && <AdminEmptyState label="No bookings yet." />}

      <div className="space-y-3">
        {items.map((b) => (
          <div
            key={b.id}
            className="rounded-2xl border border-sand-200 bg-white p-4 transition-shadow hover:shadow-card sm:flex sm:items-center sm:justify-between sm:gap-4"
          >
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
              <div className="flex items-center gap-1.5 rounded-lg border border-sand-200 pl-2.5">
                <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", statusDot[b.status] ?? "bg-ocean-950/30")} />
                <select
                  value={b.status}
                  onChange={(e) => updateStatus(b.id, e.target.value)}
                  className="bg-transparent py-2 pr-2.5 text-sm font-medium capitalize outline-none"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
