import { Link, Navigate, useParams } from "react-router-dom"
import { Calendar, MapPin, Star } from "lucide-react"
import { getPackagesByDestination } from "../lib/catalogHelpers"
import { useCatalog } from "../context/CatalogContext"
import { ParallaxBanner } from "../components/ParallaxBanner"
import { PackageCard } from "../components/PackageCard"
import { Reveal, StaggerGroup, StaggerItem } from "../components/Reveal"
import { formatPrice } from "../lib/utils"

export default function DestinationDetail() {
  const { id } = useParams()
  const { destinations, packages } = useCatalog()
  const destination = destinations.find((d) => d.id === id)
  const relatedPackages = id ? getPackagesByDestination(packages, id) : []

  if (!destination) return <Navigate to="/destinations" replace />

  return (
    <div>
      <ParallaxBanner image={destination.image} alt={destination.name} className="h-72 sm:h-96">
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur">
            {destination.region}
          </span>
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">{destination.name}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-white/80">
            <MapPin size={14} /> {destination.country}
          </p>
        </div>
      </ParallaxBanner>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <div>
            <Reveal>
              <p className="mb-6 text-base text-ocean-950/70">{destination.description}</p>
              <h2 className="mb-4 font-display text-xl font-bold text-ocean-950">
                {relatedPackages.length} Packages for {destination.name}
              </h2>
            </Reveal>
            {relatedPackages.length === 0 ? (
              <p className="text-sm text-ocean-950/60">No fixed packages yet — try our Trip Builder to create a custom itinerary here.</p>
            ) : (
              <StaggerGroup className="grid gap-5 sm:grid-cols-2">
                {relatedPackages.map((p) => (
                  <StaggerItem key={p.id}>
                    <PackageCard pkg={p} />
                  </StaggerItem>
                ))}
              </StaggerGroup>
            )}
          </div>
          <Reveal delay={0.1} className="lg:sticky lg:top-20 lg:h-fit">
            <div className="rounded-2xl border border-sand-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-ocean-950/60">Rating</span>
                <span className="flex items-center gap-1 text-sm font-bold text-ocean-950">
                  <Star size={14} className="fill-gold-400 text-gold-400" /> {destination.rating}
                </span>
              </div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-ocean-950/60">Best time to visit</span>
                <span className="flex items-center gap-1 text-sm font-bold text-ocean-950">
                  <Calendar size={13} /> {destination.bestMonths}
                </span>
              </div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-ocean-950/60">Starting from</span>
                <span className="font-display text-lg font-bold text-ocean-950">{formatPrice(destination.fromPrice)}</span>
              </div>
              <div className="mb-5 flex flex-wrap gap-1.5">
                {destination.tags.map((t) => (
                  <span key={t} className="rounded-full bg-ocean-50 px-2.5 py-1 text-xs font-medium text-ocean-700">
                    {t}
                  </span>
                ))}
              </div>
              <Link to="/build-trip" className="block w-full rounded-full bg-sunset-500 py-3 text-center text-sm font-bold text-white hover:bg-sunset-600">
                Customize a Trip Here
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  )
}
