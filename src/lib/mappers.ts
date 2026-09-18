import type { Deal, Destination, Package, PageBlock, PageMeta, Supplier } from "../data/types"

// Rows come straight from Supabase's untyped client — the mappers below are
// the single place that translates the DB's snake_case columns into the
// app's existing camelCase types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any

export function mapDestinationRow(row: Row): Destination {
  return {
    id: row.id,
    name: row.name,
    country: row.country,
    region: row.region,
    image: row.image,
    tagline: row.tagline,
    description: row.description,
    fromPrice: row.from_price,
    packageCount: row.package_count,
    rating: Number(row.rating),
    bestMonths: row.best_months,
    tags: row.tags ?? [],
  }
}

export function mapSupplierRow(row: Row): Supplier {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    location: row.location,
    rating: Number(row.rating),
    packagesCount: row.packages_count,
    verified: row.verified,
    since: row.since,
    specialty: row.specialty,
    logoInitial: row.logo_initial,
    color: row.color,
  }
}

export function mapPackageRow(row: Row): Package {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    destinationId: row.destination_id,
    destinationName: row.destination_name,
    country: row.country,
    region: row.region,
    image: row.image,
    gallery: row.gallery ?? [],
    category: row.category ?? [],
    nights: row.nights,
    days: row.days,
    price: row.price,
    originalPrice: row.original_price,
    costPrice: row.cost_price ?? 0,
    rating: Number(row.rating),
    reviewsCount: row.reviews_count,
    groupSizeMax: row.group_size_max,
    difficulty: row.difficulty,
    hotelRating: row.hotel_rating,
    mealPlan: row.meal_plan,
    transport: row.transport ?? [],
    tags: row.tags ?? [],
    highlights: row.highlights ?? [],
    itinerary: row.itinerary ?? [],
    inclusions: row.inclusions ?? [],
    exclusions: row.exclusions ?? [],
    supplierId: row.supplier_id,
    startDates: row.start_dates ?? [],
    flexible: row.flexible,
    trending: row.trending,
    featured: row.featured,
    bestSeller: row.best_seller,
    reviews: row.reviews ?? [],
    faqs: row.faqs ?? [],
  }
}

export function mapDealRow(row: Row): Deal {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    discountPercent: row.discount_percent,
    code: row.code,
    expiresAt: row.expires_at,
    image: row.image,
    packageId: row.package_id,
  }
}

export function mapPageBlockRow(row: Row): PageBlock {
  return {
    id: row.id,
    page: row.page,
    type: row.type,
    position: row.position,
    visible: row.visible,
    content: row.content ?? {},
  }
}

export function mapPageMetaRow(row: Row): PageMeta {
  return {
    page: row.id,
    title: row.title ?? "",
    description: row.description ?? "",
    ogImage: row.og_image ?? "",
  }
}
