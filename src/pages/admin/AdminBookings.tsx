import { Link } from "react-router-dom"
import { Calendar, MapPin, TrendingUp, Users } from "lucide-react"
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
  supplier_cost: number
  margin: number
  status: string
  contact_email: string
  contact_phone: string
  client_id: string | null
  geo_city: string
  geo_country: string
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

  const live = items.filter((b) => b.status !== "cancelled")
  const totalRevenue = live.reduce((sum, b) => sum + b.total_price, 0)
  const totalMargin = live.reduce((sum, b) => sum + (b.margin || 0), 0)

  return (
    <div>
      <AdminPageHeader icon={Calendar} title="Bookings" subtitle="Every booking made through checkout, newest first." />

      {!loading && !error && items.length > 0 && (
        <div className="mb-4 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-sand-200 bg-white p-4 text-center">
            <p className="font-display text-2xl font-bold text-ocean-950">{items.length}</p>
            <p className="text-xs text-ocean-950/50">Total bookings</p>
          </div>
          <div className="rounded-2xl border border-sand-200 bg-white p-4 text-center">
            <p className="font-display text-2xl font-bold text-ocean-950">{formatPrice(totalRevenue)}</p>
            <p className="text-xs text-ocean-950/50">Revenue (excl. cancelled)</p>
          </div>
          <div className="rounded-2xl border border-sand-200 bg-white p-4 text-center">
            <p className="flex items-center justify-center gap-1 font-display text-2xl font-bold text-ocean-600">
              <TrendingUp size={16} /> {formatPrice(totalMargin)}
            </p>
            <p className="text-xs text-ocean-950/50">Margin (excl. cancelled)</p>
          </div>
        </div>
      )}

      {loading && <AdminSkeletonRows />}
      {error && <AdminErrorNotice resource="bookings" message={error} />}

      {!loading && items.length === 0 && !error && <AdminEmptyState label="No bookings yet." />}

      <div className="space-y-3">
        {items.map((b) => (
          <div key={b.id} className="rounded-2xl border border-sand-200 bg-white p-4 transition-shadow hover:shadow-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-display text-base font-bold text-ocean-950">{b.package_title}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ocean-950/50">
                  <span>ID {b.id}</span>
                  <span>{b.start_date ? formatDate(b.start_date) : "No date"}</span>
                  <span className="flex items-center gap-1">
                    <Users size={11} /> {b.travelers}
                  </span>
                  {(b.geo_city || b.geo_country) && (
                    <span className="flex items-center gap-1">
                      <MapPin size={11} /> {[b.geo_city, b.geo_country].filter(Boolean).join(", ")}
                    </span>
                  )}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ocean-950/60">
                  <span>
                    {b.contact_email} · {b.contact_phone}
                  </span>
                  {b.client_id && (
                    <Link to={`/admin/clients/${b.client_id}`} className="font-semibold text-ocean-600 hover:text-ocean-700">
                      View in CRM →
                    </Link>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3 sm:shrink-0">
                <div className="text-right">
                  <p className="font-display text-lg font-bold text-ocean-950">{formatPrice(b.total_price)}</p>
                  {b.margin > 0 && <p className="text-xs text-ocean-600">+{formatPrice(b.margin)} margin</p>}
                </div>
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
          </div>
        ))}
      </div>
    </div>
  )
}
