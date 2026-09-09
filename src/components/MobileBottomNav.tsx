import { NavLink } from "react-router-dom"
import { Compass, Heart, Home, Sparkles, User } from "lucide-react"
import { cn } from "../lib/utils"
import { useAuth } from "../context/AuthContext"

export function MobileBottomNav() {
  const { user } = useAuth()
  const items = [
    { to: "/", label: "Home", icon: Home, end: true },
    { to: "/explore", label: "Explore", icon: Compass, end: false },
    { to: "/build-trip", label: "Build", icon: Sparkles, end: false },
    { to: "/wishlist", label: "Wishlist", icon: Heart, end: false },
    { to: user ? "/dashboard" : "/login", label: "Account", icon: User, end: false },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-sand-200 bg-white/95 backdrop-blur-md sm:hidden">
      {items.map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium",
              isActive ? "text-ocean-700" : "text-ocean-950/50",
            )
          }
        >
          <item.icon size={19} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
