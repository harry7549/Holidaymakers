import { useState, type ReactNode } from "react"
import { Award, ExternalLink, Flame, Package as PackageIcon, Pencil, Plus, Sparkles, Star, Trash2, X } from "lucide-react"
import { useAdminResource } from "../../hooks/useAdminResource"
import { adminCreate, adminDelete, adminUpdate } from "../../lib/adminApi"
import { useToast } from "../../context/ToastContext"
import { useCatalog } from "../../context/CatalogContext"
import { formatPrice, slugify } from "../../lib/utils"
import { SmartImage } from "../../components/SmartImage"
import { ImageUploadField } from "../../components/admin/ImageUploadField"
import { TagListField } from "../../components/admin/TagListField"
import { GalleryUploadField } from "../../components/admin/GalleryUploadField"
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
  itinerary: ItineraryForm[]
  inclusions: string[]
  exclusions: string[]
  supplier_id: string
  start_dates: string[]
  flexible: boolean
  trending: boolean
  featured: boolean
  best_seller: boolean
  reviews: ReviewForm[]
  faqs: FaqForm[]
}

interface ItineraryForm {
  day: number
  title: string
  description: string
  activities: string[]
  image?: string
}

interface ReviewForm {
  name: string
  rating: number
  title: string
  body: string
  tripType: string
  date: string
}

interface FaqForm {
  q: string
  a: string
}

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

const inputClass = "w-full rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-ocean-950/60">{label}</label>
      {children}
    </div>
  )
}

