import { createContext, useContext, useEffect, type ReactNode } from "react"
import { useLocalStorage } from "../hooks/useLocalStorage"
import { useToast } from "./ToastContext"
import { useAuth } from "./AuthContext"
import { supabaseCustomer, supabaseConfigured } from "../lib/supabaseClient"

export interface Traveler {
  name: string
  age: string
}

export interface Booking {
  id: string
  packageId: string
  packageTitle: string
  image: string
  startDate: string
  travelers: number
  addOns: string[]
  totalPrice: number
  status: "confirmed" | "upcoming" | "completed"
  createdAt: string
  travelerDetails: Traveler[]
  contactEmail: string
  contactPhone: string
}

export interface CustomQuoteRequest {
  id: string
  destinations: string[]
  days: number
  travelers: number
  budget: number
  style: string
  addOns: string[]
  name: string
  email: string
  phone: string
  notes: string
  createdAt: string
}

interface TripContextValue {
  wishlist: string[]
  toggleWishlist: (packageId: string) => void
  isWishlisted: (packageId: string) => boolean
  compareList: string[]
  toggleCompare: (packageId: string) => void
  isComparing: (packageId: string) => boolean
  clearCompare: () => void
  bookings: Booking[]
  addBooking: (booking: Booking) => void
  quoteRequests: CustomQuoteRequest[]
  addQuoteRequest: (req: CustomQuoteRequest) => void
}

const TripContext = createContext<TripContextValue | undefined>(undefined)

const MAX_COMPARE = 3

export function TripProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useLocalStorage<string[]>("roamly:wishlist", [])
  const [compareList, setCompareList] = useLocalStorage<string[]>("roamly:compare", [])
  const [bookings, setBookings] = useLocalStorage<Booking[]>("roamly:bookings", [])
  const [quoteRequests, setQuoteRequests] = useLocalStorage<CustomQuoteRequest[]>("roamly:quotes", [])
  const { showToast } = useToast()
  const { user } = useAuth()

  // When a customer signs in, pull their server-side wishlist and push up
  // any locally-saved (anonymous) items so nothing saved before login is lost.
  useEffect(() => {
    if (!user || !supabaseConfigured) return
    let cancelled = false
    supabaseCustomer
      .from("wishlist_items")
      .select("package_id")
      .eq("user_id", user.id)
      .then(async ({ data }) => {
        if (cancelled) return
        const serverIds = (data ?? []).map((r) => r.package_id as string)
        const localOnly = wishlist.filter((id) => !serverIds.includes(id))
        if (localOnly.length > 0) {
          await supabaseCustomer.from("wishlist_items").insert(localOnly.map((package_id) => ({ user_id: user.id, package_id })))
        }
        if (!cancelled) setWishlist([...new Set([...serverIds, ...localOnly])])
      })
    return () => {
      cancelled = true
    }
    // Only re-run when the signed-in user changes, not on every wishlist edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const toggleWishlist = (packageId: string) => {
    setWishlist((prev) => {
      const has = prev.includes(packageId)
      if (user && supabaseConfigured) {
        const query = has
          ? supabaseCustomer.from("wishlist_items").delete().eq("user_id", user.id).eq("package_id", packageId)
          : supabaseCustomer.from("wishlist_items").insert({ user_id: user.id, package_id: packageId })
        query.then(({ error }) => error && console.error("wishlist sync failed", error))
      }
      if (has) {
        showToast("Removed from wishlist", "info")
        return prev.filter((id) => id !== packageId)
      }
      showToast("Added to wishlist")
      return [...prev, packageId]
    })
  }

  const toggleCompare = (packageId: string) => {
    setCompareList((prev) => {
      if (prev.includes(packageId)) return prev.filter((id) => id !== packageId)
      if (prev.length >= MAX_COMPARE) {
        showToast(`You can compare up to ${MAX_COMPARE} packages at once`, "info")
        return prev
      }
      showToast("Added to compare")
      return [...prev, packageId]
    })
  }

  const clearCompare = () => setCompareList([])

  const addBooking = (booking: Booking) => {
    setBookings((prev) => [booking, ...prev])
  }

  const addQuoteRequest = (req: CustomQuoteRequest) => {
    setQuoteRequests((prev) => [req, ...prev])
  }

  return (
    <TripContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isWishlisted: (id) => wishlist.includes(id),
        compareList,
        toggleCompare,
        isComparing: (id) => compareList.includes(id),
        clearCompare,
        bookings,
        addBooking,
        quoteRequests,
        addQuoteRequest,
      }}
    >
      {children}
    </TripContext.Provider>
  )
}

export function useTrip() {
  const ctx = useContext(TripContext)
  if (!ctx) throw new Error("useTrip must be used within TripProvider")
  return ctx
}
