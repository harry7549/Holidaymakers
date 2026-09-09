import { Link } from "react-router-dom"
import { Compass, Mail, MapPin, Phone } from "lucide-react"
import { useState } from "react"
import { useToast } from "../context/ToastContext"
import { FacebookIcon, InstagramIcon, XIcon, YoutubeIcon } from "./SocialIcons"

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

  return (
    <footer className="border-t border-sand-200 bg-ocean-950 text-sand-100">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-12 grid gap-10 rounded-2xl bg-ocean-900/60 p-6 sm:p-8 md:grid-cols-[1.3fr_1fr] md:items-center">
          <div>
            <h3 className="font-display text-2xl font-bold text-white">Get exclusive deals in your inbox</h3>
            <p className="mt-1 text-sm text-sand-100/70">
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
              className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-sand-100/40 outline-none focus:border-sunset-400"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-sunset-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sunset-600"
            >
              Subscribe
            </button>
          </form>
        </div>

        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sunset-500 text-white">
                <Compass size={19} />
              </span>
              <span className="font-display text-xl font-bold text-white">Roamly</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-sand-100/60">
              Roamly connects travellers with 200+ verified offline and online suppliers to craft holidays worth
              remembering — from ready-made packages to fully custom itineraries.
            </p>
            <div className="mt-4 flex gap-3">
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
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/90">{col.title}</h4>
              <ul className="space-y-2">
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
          <p>© {new Date().getFullYear()} Roamly Holidays. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
