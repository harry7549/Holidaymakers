import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { BadgeCheck, Calendar, Mail, Package as PackageIcon, Sparkles } from "lucide-react"
import { adminList } from "../../lib/adminApi"
import { formatPrice } from "../../lib/utils"

interface BookingRow {
  total_price: number
  status: string
}

export default function AdminOverview() {
  const [counts, setCounts] = useState<{
    packages: number
    bookings: number
    revenue: number
    quotes: number
    messages: number
    applications: number
  } | null>(null)

  useEffect(() => {
    async function load() {
      const [packages, bookings, quotes, messages, applications] = await Promise.all([
        adminList<unknown[]>("packages").catch(() => []),
        adminList<BookingRow[]>("bookings").catch(() => []),
        adminList<{ status: string }[]>("quotes").catch(() => []),
        adminList<{ status: string }[]>("messages").catch(() => []),
        adminList<{ status: string }[]>("supplier-applications").catch(() => []),
      ])
      setCounts({
        packages: packages.length,
        bookings: bookings.length,
        revenue: bookings.reduce((sum, b) => sum + (b.total_price || 0), 0),
        quotes: quotes.filter((q) => q.status === "new").length,
        messages: messages.filter((m) => m.status === "new").length,
        applications: applications.filter((a) => a.status === "new").length,
      })
    }
    load()
  }, [])

  const cards = [
    { label: "Active Packages", value: counts?.packages, to: "/admin/packages", icon: PackageIcon, color: "ocean" },
    { label: "Total Bookings", value: counts?.bookings, to: "/admin/bookings", icon: Calendar, color: "sunset" },
    { label: "New Quote Requests", value: counts?.quotes, to: "/admin/quotes", icon: Sparkles, color: "gold" },
    { label: "New Messages", value: counts?.messages, to: "/admin/messages", icon: Mail, color: "ocean" },
    { label: "Pending Partner Applications", value: counts?.applications, to: "/admin/supplier-applications", icon: BadgeCheck, color: "sunset" },
  ]

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-bold text-ocean-950">Overview</h1>
      <p className="mb-6 text-sm text-ocean-950/60">A quick look at what's happening on your site right now.</p>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="rounded-2xl border border-sand-200 bg-white p-5 transition-shadow hover:shadow-card"
          >
            <span
              className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${
                c.color === "ocean" ? "bg-ocean-50 text-ocean-600" : c.color === "sunset" ? "bg-sunset-50 text-sunset-500" : "bg-gold-400/20 text-gold-600"
              }`}
            >
              <c.icon size={18} />
            </span>
            <p className="font-display text-2xl font-bold text-ocean-950">{c.value ?? "..."}</p>
            <p className="text-sm text-ocean-950/60">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-sand-200 bg-white p-5">
        <p className="text-sm font-semibold text-ocean-950/60">Total Booking Revenue</p>
        <p className="mt-1 font-display text-3xl font-bold text-ocean-950">{counts ? formatPrice(counts.revenue) : "..."}</p>
      </div>
    </div>
  )
}
