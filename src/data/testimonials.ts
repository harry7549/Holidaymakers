import type { Testimonial, Deal } from "./types"
import { packages } from "./packages"

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Ananya & Rohit",
    location: "Bengaluru",
    avatarColor: "ocean",
    rating: 5,
    quote:
      "From the first call with our trip expert to the moment we landed back home, everything about our Bali honeymoon felt effortless. The itinerary balanced romance and adventure perfectly.",
    tripName: "Bali Honeymoon Bliss",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "t2",
    name: "The Kapoor Family",
    location: "Delhi",
    avatarColor: "sunset",
    rating: 5,
    quote:
      "We've booked three family trips through Roamly now. The custom trip builder let us mix a houseboat night with a wildlife safari — something no fixed package offered.",
    tripName: "Kashmir Paradise Trail",
    image: "https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "t3",
    name: "Rohan D.",
    location: "Pune",
    avatarColor: "gold",
    rating: 5,
    quote:
      "The Ladakh trip was flawlessly organised for such a remote, high-altitude route. Our supplier partner clearly knew every pass and monastery inside out.",
    tripName: "Manali to Ladakh Adventure",
    image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "t4",
    name: "Ishaan & Kavya",
    location: "Hyderabad",
    avatarColor: "ocean",
    rating: 5,
    quote:
      "Booking our Maldives villa felt like using a premium concierge, not just a website. Transparent pricing, real reviews, and support that actually picked up the phone.",
    tripName: "Maldives Overwater Dream",
    image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=800&q=80",
  },
]

export const deals: Deal[] = [
  {
    id: "deal-1",
    title: "Monsoon Escape Sale",
    subtitle: "Extra savings on Kerala backwater packages",
    discountPercent: 20,
    code: "MONSOON20",
    expiresAt: "2026-09-30T23:59:59",
    image: packages.find((p) => p.id === "pkg-4")!.image,
    packageId: "pkg-4",
  },
  {
    id: "deal-2",
    title: "Early Bird Honeymoon Deal",
    subtitle: "Book your Maldives villa 60 days in advance",
    discountPercent: 15,
    code: "EARLYLOVE15",
    expiresAt: "2026-10-15T23:59:59",
    image: packages.find((p) => p.id === "pkg-7")!.image,
    packageId: "pkg-7",
  },
  {
    id: "deal-3",
    title: "Festive Desert Getaway",
    subtitle: "Dubai packages at flash-sale pricing",
    discountPercent: 18,
    code: "DXBFEST18",
    expiresAt: "2026-10-05T23:59:59",
    image: packages.find((p) => p.id === "pkg-10")!.image,
    packageId: "pkg-10",
  },
]
