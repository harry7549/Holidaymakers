import { Link } from "react-router-dom"
import { ArrowUp, Compass, Mail, MapPin, Phone } from "lucide-react"
import { useState } from "react"
import { useToast } from "../context/ToastContext"
import { FacebookIcon, InstagramIcon, XIcon, YoutubeIcon } from "./SocialIcons"
import { getLenis } from "../lib/lenis"

const columns = [
  {
    title: "Explore",
    links: [
      { to: "/explore", label: "All Packages" },
      { to: "/destinations", label: "Destinations" },
      { to: "/build-trip", label: "Build Your Trip" },
      { to: "/deals", label: "Deals & Offers" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About Roamly" },
      { to: "/suppliers", label: "Our Suppliers" },
      { to: "/suppliers", label: "Become a Partner" },
      { to: "/contact", label: "Contact Us" },
    ],
  },
  {
    title: "Support",
    links: [
      { to: "/contact", label: "Help Center" },
      { to: "/dashboard", label: "Manage Booking" },
      { to: "/contact", label: "Cancellation Policy" },
      { to: "/contact", label: "Travel Insurance" },
    ],
  },
]

export function Footer() {
  const [email, setEmail] = useState("")
  const { showToast } = useToast()

  const scrollToTop = () => {
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(0, { duration: 1 })
    else window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="relative overflow-hidden border-t border-sand-200 bg-ocean-950 text-sand-100">
      <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-ocean-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-40 h-96 w-96 rounded-full bg-sunset-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-gold-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-12 grid gap-8 overflow-hidden rounded-3xl bg-gradient-to-br from-sunset-500 to-sunset-700 p-6 sm:p-10 md:grid-cols-[1.3fr_1fr] md:items-center">
          <div>
            <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Get exclusive deals in your <span className="text-accent-serif italic text-gold-200">inbox</span>
            </h3>
            <p className="mt-2 text-sm text-white/85">
              Join 40,000+ travellers getting early access to flash sales and new itineraries.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!email) return
              showToast("Subscribed! Check your inbox for a welcome discount.")
              setEmail("")
            }}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-full border border-white/25 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none backdrop-blur focus:border-white/60"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-ocean-950 px-6 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105"
            >
              Subscribe
            </button>
          </form>
        </div>

        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sunset-400 to-sunset-600 text-white shadow-[0_2px_12px_-2px_rgba(217,96,61,0.6)]">
                <Compass size={20} />
              </span>
              <span className="font-display text-2xl font-bold text-white">Roamly</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-sand-100/60">
              Connecting travellers with 200+ verified offline and online suppliers to craft holidays worth
              remembering — from ready-made packages to fully custom itineraries.
            </p>
            <div className="mt-5 flex gap-3">
              {[FacebookIcon, InstagramIcon, XIcon, YoutubeIcon].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-sunset-500 hover:text-white"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white">
                <span className="h-1 w-4 rounded-full bg-sunset-500" />
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link, i) => (
                  <li key={link.label + i}>
                    <Link to={link.to} className="text-sm text-sand-100/60 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-sand-100/60 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <span className="flex items-center gap-1.5">
              <Phone size={13} /> +91 98765 43210
            </span>
            <span className="flex items-center gap-1.5">
              <Mail size={13} /> hello@roamly.travel
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={13} /> Mumbai, India
            </span>
          </div>
          <div className="flex items-center gap-4">
            <p>© {new Date().getFullYear()} Roamly Holidays. All rights reserved.</p>
            <Link to="/admin/login" className="text-sand-100/40 transition-colors hover:text-white">
              Admin
            </Link>
            <button
              onClick={scrollToTop}
              aria-label="Back to top"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
            >
              <ArrowUp size={15} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
