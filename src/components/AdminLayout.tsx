import { NavLink, Outlet } from "react-router-dom"
import {
  BadgeCheck,
  Calendar,
  Compass,
  Globe2,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Package as PackageIcon,
  Percent,
  Sparkles,
  X,
} from "lucide-react"
import { useState } from "react"
import { useAdminAuth } from "../context/AdminAuthContext"
import { useCatalog } from "../context/CatalogContext"
import { cn } from "../lib/utils"

const navItems = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/packages", label: "Packages", icon: PackageIcon },
  { to: "/admin/destinations", label: "Destinations", icon: MapPin },
  { to: "/admin/suppliers", label: "Suppliers", icon: Globe2 },
  { to: "/admin/deals", label: "Deals", icon: Percent },
  { to: "/admin/bookings", label: "Bookings", icon: Calendar },
  { to: "/admin/quotes", label: "Quote Requests", icon: Sparkles },
  { to: "/admin/messages", label: "Messages", icon: Mail },
  { to: "/admin/supplier-applications", label: "Partner Applications", icon: BadgeCheck },
]

export function AdminLayout() {
  const { signOut } = useAdminAuth()
  const { usingLiveData } = useCatalog()
  const [mobileOpen, setMobileOpen] = useState(false)

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive ? "bg-ocean-600 text-white" : "text-ocean-950/70 hover:bg-sand-100",
            )
          }
        >
          <item.icon size={16} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="flex min-h-svh bg-sand-50">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sand-200 bg-white lg:flex">
        <div className="flex items-center gap-2 border-b border-sand-200 p-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ocean-600 text-white">
            <Compass size={16} />
          </span>
          <span className="font-display text-lg font-bold text-ocean-950">Roamly Admin</span>
        </div>
        {nav}
        <div className="border-t border-sand-200 p-3">
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-ocean-950/70 hover:bg-sand-100"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-sand-200 bg-white px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ocean-600 text-white">
              <Compass size={16} />
            </span>
            <span className="font-display text-base font-bold text-ocean-950">Roamly Admin</span>
          </div>
          <button onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>
        {mobileOpen && (
          <div className="border-b border-sand-200 bg-white lg:hidden">
            {nav}
            <div className="border-t border-sand-200 p-3">
              <button
                onClick={signOut}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-ocean-950/70 hover:bg-sand-100"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </div>
        )}

        {!usingLiveData && (
          <div className="bg-gold-400/20 px-4 py-2 text-center text-xs font-medium text-ocean-950">
            Showing demo data — connect Supabase (see README) so your changes here actually save.
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
