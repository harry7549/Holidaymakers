import { Star } from "lucide-react"
import { cn } from "../lib/utils"

export function RatingStars({ rating, size = 14, className }: { rating: number; size?: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i + 1 <= Math.round(rating)
        return (
          <Star
            key={i}
            size={size}
            className={filled ? "fill-gold-400 text-gold-400" : "fill-sand-200 text-sand-200"}
          />
        )
      })}
    </div>
  )
}
