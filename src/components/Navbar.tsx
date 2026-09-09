import { useEffect, useState } from "react"
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
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { wishlist, compareList } = useTrip()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled ? "border-b border-sand-200 bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ocean-600 text-white">
            <Compass size={19} />
          </span>
          <span className="font-display text-xl font-bold text-ocean-950">Roamly</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "text-ocean-700" : "text-ocean-950/70 hover:bg-sand-100 hover:text-ocean-950",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => navigate("/explore")}
            aria-label="Search packages"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-ocean-950/70 hover:bg-sand-100 sm:flex"
          >
            <Search size={18} />
          </button>
          <Link
            to="/compare"
            aria-label="Compare"
            className="relative hidden h-10 w-10 items-center justify-center rounded-full text-ocean-950/70 hover:bg-sand-100 sm:flex"
          >
            <Scale size={18} />
            {compareList.length > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-sunset-500 text-[10px] font-bold text-white">
                {compareList.length}
              </span>
            )}
          </Link>
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-ocean-950/70 hover:bg-sand-100"
          >
            <Heart size={18} />
            {wishlist.length > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-sunset-500 text-[10px] font-bold text-white">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link
            to={user ? "/dashboard" : "/login"}
            className="hidden items-center gap-2 rounded-full border border-sand-200 py-1.5 pl-1.5 pr-3.5 text-sm font-semibold text-ocean-950 hover:border-ocean-300 sm:flex"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ocean-100 text-ocean-700">
              <User size={14} />
            </span>
            {user ? user.name.split(" ")[0] : "Sign in"}
          </Link>
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
              className="mt-2 rounded-lg bg-ocean-600 px-3 py-2.5 text-center text-sm font-semibold text-white"
            >
              {user ? "My Account" : "Sign in / Sign up"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
