import { Heart } from "lucide-react"
import { useTrip } from "../context/TripContext"
import { cn } from "../lib/utils"

export function WishlistButton({ packageId, className }: { packageId: string; className?: string }) {
  const { isWishlisted, toggleWishlist } = useTrip()
  const active = isWishlisted(packageId)

  return (
    <button
      type="button"
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleWishlist(packageId)
      }}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur transition-transform hover:scale-110 active:scale-95",
        className,
      )}
    >
      <Heart size={17} className={active ? "fill-sunset-500 text-sunset-500" : "text-ocean-950/60"} />
    </button>
  )
}
