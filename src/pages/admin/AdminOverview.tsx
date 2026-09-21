import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowUpRight,
  BadgeCheck,
  Calendar,
  LayoutDashboard,
  Layers,
  Mail,
  Package as PackageIcon,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { adminList } from "../../lib/adminApi"
import { formatPrice } from "../../lib/utils"
import { AdminPageHeader, AdminSkeletonLines } from "../../components/admin/AdminUI"

interface BookingRow {
  total_price: number
  status: string
  package_title: string
  created_at?: string
}

export default function AdminOverview() {
  const [counts, setCounts] = useState<{
    packages: number
    bookings: number
    revenue: number
    quotes: number
    messages: number
    applications: number
    recentBookings: BookingRow[]
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
        recentBookings: bookings.slice(0, 5),
      })
    }
    load()
  }, [])

  const cards = [
    { label: "Active Packages", value: counts?.packages, to: "/admin/packages", icon: PackageIcon },
    { label: "Total Bookings", value: counts?.bookings, to: "/admin/bookings", icon: Calendar },
    { label: "New Quote Requests", value: counts?.quotes, to: "/admin/quotes", icon: Sparkles },
    { label: "New Messages", value: counts?.messages, to: "/admin/messages", icon: Mail },
    { label: "Pending Partner Applications", value: counts?.applications, to: "/admin/supplier-applications", icon: BadgeCheck },
  ]

  const quickActions = [
    { label: "New Package", to: "/admin/packages", icon: PackageIcon },
    { label: "New Page", to: "/admin/pages", icon: Layers },
    { label: "View Bookings", to: "/admin/bookings", icon: Calendar },
  ]

  return (
    <div>
      <AdminPageHeader icon={LayoutDashboard} title="Overview" subtitle="A quick look at what's happening on your site right now." />

      <div className="mb-6 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ocean-700 via-ocean-800 to-ocean-900 p-6 text-white shadow-[0_16px_40px_-16px_rgba(20,40,70,0.5)]">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sunset-400/20 blur-3xl" />
          <div className="absolute -bottom-16 left-10 h-44 w-44 rounded-full bg-gold-400/15 blur-3xl" />
          <div className="relative">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/60">
              <TrendingUp size={13} /> Total booking revenue
            </p>
            {counts ? (
              <>
                <p className="mt-2 font-display text-4xl font-bold sm:text-5xl">{formatPrice(counts.revenue)}</p>
                <p className="mt-2 text-sm text-white/60">Across {counts.bookings} bookings, all time</p>
              </>
            ) : (
              <div className="mt-3 animate-pulse space-y-2.5">
                <div className="h-10 w-40 rounded bg-white/15 sm:h-12" />
                <div className="h-4 w-48 rounded bg-white/10" />
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-sand-200 bg-surface p-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ocean-950/40">Quick actions</p>
          <div className="flex flex-col gap-2">
            {quickActions.map((a) => (
              <Link
                key={a.label}
                to={a.to}
                className="flex items-center gap-2.5 rounded-xl border border-sand-200 px-3.5 py-2.5 text-sm font-semibold text-ocean-950/80 transition-colors hover:border-ocean-300 hover:bg-ocean-50/50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ocean-50 text-ocean-600">
                  <a.icon size={15} />
                </span>
                {a.label}
                <Plus size={14} className="ml-auto text-ocean-950/30" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="group rounded-2xl border border-sand-200 bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-ocean-200 hover:shadow-card"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-ocean-500 to-ocean-800 text-white">
                <c.icon size={18} />
              </span>
              <ArrowUpRight size={15} className="text-ocean-950/20 transition-colors group-hover:text-ocean-500" />
            </div>
            {c.value === undefined ? (
              <div className="mb-1 h-8 w-10 animate-pulse rounded bg-sand-100" />
            ) : (
              <p className="font-display text-2xl font-bold text-ocean-950">{c.value}</p>
            )}
            <p className="text-sm text-ocean-950/60">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-sand-200 bg-surface p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold text-ocean-950">Recent bookings</p>
          <Link to="/admin/bookings" className="text-xs font-semibold text-ocean-600 hover:text-ocean-700">
            View all →
          </Link>
        </div>
        {!counts ? (
          <AdminSkeletonLines count={4} />
        ) : counts.recentBookings.length === 0 ? (
          <p className="py-6 text-center text-sm text-ocean-950/40">No bookings yet.</p>
        ) : (
          <div className="divide-y divide-sand-100">
            {counts.recentBookings.map((b, i) => (
              <div key={i} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="truncate text-ocean-950/80">{b.package_title}</span>
                <span className="shrink-0 font-semibold text-ocean-950">{formatPrice(b.total_price)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
