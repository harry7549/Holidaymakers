import { useState } from "react"
import { Award, Flame, Package as PackageIcon, Pencil, Plus, Sparkles, Star, Trash2, X } from "lucide-react"
import { useAdminResource } from "../../hooks/useAdminResource"
import { adminCreate, adminDelete, adminUpdate } from "../../lib/adminApi"
import { useToast } from "../../context/ToastContext"
import { useCatalog } from "../../context/CatalogContext"
import { formatPrice, slugify } from "../../lib/utils"
import { SmartImage } from "../../components/SmartImage"
import { ImageUploadField } from "../../components/admin/ImageUploadField"
import { AdminPageHeader, AdminEmptyState, AdminErrorNotice, AdminSkeletonGrid, Badge } from "../../components/admin/AdminUI"

interface PackageRow {
  id: string
  slug: string
  title: string
  destination_id: string
  destination_name: string
  country: string
  region: string
  image: string
  gallery: string[]
  category: string[]
  nights: number
  days: number
  price: number
  original_price: number
  rating: number
  reviews_count: number
  group_size_max: number
  difficulty: string
  hotel_rating: number
  meal_plan: string
  transport: string[]
  tags: string[]
  highlights: string[]
  itinerary: unknown[]
  inclusions: string[]
  exclusions: string[]
  supplier_id: string
  start_dates: string[]
  flexible: boolean
  trending: boolean
  featured: boolean
  best_seller: boolean
  reviews: unknown[]
  faqs: unknown[]
}

const csv = (v: string[] | undefined) => (v || []).join(", ")
const parseCsv = (v: string) => v.split(",").map((s) => s.trim()).filter(Boolean)

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
    gallery: "",
    category: "",
    nights: 3,
    days: 4,
    price: 0,
    original_price: 0,
    rating: 4.5,
    reviews_count: 0,
    group_size_max: 10,
    difficulty: "Easy",
    hotel_rating: 4,
    meal_plan: "",
    transport: "",
    tags: "",
    highlights: "",
    inclusions: "",
    exclusions: "",
    supplier_id: supplierId,
    start_dates: "",
    flexible: true,
    trending: false,
    featured: false,
    best_seller: false,
    itineraryJson: "[]",
    reviewsJson: "[]",
    faqsJson: "[]",
  }
}

type FormState = ReturnType<typeof emptyForm>

