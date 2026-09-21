import { useState, type ReactNode } from "react"
import { ChevronDown, Plus, Trash2 } from "lucide-react"
import { TagListField } from "./TagListField"
import { ImageUploadField } from "./ImageUploadField"
import { RichTextEditor } from "./RichTextEditor"
import { cn } from "../../lib/utils"

export interface PackageRow {
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
  cost_price: number
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

export interface ItineraryForm {
  day: number
  title: string
  description: string
  activities: string[]
  image?: string
}

export interface ReviewForm {
  name: string
  rating: number
  title: string
  body: string
  tripType: string
  date: string
  photo?: string
}

export interface FaqForm {
  q: string
  a: string
}

export const inputClass = "w-full rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-ocean-950/60">{label}</label>
      {children}
    </div>
  )
}

/** A collapsible card for one item in a repeatable list (itinerary day, review, FAQ) —
 * click the header to open/close it, so a long list doesn't stay fully expanded at once. */
export function AccordionCard({
  summary,
  subtext,
  open,
  onToggle,
  onRemove,
  actions,
  children,
}: {
  summary: string
  subtext?: string
  open: boolean
  onToggle: () => void
  onRemove: () => void
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="rounded-xl border border-sand-200 bg-sand-50">
      <div className="flex items-center gap-2 p-3">
        <button type="button" onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-2 text-left">
          <ChevronDown size={14} className={cn("shrink-0 text-ocean-950/40 transition-transform", !open && "-rotate-90")} />
          <div className="min-w-0">
            <p className="truncate text-xs font-bold uppercase tracking-wide text-ocean-950/50">{summary}</p>
            {subtext && !open && <p className="truncate text-xs text-ocean-950/60">{subtext}</p>}
          </div>
        </button>
        {actions}
        <button type="button" onClick={onRemove} className="shrink-0 text-ocean-950/40 hover:text-sunset-600">
          <Trash2 size={14} />
        </button>
      </div>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  )
}

export function ItineraryEditor({ items, onChange }: { items: ItineraryForm[]; onChange: (items: ItineraryForm[]) => void }) {
  const [openIndex, setOpenIndex] = useState<number | null>(items.length > 0 ? 0 : null)
  const add = () => {
    onChange([...items, { day: items.length + 1, title: "", description: "", activities: [], image: "" }])
    setOpenIndex(items.length)
  }
  const update = (i: number, patch: Partial<ItineraryForm>) => onChange(items.map((d, idx) => (idx === i ? { ...d, ...patch } : d)))
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-3">
      {items.map((day, i) => (
        <AccordionCard
          key={i}
          summary={`Day ${i + 1}`}
          subtext={day.title || "Untitled"}
          open={openIndex === i}
          onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          onRemove={() => remove(i)}
        >
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Day number">
              <input type="number" value={day.day} onChange={(e) => update(i, { day: Number(e.target.value) })} className={inputClass} />
            </Field>
            <Field label="Title">
              <input value={day.title} onChange={(e) => update(i, { title: e.target.value })} className={inputClass} placeholder="e.g. Arrival in Hanoi" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description">
                <RichTextEditor
                  value={day.description}
                  onChange={(description) => update(i, { description })}
                  placeholder="What happens this day — as much detail as you like."
                />
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
        </AccordionCard>
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

export function ReviewsEditor({ items, onChange }: { items: ReviewForm[]; onChange: (items: ReviewForm[]) => void }) {
  const [openIndex, setOpenIndex] = useState<number | null>(items.length > 0 ? 0 : null)
  const add = () => {
    onChange([...items, { name: "", rating: 5, title: "", body: "", tripType: "", date: new Date().toISOString().slice(0, 10) }])
    setOpenIndex(items.length)
  }
  const update = (i: number, patch: Partial<ReviewForm>) => onChange(items.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-3">
      {items.map((r, i) => (
        <AccordionCard
          key={i}
          summary={`Review ${i + 1}`}
          subtext={r.name || "Untitled"}
          open={openIndex === i}
          onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          onRemove={() => remove(i)}
        >
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
            <div className="sm:col-span-2">
              <Field label="Traveller photo (optional)">
                <ImageUploadField value={r.photo ?? ""} onChange={(photo) => update(i, { photo })} placeholder="A real trip photo builds more trust, or upload one →" />
              </Field>
            </div>
          </div>
        </AccordionCard>
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

export function FaqsEditor({ items, onChange }: { items: FaqForm[]; onChange: (items: FaqForm[]) => void }) {
  const [openIndex, setOpenIndex] = useState<number | null>(items.length > 0 ? 0 : null)
  const add = () => {
    onChange([...items, { q: "", a: "" }])
    setOpenIndex(items.length)
  }
  const update = (i: number, patch: Partial<FaqForm>) => onChange(items.map((f, idx) => (idx === i ? { ...f, ...patch } : f)))
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-3">
      {items.map((f, i) => (
        <AccordionCard
          key={i}
          summary={`FAQ ${i + 1}`}
          subtext={f.q || "Untitled"}
          open={openIndex === i}
          onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          onRemove={() => remove(i)}
        >
          <div className="space-y-2">
            <Field label="Question">
              <input value={f.q} onChange={(e) => update(i, { q: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Answer">
              <textarea rows={2} value={f.a} onChange={(e) => update(i, { a: e.target.value })} className={inputClass} />
            </Field>
          </div>
        </AccordionCard>
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
