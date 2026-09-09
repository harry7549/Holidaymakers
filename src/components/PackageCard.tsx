import { Link } from "react-router-dom"
import { Clock, MapPin, Scale, Sparkles } from "lucide-react"
import type { Package } from "../data/types"
import { cn, discountPercent, formatPrice } from "../lib/utils"
import { RatingStars } from "./RatingStars"
import { SmartImage } from "./SmartImage"
import { WishlistButton } from "./WishlistButton"
import { useTrip } from "../context/TripContext"

export function PackageCard({ pkg, layout = "grid" }: { pkg: Package; layout?: "grid" | "list" }) {
  const { isComparing, toggleCompare } = useTrip()
  const discount = discountPercent(pkg.price, pkg.originalPrice)
  const comparing = isComparing(pkg.id)

  return (
    <Link
      to={`/package/${pkg.slug}`}
      className={cn(
        "group relative flex overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift",
        layout === "grid" ? "flex-col" : "flex-col sm:flex-row",
      )}
    >
      <div className={cn("relative shrink-0 overflow-hidden", layout === "grid" ? "aspect-[4/3] w-full" : "aspect-[4/3] w-full sm:w-64")}>
        <SmartImage
          src={pkg.image}
          alt={pkg.title}
          className="h-full w-full"
          imgClassName="transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <div className="flex flex-wrap gap-1.5">
            {pkg.bestSeller && (
              <span className="rounded-full bg-sunset-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
                Bestseller
              </span>
            )}
            {pkg.trending && !pkg.bestSeller && (
              <span className="flex items-center gap-1 rounded-full bg-ocean-950/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
                <Sparkles size={11} /> Trending
              </span>
            )}
          </div>
          <WishlistButton packageId={pkg.id} />
        </div>
        {discount > 0 && (
          <div className="absolute bottom-3 left-3 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-sunset-600 shadow-sm">
            {discount}% OFF
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-ocean-600">
          <MapPin size={13} />
          {pkg.destinationName}, {pkg.country}
        </div>
        <h3 className="mb-1.5 font-display text-lg font-semibold leading-snug text-ocean-950 text-balance">
          {pkg.title}
        </h3>
        <div className="mb-2 flex items-center gap-2">
          <RatingStars rating={pkg.rating} />
          <span className="text-xs text-ocean-950/60">
            {pkg.rating} ({pkg.reviewsCount})
          </span>
        </div>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {pkg.category.slice(0, 2).map((c) => (
            <span key={c} className="rounded-full bg-ocean-50 px-2 py-0.5 text-[11px] font-medium text-ocean-700">
              {c}
            </span>
          ))}
          <span className="flex items-center gap-1 rounded-full bg-sand-100 px-2 py-0.5 text-[11px] font-medium text-ocean-950/70">
            <Clock size={11} />
            {pkg.days}D/{pkg.nights}N
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              {discount > 0 && (
                <span className="text-xs text-ocean-950/40 line-through">{formatPrice(pkg.originalPrice)}</span>
              )}
            </div>
            <div className="font-display text-xl font-bold text-ocean-950">
              {formatPrice(pkg.price)}
              <span className="ml-1 text-xs font-normal text-ocean-950/50">/ person</span>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggleCompare(pkg.id)
            }}
            className={cn(
              "flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors",
              comparing
                ? "border-ocean-600 bg-ocean-600 text-white"
                : "border-sand-200 text-ocean-950/60 hover:border-ocean-300 hover:text-ocean-700",
            )}
          >
            <Scale size={13} />
            Compare
          </button>
        </div>
      </div>
    </Link>
  )
}
