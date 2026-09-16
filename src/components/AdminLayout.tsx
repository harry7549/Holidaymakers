import { NavLink, Outlet, Link } from "react-router-dom"
import {
  AlertTriangle,
  BadgeCheck,
  Calendar,
  Compass,
  ExternalLink,
  Globe2,
  Layers,
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
import { useState, type ComponentType } from "react"
import { useAdminAuth } from "../context/AdminAuthContext"
import { useCatalog } from "../context/CatalogContext"
import { cn } from "../lib/utils"

interface NavItem {
  to: string
  label: string
  icon: ComponentType<{ size?: number | string; className?: string }>
  end?: boolean
}

const navGroups: { heading: string; items: NavItem[] }[] = [
  {
    heading: "",
    items: [{ to: "/admin", label: "Overview", icon: LayoutDashboard, end: true }],
  },
  {
    heading: "Content",
    items: [{ to: "/admin/pages", label: "Pages", icon: Layers }],
  },
  {
    heading: "Catalogue",
    items: [
      { to: "/admin/packages", label: "Packages", icon: PackageIcon },
      { to: "/admin/destinations", label: "Destinations", icon: MapPin },
      { to: "/admin/suppliers", label: "Suppliers", icon: Globe2 },
      { to: "/admin/deals", label: "Deals", icon: Percent },
    ],
  },
  {
    heading: "Inbox",
    items: [
      { to: "/admin/bookings", label: "Bookings", icon: Calendar },
      { to: "/admin/quotes", label: "Quote Requests", icon: Sparkles },
      { to: "/admin/messages", label: "Messages", icon: Mail },
      { to: "/admin/supplier-applications", label: "Partner Applications", icon: BadgeCheck },
    ],
  },
]

function Brand() {
  return (
    <Link to="/admin" className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-ocean-500 to-ocean-800 text-white shadow-[0_2px_10px_-2px_rgba(50,69,119,0.6)]">
        <Compass size={17} />
      </span>
      <div className="leading-tight">
        <p className="font-display text-base font-bold text-ocean-950">Roamly</p>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-ocean-950/40">Admin</p>
      </div>
    </Link>
  )
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
      {navGroups.map((group, i) => (
        <div key={i}>
          {group.heading && <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-ocean-950/35">{group.heading}</p>}
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gradient-to-r from-ocean-600 to-ocean-700 text-white shadow-[0_2px_10px_-2px_rgba(50,69,119,0.5)]"
                      : "text-ocean-950/65 hover:bg-sand-100 hover:text-ocean-950",
                  )
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}

export function AdminLayout() {
  const { signOut } = useAdminAuth()
  const { usingLiveData } = useCatalog()
  const [mobileOpen, setMobileOpen] = useState(false)

  const footer = (
    <div className="border-t border-sand-200 p-3">
      <a
        href="/"
        target="_blank"
        rel="noreferrer"
        className="mb-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ocean-950/65 hover:bg-sand-100 hover:text-ocean-950"
      >
        <ExternalLink size={16} />
        View live site
      </a>
      <button
        onClick={signOut}
        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ocean-950/65 hover:bg-sunset-50 hover:text-sunset-600"
      >
        <LogOut size={16} />
        Sign out
      </button>
    </div>
  )

  return (
    <div className="flex min-h-svh bg-sand-50">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sand-200 bg-white lg:flex">
        <div className="relative border-b border-sand-200 p-4">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-ocean-600 via-sunset-500 to-gold-400" />
          <Brand />
        </div>
        <NavList />
        {footer}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="relative flex items-center justify-between border-b border-sand-200 bg-white px-4 py-3 lg:hidden">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-ocean-600 via-sunset-500 to-gold-400" />
          <Brand />
          <button onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu" className="rounded-lg p-1.5 text-ocean-950/70 hover:bg-sand-100">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>
        {mobileOpen && (
          <div className="flex max-h-[70vh] flex-col border-b border-sand-200 bg-white lg:hidden">
            <NavList onNavigate={() => setMobileOpen(false)} />
            {footer}
          </div>
        )}

        {!usingLiveData && (
          <div className="flex items-center justify-center gap-2 bg-gold-400/15 px-4 py-2 text-center text-xs font-medium text-ocean-950">
            <AlertTriangle size={13} className="shrink-0 text-gold-700" />
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
