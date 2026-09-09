import { useLocation } from "react-router-dom"
import { MessageCircle } from "lucide-react"
import { useTrip } from "../context/TripContext"
import { isPackageDetailRoute, shouldShowCompareBar } from "../lib/bottomBars"
import { cn } from "../lib/utils"

export function WhatsAppButton() {
  const location = useLocation()
  const { compareList } = useTrip()
  // CompareBar has no upper breakpoint cutoff, so once it's active it stays active at every width.
  const compareBarActive = shouldShowCompareBar(location.pathname, compareList.length)
  // The package detail sticky booking bar only renders below the `lg` breakpoint.
  const packageBarActive = isPackageDetailRoute(location.pathname)

  return (
    <a
      href="https://wa.me/919876543210"
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className={cn(
        "fixed right-4 z-40 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#25D366] text-white shadow-lift transition-all hover:scale-110 sm:right-6",
        compareBarActive
          ? "bottom-32 sm:bottom-24"
          : packageBarActive
            ? "bottom-32 sm:bottom-24 lg:bottom-6"
            : "bottom-20 sm:bottom-6",
      )}
    >
      <MessageCircle size={24} fill="white" className="text-[#25D366]" />
    </a>
  )
}
