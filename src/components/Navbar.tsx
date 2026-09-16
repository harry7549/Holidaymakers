import { useState } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { Compass, Heart, Menu, Scale, Search, User, X } from "lucide-react"
import { cn } from "../lib/utils"
import { useTrip } from "../context/TripContext"
import { useAuth } from "../context/AuthContext"

const navLinks = [
  { to: "/explore", label: "Packages" },
  { to: "/destinations", label: "Destinations" },
  { to: "/build-trip", label: "Build Your Trip" },
  { to: "/deals", label: "Deals" },
  { to: "/suppliers", label: "Suppliers" },
  { to: "/about", label: "About" },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { wishlist, compareList } = useTrip()
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 shadow-sm backdrop-blur-md">
      <div className="h-[3px] w-full bg-gradient-to-r from-ocean-600 via-sunset-500 to-gold-400" />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-ocean-500 to-ocean-800 text-white shadow-[0_2px_10px_-2px_rgba(50,69,119,0.6)]">
            <Compass size={19} />
          </span>
          <span className="font-display text-xl font-bold text-ocean-950">Roamly</span>
        </Link>

        <nav className="hidden items-center gap-0.5 rounded-full bg-sand-100/70 p-1 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-white text-ocean-700 shadow-sm" : "text-ocean-950/65 hover:text-ocean-950",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-0.5 rounded-full bg-sand-100/70 p-1 sm:flex">
            <button
              onClick={() => navigate("/explore")}
              aria-label="Search packages"
              className="flex h-9 w-9 items-center justify-center rounded-full text-ocean-950/70 transition-colors hover:bg-white hover:text-ocean-950"
            >
              <Search size={17} />
            </button>
            <Link
              to="/compare"
              aria-label="Compare"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-ocean-950/70 transition-colors hover:bg-white hover:text-ocean-950"
            >
              <Scale size={17} />
              {compareList.length > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-sunset-500 text-[10px] font-bold text-white">
                  {compareList.length}
                </span>
              )}
            </Link>
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-ocean-950/70 transition-colors hover:bg-white hover:text-ocean-950"
            >
              <Heart size={17} />
              {wishlist.length > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-sunset-500 text-[10px] font-bold text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>
          </div>

          {user ? (
            <Link
              to="/dashboard"
              className="hidden items-center gap-2 rounded-full border border-sand-200 py-1.5 pl-1.5 pr-3.5 text-sm font-semibold text-ocean-950 hover:border-ocean-300 sm:flex"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ocean-100 text-ocean-700">
                <User size={14} />
              </span>
              {user.name.split(" ")[0]}
            </Link>
          ) : (
            <Link
              to="/login"
              className="hidden items-center gap-1.5 rounded-full bg-ocean-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ocean-800 sm:flex"
            >
              <User size={14} /> Sign in
            </Link>
          )}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full text-ocean-950/70 hover:bg-sand-100 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-sand-200 bg-white px-4 pb-4 pt-2 lg:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium",
                    isActive ? "bg-ocean-50 text-ocean-700" : "text-ocean-950/70",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to={user ? "/dashboard" : "/login"}
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-lg bg-ocean-950 px-3 py-2.5 text-center text-sm font-semibold text-white"
            >
              {user ? "My Account" : "Sign in / Sign up"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