export default function AdminPackages() {
  const { items, setItems, loading, error } = useAdminResource<PackageRow>("packages")
  const { destinations, suppliers, refresh } = useCatalog()
  const { showToast } = useToast()
  const [form, setForm] = useState<FormState | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [jsonError, setJsonError] = useState<string | null>(null)

  const startCreate = () => {
    setEditingId(null)
    setForm(emptyForm(destinations[0]?.id ?? "", suppliers[0]?.id ?? ""))
    setJsonError(null)
  }

  const startEdit = (p: PackageRow) => {
    setEditingId(p.id)
    setForm({
      id: p.id,
      slug: p.slug,
      title: p.title,
      destination_id: p.destination_id,
      destination_name: p.destination_name,
      country: p.country,
      region: p.region,
      image: p.image,
      gallery: csv(p.gallery),
      category: csv(p.category),
      nights: p.nights,
      days: p.days,
      price: p.price,
      original_price: p.original_price,
      rating: p.rating,
      reviews_count: p.reviews_count,
      group_size_max: p.group_size_max,
      difficulty: p.difficulty,
      hotel_rating: p.hotel_rating,
      meal_plan: p.meal_plan,
      transport: csv(p.transport),
      tags: csv(p.tags),
      highlights: csv(p.highlights),
      inclusions: csv(p.inclusions),
      exclusions: csv(p.exclusions),
      supplier_id: p.supplier_id,
      start_dates: csv(p.start_dates),
      flexible: p.flexible,
      trending: p.trending,
      featured: p.featured,
      best_seller: p.best_seller,
      itineraryJson: JSON.stringify(p.itinerary ?? [], null, 2),
      reviewsJson: JSON.stringify(p.reviews ?? [], null, 2),
      faqsJson: JSON.stringify(p.faqs ?? [], null, 2),
    })
    setJsonError(null)
  }

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

    let itinerary: unknown[], reviews: unknown[], faqs: unknown[]
    try {
      itinerary = JSON.parse(form.itineraryJson || "[]")
      reviews = JSON.parse(form.reviewsJson || "[]")
      faqs = JSON.parse(form.faqsJson || "[]")
      setJsonError(null)
    } catch {
      setJsonError("Itinerary, reviews and FAQs must each be valid JSON arrays.")
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
      gallery: parseCsv(form.gallery),
      category: parseCsv(form.category),
      nights: Number(form.nights) || 1,
      days: Number(form.days) || 2,
      price: Number(form.price) || 0,
      original_price: Number(form.original_price) || 0,
      rating: Number(form.rating) || 4.5,
      reviews_count: Number(form.reviews_count) || 0,
      group_size_max: Number(form.group_size_max) || 10,
      difficulty: form.difficulty,
      hotel_rating: Number(form.hotel_rating) || 4,
      meal_plan: form.meal_plan,
      transport: parseCsv(form.transport),
      tags: parseCsv(form.tags),
      highlights: parseCsv(form.highlights),
      inclusions: parseCsv(form.inclusions),
      exclusions: parseCsv(form.exclusions),
      supplier_id: form.supplier_id,
      start_dates: parseCsv(form.start_dates),
      flexible: form.flexible,
      trending: form.trending,
      featured: form.featured,
      best_seller: form.best_seller,
      itinerary,
      reviews,
      faqs,
    }

    try {
      if (editingId) {
        const updated = await adminUpdate<PackageRow>("packages", editingId, payload)
        setItems((prev) => prev.map((p) => (p.id === editingId ? updated : p)))
        showToast("Package updated")
      } else {
        const created = await adminCreate<PackageRow>("packages", payload)
        setItems((prev) => [created, ...prev])
        showToast("Package added")
      }
      setForm(null)
      setEditingId(null)
      refresh()
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save", "info")
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!confirm("Delete this package? This cannot be undone.")) return
    try {
      await adminDelete("packages", id)
      setItems((prev) => prev.filter((p) => p.id !== id))
      refresh()
      showToast("Package deleted")
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete", "info")
    }
  }

  const inputClass = "rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"

  return (
    <div>
      <AdminPageHeader
        icon={PackageIcon}
        title="Packages"
        subtitle="Every holiday package shown on the site, and their prices."
        action={
          <button onClick={startCreate} className="flex items-center gap-1.5 rounded-full bg-ocean-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ocean-700">
            <Plus size={15} /> Add Package
          </button>
        }
      />

      {form && (
        <div className="mb-6 rounded-2xl border border-ocean-300 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-ocean-950">{editingId ? "Edit Package" : "New Package"}</h2>
            <button onClick={() => setForm(null)}>
              <X size={18} />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input placeholder="Id (unique, e.g. pkg-18)" value={form.id} disabled={Boolean(editingId)} onChange={(e) => setForm({ ...form, id: e.target.value })} className={`${inputClass} disabled:bg-sand-100`} />
            <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
            <input placeholder="Slug (auto from title if blank)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputClass} />

            <select value={form.destination_id} onChange={(e) => applyDestination(e.target.value)} className={inputClass}>
              <option value="">Select destination...</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <select value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })} className={inputClass}>
              <option value="">Select supplier...</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className={inputClass}>
              <option>Easy</option>
              <option>Moderate</option>
              <option>Challenging</option>
            </select>

            <div className="sm:col-span-2 lg:col-span-3">
              <ImageUploadField value={form.image} onChange={(v) => setForm({ ...form, image: v })} placeholder="Main image URL, or upload one →" />
            </div>
            <input placeholder="Gallery image URLs, comma separated" value={form.gallery} onChange={(e) => setForm({ ...form, gallery: e.target.value })} className={`${inputClass} sm:col-span-2 lg:col-span-3`} />

            <input type="number" placeholder="Nights" value={form.nights} onChange={(e) => setForm({ ...form, nights: Number(e.target.value) })} className={inputClass} />
            <input type="number" placeholder="Days" value={form.days} onChange={(e) => setForm({ ...form, days: Number(e.target.value) })} className={inputClass} />
            <select value={form.hotel_rating} onChange={(e) => setForm({ ...form, hotel_rating: Number(e.target.value) })} className={inputClass}>
              <option value={3}>3-star hotels</option>
              <option value={4}>4-star hotels</option>
              <option value={5}>5-star hotels</option>
            </select>

            <input type="number" placeholder="Price (INR, per person)" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={inputClass} />
            <input type="number" placeholder="Original price (for discount %)" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: Number(e.target.value) })} className={inputClass} />
            <input type="number" placeholder="Max group size" value={form.group_size_max} onChange={(e) => setForm({ ...form, group_size_max: Number(e.target.value) })} className={inputClass} />

            <input type="number" step="0.1" min="0" max="5" placeholder="Rating" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className={inputClass} />
            <input type="number" placeholder="Reviews count" value={form.reviews_count} onChange={(e) => setForm({ ...form, reviews_count: Number(e.target.value) })} className={inputClass} />
            <input placeholder="Meal plan" value={form.meal_plan} onChange={(e) => setForm({ ...form, meal_plan: e.target.value })} className={inputClass} />

            <input placeholder="Category, comma separated (Beach, Family...)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={`${inputClass} sm:col-span-2 lg:col-span-3`} />
            <input placeholder="Transport, comma separated" value={form.transport} onChange={(e) => setForm({ ...form, transport: e.target.value })} className={`${inputClass} sm:col-span-2 lg:col-span-3`} />
            <input placeholder="Tags, comma separated" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={`${inputClass} sm:col-span-2 lg:col-span-3`} />
            <input placeholder="Highlights, comma separated" value={form.highlights} onChange={(e) => setForm({ ...form, highlights: e.target.value })} className={`${inputClass} sm:col-span-2 lg:col-span-3`} />
            <input placeholder="Inclusions, comma separated" value={form.inclusions} onChange={(e) => setForm({ ...form, inclusions: e.target.value })} className={`${inputClass} sm:col-span-2 lg:col-span-3`} />
            <input placeholder="Exclusions, comma separated" value={form.exclusions} onChange={(e) => setForm({ ...form, exclusions: e.target.value })} className={`${inputClass} sm:col-span-2 lg:col-span-3`} />
            <input placeholder="Start dates, comma separated (YYYY-MM-DD)" value={form.start_dates} onChange={(e) => setForm({ ...form, start_dates: e.target.value })} className={`${inputClass} sm:col-span-2 lg:col-span-3`} />

            <label className="flex items-center gap-2 text-sm text-ocean-950/80">
              <input type="checkbox" checked={form.flexible} onChange={(e) => setForm({ ...form, flexible: e.target.checked })} className="accent-ocean-600" /> Flexible dates
            </label>
            <label className="flex items-center gap-2 text-sm text-ocean-950/80">
              <input type="checkbox" checked={form.trending} onChange={(e) => setForm({ ...form, trending: e.target.checked })} className="accent-ocean-600" /> Trending
            </label>
            <label className="flex items-center gap-2 text-sm text-ocean-950/80">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-ocean-600" /> Featured on homepage
            </label>
            <label className="flex items-center gap-2 text-sm text-ocean-950/80">
              <input type="checkbox" checked={form.best_seller} onChange={(e) => setForm({ ...form, best_seller: e.target.checked })} className="accent-ocean-600" /> Bestseller badge
            </label>
          </div>

          <details className="mt-4 rounded-lg border border-sand-200 p-3">
            <summary className="cursor-pointer text-sm font-semibold text-ocean-950">Advanced: itinerary, reviews & FAQs (JSON)</summary>
            <div className="mt-3 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-ocean-950/60">
                  Itinerary — array of {`{ day, title, description, activities: [] }`}
                </label>
                <textarea rows={4} value={form.itineraryJson} onChange={(e) => setForm({ ...form, itineraryJson: e.target.value })} className={`${inputClass} w-full font-mono text-xs`} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-ocean-950/60">
                  Reviews — array of {`{ name, rating, title, body, tripType, date }`}
                </label>
                <textarea rows={4} value={form.reviewsJson} onChange={(e) => setForm({ ...form, reviewsJson: e.target.value })} className={`${inputClass} w-full font-mono text-xs`} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-ocean-950/60">FAQs — array of {`{ q, a }`}</label>
                <textarea rows={3} value={form.faqsJson} onChange={(e) => setForm({ ...form, faqsJson: e.target.value })} className={`${inputClass} w-full font-mono text-xs`} />
              </div>
            </div>
          </details>

          {jsonError && <p className="mt-3 text-sm text-sunset-600">{jsonError}</p>}

          <button onClick={save} disabled={saving} className="mt-4 rounded-full bg-ocean-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
            {saving ? "Saving..." : "Save Package"}
          </button>
        </div>
      )}

      {loading && <AdminSkeletonGrid />}
      {error && <AdminErrorNotice resource="packages" message={error} />}

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <div
              key={p.id}
              className="group overflow-hidden rounded-2xl border border-sand-200 bg-white transition-all hover:-translate-y-0.5 hover:border-ocean-200 hover:shadow-card"
            >
              <div className="relative h-32">
                <SmartImage src={p.image} alt={p.title} className="h-full w-full" />
                <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                  {p.featured && (
                    <Badge tone="gold">
                      <span className="inline-flex items-center gap-0.5">
                        <Star size={9} /> Featured
                      </span>
                    </Badge>
                  )}
                  {p.trending && (
                    <Badge tone="sunset">
                      <span className="inline-flex items-center gap-0.5">
                        <Flame size={9} /> Trending
                      </span>
                    </Badge>
                  )}
                  {p.best_seller && (
                    <Badge tone="ocean">
                      <span className="inline-flex items-center gap-0.5">
                        <Award size={9} /> Bestseller
                      </span>
                    </Badge>
                  )}
                </div>
                <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => startEdit(p)} className="rounded-lg bg-white/95 p-1.5 text-ocean-950/60 shadow-sm hover:text-ocean-700">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => remove(p.id)} className="rounded-lg bg-white/95 p-1.5 text-ocean-950/60 shadow-sm hover:text-sunset-600">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <p className="truncate font-display text-base font-bold text-ocean-950">{p.title}</p>
                <p className="mt-0.5 text-xs text-ocean-950/50">
                  {p.destination_name}, {p.country} · {p.days}D/{p.nights}N
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-ocean-950">{formatPrice(p.price)}</p>
                  <span className="flex items-center gap-1 text-xs text-ocean-950/50">
                    <Sparkles size={11} className="text-gold-500" /> {p.rating}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="sm:col-span-2 lg:col-span-3"><AdminEmptyState label="No packages yet — add your first one above." /></div>}
        </div>
      )}
    </div>
  )
}
