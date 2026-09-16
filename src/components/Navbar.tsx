import { useEffect, useState } from "react"
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom"
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

// Routes whose first block is always a full-bleed dark hero/banner — safe to
// float a transparent glass navbar over, since there's guaranteed contrast
// behind it at the very top of the page.
function isHeroRoute(pathname: string) {
  if (pathname === "/" || pathname === "/about" || pathname === "/contact") return true
  if (pathname.startsWith("/destinations/") && pathname !== "/destinations/") return true
  return false
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { wishlist, compareList } = useTrip()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [pathname])

  const glass = isHeroRoute(pathname) && !scrolled

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-colors duration-300",
        glass ? "border-b border-white/10 bg-white/10 backdrop-blur-xl" : "bg-white/95 shadow-sm backdrop-blur-md",
      )}
    >
      <div className="h-[3px] w-full bg-gradient-to-r from-ocean-600 via-sunset-500 to-gold-400" />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-ocean-500 to-ocean-800 text-white shadow-[0_2px_10px_-2px_rgba(50,69,119,0.6)]">
            <Compass size={19} />
          </span>
          <span className={cn("font-display text-xl font-bold transition-colors", glass ? "text-white" : "text-ocean-950")}>Roamly</span>
        </Link>

        <nav className={cn("hidden items-center gap-0.5 rounded-full p-1 transition-colors lg:flex", glass ? "bg-white/10" : "bg-sand-100/70")}>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white text-ocean-700 shadow-sm"
                    : glass
                      ? "text-white/80 hover:text-white"
                      : "text-ocean-950/65 hover:text-ocean-950",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className={cn("hidden items-center gap-0.5 rounded-full p-1 transition-colors sm:flex", glass ? "bg-white/10" : "bg-sand-100/70")}>
            <button
              onClick={() => navigate("/explore")}
              aria-label="Search packages"
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white",
                glass ? "text-white/85 hover:text-ocean-950" : "text-ocean-950/70 hover:text-ocean-950",
              )}
            >
              <Search size={17} />
            </button>
            <Link
              to="/compare"
              aria-label="Compare"
              className={cn(
                "relative flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white",
                glass ? "text-white/85 hover:text-ocean-950" : "text-ocean-950/70 hover:text-ocean-950",
              )}
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
              className={cn(
                "relative flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white",
                glass ? "text-white/85 hover:text-ocean-950" : "text-ocean-950/70 hover:text-ocean-950",
              )}
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
              className={cn(
                "hidden items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3.5 text-sm font-semibold sm:flex",
                glass ? "border-white/25 text-white hover:border-white/50" : "border-sand-200 text-ocean-950 hover:border-ocean-300",
              )}
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
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full transition-colors lg:hidden",
              glass ? "text-white hover:bg-white/10" : "text-ocean-950/70 hover:bg-sand-100",
            )}
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
