import { Link } from "react-router-dom"
import { Heart } from "lucide-react"
import { useTrip } from "../context/TripContext"
import { packages } from "../data/packages"
import { PackageCard } from "../components/PackageCard"

export default function Wishlist() {
  const { wishlist } = useTrip()
  const items = packages.filter((p) => wishlist.includes(p.id))

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="font-display text-2xl font-bold text-ocean-950 sm:text-3xl">Your Wishlist</h1>
        <p className="mt-1 text-sm text-ocean-950/60">{items.length} package(s) saved</p>
      </div>

      {items.length === 0 ? (
        <div className="mx-auto max-w-md rounded-2xl border border-dashed border-sand-300 py-16 text-center">
          <Heart size={30} className="mx-auto mb-3 text-ocean-950/30" />
          <p className="text-sm font-semibold text-ocean-950">Your wishlist is empty</p>
          <p className="mt-1 text-sm text-ocean-950/60">Tap the heart icon on any package to save it here.</p>
          <Link to="/explore" className="mt-4 inline-block rounded-full bg-ocean-600 px-5 py-2.5 text-sm font-semibold text-white">
            Explore Packages
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <PackageCard key={p.id} pkg={p} />
          ))}
        </div>
      )}
    </div>
  )
}
