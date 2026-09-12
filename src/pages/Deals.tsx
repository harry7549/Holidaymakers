import { Link } from "react-router-dom"
import { Copy, Tag } from "lucide-react"
import { useCatalog } from "../context/CatalogContext"
import { SmartImage } from "../components/SmartImage"
import { CountdownTimer } from "../components/CountdownTimer"
import { Reveal, StaggerGroup, StaggerItem } from "../components/Reveal"
import { formatPrice } from "../lib/utils"
import { useToast } from "../context/ToastContext"

export default function Deals() {
  const { showToast } = useToast()
  const { deals, packages } = useCatalog()

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Reveal className="mb-8 text-center">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-sunset-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-sunset-600">
          <Tag size={13} /> Limited Time
        </span>
        <h1 className="font-display text-2xl font-bold text-ocean-950 sm:text-3xl">Deals & Offers</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-ocean-950/60">
          Hand-picked discounts from our supplier network — book before the timer runs out.
        </p>
      </Reveal>

      <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {deals.map((deal) => {
          const pkg = packages.find((p) => p.id === deal.packageId)
          if (!pkg) return null
          return (
            <StaggerItem key={deal.id} className="overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-card">
              <div className="relative">
                <SmartImage src={deal.image} alt={deal.title} className="aspect-video w-full" />
                <span className="absolute left-3 top-3 rounded-full bg-sunset-500 px-2.5 py-1 text-xs font-bold text-white">
                  {deal.discountPercent}% OFF
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-bold text-ocean-950">{deal.title}</h3>
                <p className="mt-0.5 text-sm text-ocean-950/60">{deal.subtitle}</p>
                <p className="mt-2 text-sm font-semibold text-ocean-950">{pkg.title}</p>
                <p className="text-sm text-ocean-950/50 line-through">{formatPrice(pkg.originalPrice)}</p>

                <div className="my-4">
                  <p className="mb-1.5 text-xs font-semibold text-ocean-950/50">Offer ends in</p>
                  <CountdownTimer target={deal.expiresAt} />
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(deal.code)
                    showToast(`Code ${deal.code} copied!`)
                  }}
                  className="mb-3 flex w-full items-center justify-between rounded-lg border border-dashed border-ocean-300 bg-ocean-50 px-3 py-2 text-sm font-bold text-ocean-700"
                >
                  {deal.code}
                  <Copy size={14} />
                </button>

                <Link to={`/package/${pkg.slug}`} className="block w-full rounded-full bg-ocean-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-ocean-700">
                  Claim This Deal
                </Link>
              </div>
            </StaggerItem>
          )
        })}
      </StaggerGroup>
    </div>
  )
}
