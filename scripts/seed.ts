// One-time (idempotent) migration: pushes the demo catalogue that used to be
// hardcoded in src/data/*.ts into your Supabase project.
//
// Usage (after running supabase/schema.sql in the Supabase SQL editor):
//   SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=xxxx npx tsx scripts/seed.ts
//
// Get both values from Supabase Dashboard → Project Settings → API.
// Never commit the service-role key or put it in a VITE_ env var.

import { createClient } from "@supabase/supabase-js"
import { destinations } from "../src/data/destinations"
import { packages } from "../src/data/packages"
import { suppliers } from "../src/data/suppliers"
import { deals } from "../src/data/testimonials"

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.")
  console.error("Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed.ts")
  process.exit(1)
}

const supabase = createClient(url, key)

async function run() {
  console.log(`Seeding ${destinations.length} destinations...`)
  const { error: destErr } = await supabase.from("destinations").upsert(
    destinations.map((d) => ({
      id: d.id,
      name: d.name,
      country: d.country,
      region: d.region,
      image: d.image,
      tagline: d.tagline,
      description: d.description,
      from_price: d.fromPrice,
      package_count: d.packageCount,
      rating: d.rating,
      best_months: d.bestMonths,
      tags: d.tags,
    })),
  )
  if (destErr) throw destErr

  console.log(`Seeding ${suppliers.length} suppliers...`)
  const { error: supErr } = await supabase.from("suppliers").upsert(
    suppliers.map((s) => ({
      id: s.id,
      name: s.name,
      type: s.type,
      location: s.location,
      rating: s.rating,
      packages_count: s.packagesCount,
      verified: s.verified,
      since: s.since,
      specialty: s.specialty,
      logo_initial: s.logoInitial,
      color: s.color,
    })),
  )
  if (supErr) throw supErr

  console.log(`Seeding ${packages.length} packages...`)
  const { error: pkgErr } = await supabase.from("packages").upsert(
    packages.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      destination_id: p.destinationId,
      destination_name: p.destinationName,
      country: p.country,
      region: p.region,
      image: p.image,
      gallery: p.gallery,
      category: p.category,
      nights: p.nights,
      days: p.days,
      price: p.price,
      original_price: p.originalPrice,
      rating: p.rating,
      reviews_count: p.reviewsCount,
      group_size_max: p.groupSizeMax,
      difficulty: p.difficulty,
      hotel_rating: p.hotelRating,
      meal_plan: p.mealPlan,
      transport: p.transport,
      tags: p.tags,
      highlights: p.highlights,
      itinerary: p.itinerary,
      inclusions: p.inclusions,
      exclusions: p.exclusions,
      supplier_id: p.supplierId,
      start_dates: p.startDates,
      flexible: p.flexible,
      trending: p.trending,
      featured: p.featured,
      best_seller: p.bestSeller,
      reviews: p.reviews,
      faqs: p.faqs,
    })),
  )
  if (pkgErr) throw pkgErr

  console.log(`Seeding ${deals.length} deals...`)
  const { error: dealErr } = await supabase.from("deals").upsert(
    deals.map((d) => ({
      id: d.id,
      title: d.title,
      subtitle: d.subtitle,
      discount_percent: d.discountPercent,
      code: d.code,
      expires_at: d.expiresAt,
      image: d.image,
      package_id: d.packageId,
    })),
  )
  if (dealErr) throw dealErr

  console.log("Done! Your Supabase project now has the full demo catalogue.")
}

run().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
