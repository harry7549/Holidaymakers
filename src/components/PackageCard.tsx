import { Link } from "react-router-dom"
import { Scale } from "lucide-react"
import type { Package } from "../data/types"
import { cn, discountPercent, formatPrice } from "../lib/utils"
import { RatingStars } from "./RatingStars"
import { SmartImage } from "./SmartImage"
import { WishlistButton } from "./WishlistButton"
import { useTrip } from "../context/TripContext"

/** One badge, most-notable-first — mirrors the finalized design's single top-left pill. */
function cardBadge(pkg: Package) {
  if (pkg.bestSeller) return "Best seller"
  if (pkg.trending) return "Trending"
  if (pkg.category.includes("Honeymoon")) return "Honeymoon"
  if (pkg.rating >= 4.9) return "Top rated"
  return null
}

export function PackageCard({ pkg, layout = "grid" }: { pkg: Package; layout?: "grid" | "list" }) {
  const { isComparing, toggleCompare } = useTrip()
  const discount = discountPercent(pkg.price, pkg.originalPrice)
  const comparing = isComparing(pkg.id)
  const badge = cardBadge(pkg)

  return (
    <Link
      to={`/package/${pkg.slug}`}
      className={cn(
        "group flex overflow-hidden rounded-2xl bg-surface transition-all duration-300 hover:-translate-y-1 hover:shadow-lift",
        layout === "grid" ? "flex-col" : "flex-col sm:flex-row",
      )}
    >
      <div className={cn("relative shrink-0 overflow-hidden rounded-2xl", layout === "grid" ? "aspect-[4/3] w-full" : "aspect-[4/3] w-full sm:w-64")}>
        <SmartImage
          src={pkg.image}
          alt={pkg.title}
          className="h-full w-full"
          imgClassName="transition-transform duration-500 group-hover:scale-110"
        />
        {badge && (
          <span className="absolute left-3 top-3 rounded-full bg-surface px-2.5 py-1 text-[11px] font-bold text-ocean-950 shadow-sm">
            {badge}
          </span>
        )}
        <div className="absolute right-3 top-3">
          <WishlistButton packageId={pkg.id} />
        </div>
        {discount > 0 && (
          <div className="absolute bottom-3 left-3 rounded-full bg-sunset-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
            {discount}% off
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2 text-xs text-ocean-950/60">
          <span className="truncate">
            {pkg.destinationName} · {pkg.days}D/{pkg.nights}N
          </span>
          <span className="flex shrink-0 items-center gap-1 font-semibold text-ocean-950">
            <RatingStars rating={pkg.rating} size={12} />
            {pkg.rating}
            <span className="font-normal text-ocean-950/50">({pkg.reviewsCount})</span>
          </span>
        </div>

        <h3 className="font-display text-lg font-bold leading-snug text-ocean-950 text-balance">{pkg.title}</h3>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-ocean-950/50">From, per person</span>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-xl font-extrabold tracking-tight text-ocean-950">{formatPrice(pkg.price)}</span>
              {discount > 0 && (
                <span className="text-xs text-ocean-950/40 line-through">{formatPrice(pkg.originalPrice)}</span>
              )}
            </div>
          </div>
          <button
            type="button"
            aria-label={comparing ? "Remove from compare" : "Add to compare"}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggleCompare(pkg.id)
            }}
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors",
              comparing
                ? "border-ocean-600 bg-ocean-600 text-white"
                : "border-sand-200 text-ocean-950/50 hover:border-ocean-300 hover:text-ocean-700",
            )}
          >
            <Scale size={14} />
          </button>
        </div>
      </div>
    </Link>
  )
}