export default function AdminPackages() {
  const { items, setItems, loading, error } = useAdminResource<PackageRow>("packages")
  const { destinations, suppliers, refresh } = useCatalog()
  const { showToast } = useToast()
  const [form, setForm] = useState<FormState | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const startCreate = () => {
    setEditingId(null)
    setForm(emptyForm(destinations[0]?.id ?? "", suppliers[0]?.id ?? ""))
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
      gallery: p.gallery ?? [],
      category: p.category ?? [],
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
      transport: p.transport ?? [],
      tags: p.tags ?? [],
      highlights: p.highlights ?? [],
      inclusions: p.inclusions ?? [],
      exclusions: p.exclusions ?? [],
      supplier_id: p.supplier_id,
      start_dates: p.start_dates ?? [],
      flexible: p.flexible,
      trending: p.trending,
      featured: p.featured,
      best_seller: p.best_seller,
      itinerary: p.itinerary ?? [],
      reviews: p.reviews ?? [],
      faqs: p.faqs ?? [],
    })
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
            <div className="flex items-center gap-3">
              {editingId && form.slug && (
                <a
                  href={`/package/${form.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-full border border-sand-200 px-3.5 py-1.5 text-xs font-semibold text-ocean-950/70 hover:border-ocean-300 hover:text-ocean-700"
                >
                  <ExternalLink size={12} /> Preview live page
                </a>
              )}
              <button onClick={() => setForm(null)}>
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Id (unique, e.g. pkg-18)">
              <input value={form.id} disabled={Boolean(editingId)} onChange={(e) => setForm({ ...form, id: e.target.value })} className={`${inputClass} disabled:bg-sand-100`} />
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
            <Field label="Max group size">
              <input type="number" value={form.group_size_max} onChange={(e) => setForm({ ...form, group_size_max: Number(e.target.value) })} className={inputClass} />
            </Field>

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
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-ocean-600" /> Featured on homepage
            </label>
            <label className="flex items-center gap-2 text-sm text-ocean-950/80">
              <input type="checkbox" checked={form.best_seller} onChange={(e) => setForm({ ...form, best_seller: e.target.checked })} className="accent-ocean-600" /> Bestseller badge
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
                  <a
                    href={`/package/${p.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    title="Preview live page"
                    className="rounded-lg bg-white/95 p-1.5 text-ocean-950/60 shadow-sm hover:text-ocean-700"
                  >
                    <ExternalLink size={13} />
                  </a>
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

function ItineraryEditor({ items, onChange }: { items: ItineraryForm[]; onChange: (items: ItineraryForm[]) => void }) {
  const add = () => onChange([...items, { day: items.length + 1, title: "", description: "", activities: [], image: "" }])
  const update = (i: number, patch: Partial<ItineraryForm>) => onChange(items.map((d, idx) => (idx === i ? { ...d, ...patch } : d)))
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-3">
      {items.map((day, i) => (
        <div key={i} className="rounded-xl border border-sand-200 bg-sand-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-ocean-950/50">Day {i + 1}</p>
            <button type="button" onClick={() => remove(i)} className="text-ocean-950/40 hover:text-sunset-600">
              <Trash2 size={14} />
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Day number">
              <input type="number" value={day.day} onChange={(e) => update(i, { day: Number(e.target.value) })} className={inputClass} />
            </Field>
            <Field label="Title">
              <input value={day.title} onChange={(e) => update(i, { title: e.target.value })} className={inputClass} placeholder="e.g. Arrival in Hanoi" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description">
                <textarea rows={4} value={day.description} onChange={(e) => update(i, { description: e.target.value })} className={inputClass} placeholder="What happens this day — as much detail as you like." />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <TagListField label="Activities" values={day.activities} onChange={(activities) => update(i, { activities })} placeholder="e.g. Old Quarter walking tour" />
            </div>
            <div className="sm:col-span-2">
              <Field label="Day image (optional)">
                <ImageUploadField value={day.image ?? ""} onChange={(image) => update(i, { image })} placeholder="Photo for this day, or upload one →" />
              </Field>
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-sand-300 py-2.5 text-sm font-semibold text-ocean-950/60 hover:border-ocean-300 hover:text-ocean-700"
      >
        <Plus size={14} /> Add day
      </button>
    </div>
  )
}

function ReviewsEditor({ items, onChange }: { items: ReviewForm[]; onChange: (items: ReviewForm[]) => void }) {
  const add = () => onChange([...items, { name: "", rating: 5, title: "", body: "", tripType: "", date: new Date().toISOString().slice(0, 10) }])
  const update = (i: number, patch: Partial<ReviewForm>) => onChange(items.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-3">
      {items.map((r, i) => (
        <div key={i} className="rounded-xl border border-sand-200 bg-sand-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-ocean-950/50">Review {i + 1}</p>
            <button type="button" onClick={() => remove(i)} className="text-ocean-950/40 hover:text-sunset-600">
              <Trash2 size={14} />
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Traveller name">
              <input value={r.name} onChange={(e) => update(i, { name: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Rating (1-5)">
              <input type="number" min={1} max={5} value={r.rating} onChange={(e) => update(i, { rating: Number(e.target.value) })} className={inputClass} />
            </Field>
            <Field label="Trip type">
              <input value={r.tripType} onChange={(e) => update(i, { tripType: e.target.value })} className={inputClass} placeholder="e.g. Honeymoon" />
            </Field>
            <Field label="Date">
              <input type="date" value={r.date} onChange={(e) => update(i, { date: e.target.value })} className={inputClass} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Review title">
                <input value={r.title} onChange={(e) => update(i, { title: e.target.value })} className={inputClass} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Review text">
                <textarea rows={2} value={r.body} onChange={(e) => update(i, { body: e.target.value })} className={inputClass} />
              </Field>
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-sand-300 py-2.5 text-sm font-semibold text-ocean-950/60 hover:border-ocean-300 hover:text-ocean-700"
      >
        <Plus size={14} /> Add review
      </button>
    </div>
  )
}

function FaqsEditor({ items, onChange }: { items: FaqForm[]; onChange: (items: FaqForm[]) => void }) {
  const add = () => onChange([...items, { q: "", a: "" }])
  const update = (i: number, patch: Partial<FaqForm>) => onChange(items.map((f, idx) => (idx === i ? { ...f, ...patch } : f)))
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-3">
      {items.map((f, i) => (
        <div key={i} className="rounded-xl border border-sand-200 bg-sand-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-ocean-950/50">FAQ {i + 1}</p>
            <button type="button" onClick={() => remove(i)} className="text-ocean-950/40 hover:text-sunset-600">
              <Trash2 size={14} />
            </button>
          </div>
          <div className="space-y-2">
            <Field label="Question">
              <input value={f.q} onChange={(e) => update(i, { q: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Answer">
              <textarea rows={2} value={f.a} onChange={(e) => update(i, { a: e.target.value })} className={inputClass} />
            </Field>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-sand-300 py-2.5 text-sm font-semibold text-ocean-950/60 hover:border-ocean-300 hover:text-ocean-700"
      >
        <Plus size={14} /> Add FAQ
      </button>
    </div>
  )
}
