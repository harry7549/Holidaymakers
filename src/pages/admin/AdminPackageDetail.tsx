import { useEffect, useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react"
import { useAdminResource } from "../../hooks/useAdminResource"
import { adminCreate, adminDelete, adminUpdate } from "../../lib/adminApi"
import { useToast } from "../../context/ToastContext"
import { useCatalog } from "../../context/CatalogContext"
import { formatPrice, slugify } from "../../lib/utils"
import { ImageUploadField } from "../../components/admin/ImageUploadField"
import { TagListField } from "../../components/admin/TagListField"
import { GalleryUploadField } from "../../components/admin/GalleryUploadField"
import { AdminErrorNotice, AdminSkeletonLines } from "../../components/admin/AdminUI"
import {
  Field,
  ItineraryEditor,
  ReviewsEditor,
  FaqsEditor,
  inputClass,
  type PackageRow,
  type ItineraryForm,
  type ReviewForm,
  type FaqForm,
} from "../../components/admin/PackageFormShared"

function emptyForm(destinationId: string, supplierId: string) {
  return {
    id: `pkg-${Date.now()}`,
    slug: "",
    title: "",
    destination_id: destinationId,
    destination_name: "",
    country: "",
    region: "Domestic",
    image: "",
    gallery: [] as string[],
    category: [] as string[],
    nights: 3,
    days: 4,
    price: 0,
    original_price: 0,
    cost_price: 0,
    rating: 4.5,
    reviews_count: 0,
    group_size_max: 10,
    difficulty: "Easy",
    hotel_rating: 4,
    meal_plan: "",
    transport: [] as string[],
    tags: [] as string[],
    highlights: [] as string[],
    inclusions: [] as string[],
    exclusions: [] as string[],
    supplier_id: supplierId,
    start_dates: [] as string[],
    flexible: true,
    trending: false,
    featured: false,
    best_seller: false,
    itinerary: [] as ItineraryForm[],
    reviews: [] as ReviewForm[],
    faqs: [] as FaqForm[],
  }
}

type FormState = ReturnType<typeof emptyForm>

export default function AdminPackageDetail() {
  const { id } = useParams<{ id: string }>()
  const isNew = id === "new"
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { destinations, suppliers, refresh } = useCatalog()

  const { items, setItems, loading, error } = useAdminResource<PackageRow>("packages")
  const current = isNew ? null : items.find((p) => p.id === id)
  const [form, setForm] = useState<FormState | null>(isNew ? emptyForm(destinations[0]?.id ?? "", suppliers[0]?.id ?? "") : null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isNew && current && !form) {
      setForm({
        id: current.id,
        slug: current.slug,
        title: current.title,
        destination_id: current.destination_id,
        destination_name: current.destination_name,
        country: current.country,
        region: current.region,
        image: current.image,
        gallery: current.gallery ?? [],
        category: current.category ?? [],
        nights: current.nights,
        days: current.days,
        price: current.price,
        original_price: current.original_price,
        cost_price: current.cost_price ?? 0,
        rating: current.rating,
        reviews_count: current.reviews_count,
        group_size_max: current.group_size_max,
        difficulty: current.difficulty,
        hotel_rating: current.hotel_rating,
        meal_plan: current.meal_plan,
        transport: current.transport ?? [],
        tags: current.tags ?? [],
        highlights: current.highlights ?? [],
        inclusions: current.inclusions ?? [],
        exclusions: current.exclusions ?? [],
        supplier_id: current.supplier_id,
        start_dates: current.start_dates ?? [],
        flexible: current.flexible,
        trending: current.trending,
        featured: current.featured,
        best_seller: current.best_seller,
        itinerary: current.itinerary ?? [],
        reviews: current.reviews ?? [],
        faqs: current.faqs ?? [],
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, isNew])

  const applyDestination = (destinationId: string) => {
    if (!form) return
    const dest = destinations.find((d) => d.id === destinationId)
    setForm({
      ...form,
      destination_id: destinationId,
      destination_name: dest?.name ?? form.destination_name,
      country: dest?.country ?? form.country,
      region: dest?.region ?? form.region,
    })
  }

  const save = async () => {
    if (!form) return
    if (!form.id || !form.title) {
      showToast("Id and title are required", "info")
      return
    }

    setSaving(true)
    const payload = {
      id: form.id,
      slug: form.slug || slugify(form.title),
      title: form.title,
      destination_id: form.destination_id,
      destination_name: form.destination_name,
      country: form.country,
      region: form.region,
      image: form.image,
      gallery: form.gallery,
      category: form.category,
      nights: Number(form.nights) || 1,
      days: Number(form.days) || 2,
      price: Number(form.price) || 0,
      original_price: Number(form.original_price) || 0,
      cost_price: Number(form.cost_price) || 0,
      rating: Number(form.rating) || 4.5,
      reviews_count: Number(form.reviews_count) || 0,
      group_size_max: Number(form.group_size_max) || 10,
      difficulty: form.difficulty,
      hotel_rating: Number(form.hotel_rating) || 4,
      meal_plan: form.meal_plan,
      transport: form.transport,
      tags: form.tags,
      highlights: form.highlights,
      inclusions: form.inclusions,
      exclusions: form.exclusions,
      supplier_id: form.supplier_id,
      start_dates: form.start_dates,
      flexible: form.flexible,
      trending: form.trending,
      featured: form.featured,
      best_seller: form.best_seller,
      itinerary: form.itinerary,
      reviews: form.reviews.map((r, i) => ({
        id: `rev-${form.id}-${i}`,
        avatarColor: "ocean",
        helpful: 0,
        ...r,
      })),
      faqs: form.faqs,
    }

    try {
      if (isNew) {
        const created = await adminCreate<PackageRow>("packages", payload)
        setItems((prev) => [created, ...prev])
        showToast("Package added")
        refresh()
        navigate(`/admin/packages/${created.id}`, { replace: true })
      } else if (id) {
        const updated = await adminUpdate<PackageRow>("packages", id, payload)
        setItems((prev) => prev.map((p) => (p.id === id ? updated : p)))
        showToast("Package updated")
        refresh()
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save", "info")
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!id || !confirm("Delete this package? This cannot be undone.")) return
    try {
      await adminDelete("packages", id)
      refresh()
      showToast("Package deleted")
      navigate("/admin/packages")
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete", "info")
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/admin/packages" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ocean-950/60 hover:text-ocean-950">
        <ArrowLeft size={15} /> Back to Packages
      </Link>

      {error && <AdminErrorNotice resource="packages" message={error} />}

      {!isNew && loading && !current && (
        <div className="rounded-2xl border border-sand-200 bg-white p-5">
          <AdminSkeletonLines count={6} />
        </div>
      )}

      {!isNew && !loading && !current && !error && (
        <div className="rounded-2xl border border-dashed border-sand-300 p-10 text-center text-sm text-ocean-950/50">Package not found.</div>
      )}

      {form && (
        <div className="rounded-2xl border border-sand-200 bg-white p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h1 className="min-w-0 truncate font-display text-xl font-bold text-ocean-950">{isNew ? "New Package" : form.title || "Edit Package"}</h1>
            <div className="flex shrink-0 items-center gap-2">
              {!isNew && form.slug && (
                <a
                  href={`/package/${form.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-full border border-sand-200 px-3.5 py-1.5 text-xs font-semibold text-ocean-950/70 hover:border-ocean-300 hover:text-ocean-700"
                >
                  <ExternalLink size={12} /> Preview live page
                </a>
              )}
              {!isNew && (
                <button
                  onClick={remove}
                  className="flex items-center gap-1.5 rounded-full border border-sand-200 px-3 py-1.5 text-xs font-semibold text-ocean-950/60 hover:border-sunset-300 hover:text-sunset-600"
                >
                  <Trash2 size={13} /> Delete
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Id (unique, e.g. pkg-18)">
              <input value={form.id} disabled={!isNew} onChange={(e) => setForm({ ...form, id: e.target.value })} className={`${inputClass} disabled:bg-sand-100`} />
            </Field>
            <Field label="Title">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Slug (auto from title if blank)">
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputClass} />
            </Field>

            <Field label="Destination">
              <select value={form.destination_id} onChange={(e) => applyDestination(e.target.value)} className={inputClass}>
                <option value="">Select destination...</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Supplier">
              <select value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })} className={inputClass}>
                <option value="">Select supplier...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Difficulty">
              <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className={inputClass}>
                <option>Easy</option>
                <option>Moderate</option>
                <option>Challenging</option>
              </select>
            </Field>

            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Main image">
                <ImageUploadField value={form.image} onChange={(v) => setForm({ ...form, image: v })} placeholder="Main image URL, or upload one →" />
              </Field>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <GalleryUploadField label="Gallery images" values={form.gallery} onChange={(v) => setForm({ ...form, gallery: v })} />
            </div>

            <Field label="Nights">
              <input type="number" value={form.nights} onChange={(e) => setForm({ ...form, nights: Number(e.target.value) })} className={inputClass} />
            </Field>
            <Field label="Days">
              <input type="number" value={form.days} onChange={(e) => setForm({ ...form, days: Number(e.target.value) })} className={inputClass} />
            </Field>
            <Field label="Hotel rating">
              <select value={form.hotel_rating} onChange={(e) => setForm({ ...form, hotel_rating: Number(e.target.value) })} className={inputClass}>
                <option value={3}>3-star hotels</option>
                <option value={4}>4-star hotels</option>
                <option value={5}>5-star hotels</option>
              </select>
            </Field>

            <Field label="Price (INR, per person)">
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={inputClass} />
            </Field>
            <Field label="Original price (for discount %)">
              <input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: Number(e.target.value) })} className={inputClass} />
            </Field>
            <Field label="Supplier cost price (per person)">
              <input type="number" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: Number(e.target.value) })} className={inputClass} />
            </Field>
            <Field label="Max group size">
              <input type="number" value={form.group_size_max} onChange={(e) => setForm({ ...form, group_size_max: Number(e.target.value) })} className={inputClass} />
            </Field>

            <div className="rounded-lg bg-sand-50 px-3 py-2.5 text-sm sm:col-span-2 lg:col-span-3">
              <span className="font-semibold text-ocean-950">Margin: {formatPrice(form.price - form.cost_price)} per person</span>
              <span className="ml-2 text-ocean-950/50">
                ({form.price > 0 ? Math.round(((form.price - form.cost_price) / form.price) * 100) : 0}% of sell price)
              </span>
            </div>

            <Field label="Rating (0-5)">
              <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className={inputClass} />
            </Field>
            <Field label="Reviews count">
              <input type="number" value={form.reviews_count} onChange={(e) => setForm({ ...form, reviews_count: Number(e.target.value) })} className={inputClass} />
            </Field>
            <Field label="Meal plan (e.g. Daily Breakfast)">
              <input value={form.meal_plan} onChange={(e) => setForm({ ...form, meal_plan: e.target.value })} className={inputClass} />
            </Field>

            <div className="sm:col-span-2 lg:col-span-3">
              <TagListField label="Category (e.g. Beach, Family)" values={form.category} onChange={(v) => setForm({ ...form, category: v })} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <TagListField label="Transport" values={form.transport} onChange={(v) => setForm({ ...form, transport: v })} placeholder="e.g. Return flights" />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <TagListField label="Tags" values={form.tags} onChange={(v) => setForm({ ...form, tags: v })} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <TagListField label="Highlights" values={form.highlights} onChange={(v) => setForm({ ...form, highlights: v })} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <TagListField label="Inclusions" values={form.inclusions} onChange={(v) => setForm({ ...form, inclusions: v })} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <TagListField label="Exclusions" values={form.exclusions} onChange={(v) => setForm({ ...form, exclusions: v })} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <TagListField
                label="Start dates"
                values={form.start_dates}
                onChange={(v) => setForm({ ...form, start_dates: v })}
                placeholder="YYYY-MM-DD, press Enter to add"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-ocean-950/80">
              <input type="checkbox" checked={form.flexible} onChange={(e) => setForm({ ...form, flexible: e.target.checked })} className="accent-ocean-600" /> Flexible dates
            </label>
            <label className="flex items-center gap-2 text-sm text-ocean-950/80">
              <input type="checkbox" checked={form.trending} onChange={(e) => setForm({ ...form, trending: e.target.checked })} className="accent-ocean-600" /> Trending
            </label>
            <label className="flex items-center gap-2 text-sm text-ocean-950/80">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-ocean-600" /> Featured on
              homepage
            </label>
            <label className="flex items-center gap-2 text-sm text-ocean-950/80">
              <input type="checkbox" checked={form.best_seller} onChange={(e) => setForm({ ...form, best_seller: e.target.checked })} className="accent-ocean-600" /> Bestseller
              badge
            </label>
          </div>

          <div className="mt-5 space-y-5 border-t border-sand-200 pt-4">
            <div>
              <p className="mb-2 text-sm font-bold text-ocean-950">Day-by-day itinerary</p>
              <ItineraryEditor items={form.itinerary} onChange={(itinerary) => setForm({ ...form, itinerary })} />
            </div>
            <div>
              <p className="mb-2 text-sm font-bold text-ocean-950">Traveller reviews</p>
              <ReviewsEditor items={form.reviews} onChange={(reviews) => setForm({ ...form, reviews })} />
            </div>
            <div>
              <p className="mb-2 text-sm font-bold text-ocean-950">FAQs</p>
              <FaqsEditor items={form.faqs} onChange={(faqs) => setForm({ ...form, faqs })} />
            </div>
          </div>

          <button onClick={save} disabled={saving} className="mt-5 rounded-full bg-ocean-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
            {saving ? "Saving..." : "Save Package"}
          </button>
        </div>
      )}
    </div>
  )
}
