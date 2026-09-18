export type Category =
  | "Beach"
  | "Adventure"
  | "Honeymoon"
  | "Family"
  | "Hill Station"
  | "Wildlife"
  | "Pilgrimage"
  | "Luxury"
  | "Cruise"
  | "International"

export type SupplierType = "online" | "offline"

export interface Supplier {
  id: string
  name: string
  type: SupplierType
  location: string
  rating: number
  packagesCount: number
  verified: boolean
  since: number
  specialty: string
  logoInitial: string
  color: string
}

export interface ItineraryDay {
  day: number
  title: string
  description: string
  activities: string[]
  image?: string
}

export interface Review {
  id: string
  name: string
  avatarColor: string
  rating: number
  date: string
  title: string
  body: string
  tripType: string
  helpful: number
}

export interface Package {
  id: string
  slug: string
  title: string
  destinationId: string
  destinationName: string
  country: string
  region: string
  image: string
  gallery: string[]
  category: Category[]
  nights: number
  days: number
  price: number
  originalPrice: number
  /** What the supplier charges per traveller — absent on the static demo fallback data. */
  costPrice?: number
  rating: number
  reviewsCount: number
  groupSizeMax: number
  difficulty: "Easy" | "Moderate" | "Challenging"
  hotelRating: 3 | 4 | 5
  mealPlan: string
  transport: string[]
  tags: string[]
  highlights: string[]
  itinerary: ItineraryDay[]
  inclusions: string[]
  exclusions: string[]
  supplierId: string
  startDates: string[]
  flexible: boolean
  trending: boolean
  featured: boolean
  bestSeller: boolean
  reviews: Review[]
  faqs: { q: string; a: string }[]
}

export interface Destination {
  id: string
  name: string
  country: string
  region: "Domestic" | "International"
  image: string
  tagline: string
  description: string
  fromPrice: number
  packageCount: number
  rating: number
  bestMonths: string
  tags: string[]
}

export interface Testimonial {
  id: string
  name: string
  location: string
  avatarColor: string
  rating: number
  quote: string
  tripName: string
  image: string
}

export interface Deal {
  id: string
  title: string
  subtitle: string
  discountPercent: number
  code: string
  expiresAt: string
  image: string
  packageId: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BlockContent = Record<string, any>

export interface PageBlock {
  id: string
  page: string
  type: string
  position: number
  visible: boolean
  content: BlockContent
}

export interface PageMeta {
  page: string
  title: string
  description: string
  ogImage: string
}
