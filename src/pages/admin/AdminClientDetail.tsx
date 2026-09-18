import { useEffect, useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { ArrowLeft, CalendarClock, Trash2 } from "lucide-react"
import { useAdminResource } from "../../hooks/useAdminResource"
import { adminCreate, adminDelete, adminUpdate } from "../../lib/adminApi"
import { useToast } from "../../context/ToastContext"
import { formatDate, normalizeEmail, normalizePhone } from "../../lib/utils"
import { AdminErrorNotice, AdminSkeletonLines, Badge } from "../../components/admin/AdminUI"
import { TagListField } from "../../components/admin/TagListField"
import { SOURCE_OPTIONS, STATUS_OPTIONS, type ClientRow } from "../../components/admin/clientShared"

interface BookingRow {
  id: string
  package_title: string
  status: string
  contact_email: string
  contact_phone: string
}
interface QuoteRow {
  id: string
  status: string
  email: string
  phone: string
  created_at: string
}
interface MessageRow {
  id: string
  subject: string
  message: string
  status: string
  email: string
  created_at: string
}

function emptyForm() {
  return {
    full_name: "",
    phone: "",
    whatsapp: "",
    email: "",
    country: "",
    city: "",
    source: "Manual",
    tags: [] as string[],
    status: "new" as ClientRow["status"],
    notes: "",
    next_follow_up: "",
  }
}

export default function AdminClientDetail() {
  const { id } = useParams<{ id: string }>()
  const isNew = id === "new"
  const navigate = useNavigate()
  const { showToast } = useToast()

  const { items, setItems, loading, error } = useAdminResource<ClientRow>("clients")
  const { items: bookings } = useAdminResource<BookingRow>("bookings")
  const { items: quotes } = useAdminResource<QuoteRow>("quotes")
  const { items: messages } = useAdminResource<MessageRow>("messages")

  const current = isNew ? null : items.find((c) => c.id === id)
  const [form, setForm] = useState<ReturnType<typeof emptyForm> | null>(isNew ? emptyForm() : null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isNew && current && !form) {
      setForm({
        full_name: current.full_name,
        phone: current.phone,
        whatsapp: current.whatsapp,
        email: current.email,
        country: current.country,
        city: current.city,
        source: current.source,
        tags: current.tags ?? [],
        status: current.status,
        notes: current.notes,
        next_follow_up: current.next_follow_up ? current.next_follow_up.slice(0, 16) : "",
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, isNew])

  const save = async () => {
    if (!form) return
    if (!form.full_name.trim()) {
      showToast("Name is required", "info")
      return
    }
    setSaving(true)
    const payload = { ...form, next_follow_up: form.next_follow_up ? new Date(form.next_follow_up).toISOString() : null }
    try {
      if (isNew) {
        const created = await adminCreate<ClientRow>("clients", payload)
        setItems((prev) => [created, ...prev])
        showToast("Client added")
        navigate(`/admin/clients/${created.id}`, { replace: true })
      } else if (id) {
        const updated = await adminUpdate<ClientRow>("clients", id, payload)
        setItems((prev) => prev.map((c) => (c.id === id ? updated : c)))
        showToast("Client updated")
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save", "info")
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!id || !confirm("Delete this client? This cannot be undone.")) return
    try {
      await adminDelete("clients", id)
      showToast("Client deleted")
      navigate("/admin/clients")
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete", "info")
    }
  }

  const logContact = async () => {
    if (!id) return
    try {
      const updated = await adminUpdate<ClientRow>("clients", id, { last_contact_at: new Date().toISOString() })
      setItems((prev) => prev.map((x) => (x.id === id ? updated : x)))
      showToast("Logged contact")
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update", "info")
    }
  }

  const linked = (() => {
    if (!current) return { bookings: [], quotes: [], messages: [] }
    const phone = current.phone ? normalizePhone(current.phone) : ""
    const wa = current.whatsapp ? normalizePhone(current.whatsapp) : ""
    const email = current.email ? normalizeEmail(current.email) : ""
    const matches = (contactPhone?: string, contactEmail?: string) => {
      const p = contactPhone ? normalizePhone(contactPhone) : ""
      const e = contactEmail ? normalizeEmail(contactEmail) : ""
      return Boolean((phone && p && phone === p) || (wa && p && wa === p) || (email && e && email === e))
    }
    return {
      bookings: bookings.filter((b) => matches(b.contact_phone, b.contact_email)),
      quotes: quotes.filter((q) => matches(q.phone, q.email)),
      messages: messages.filter((m) => matches(undefined, m.email)),
    }
  })()
  const totalLinked = linked.bookings.length + linked.quotes.length + linked.messages.length

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/admin/clients" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ocean-950/60 hover:text-ocean-950">
        <ArrowLeft size={15} /> Back to Clients
      </Link>

      {error && <AdminErrorNotice resource="clients" message={error} />}

      {!isNew && loading && !current && (
        <div className="rounded-2xl border border-sand-200 bg-white p-5">
          <AdminSkeletonLines count={5} />
        </div>
      )}

      {!isNew && !loading && !current && !error && (
        <div className="rounded-2xl border border-dashed border-sand-300 p-10 text-center text-sm text-ocean-950/50">Client not found.</div>
      )}

      {form && (
        <div className="rounded-2xl border border-sand-200 bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <h1 className="font-display text-xl font-bold text-ocean-950">{isNew ? "New Client" : form.full_name || "Edit Client"}</h1>
            {!isNew && (
              <button onClick={remove} className="flex items-center gap-1.5 rounded-full border border-sand-200 px-3 py-1.5 text-xs font-semibold text-ocean-950/60 hover:border-sunset-300 hover:text-sunset-600">
                <Trash2 size={13} /> Delete
              </button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-ocean-950/60">Full name</label>
              <input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ocean-950/60">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ocean-950/60">WhatsApp</label>
              <input
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ocean-950/60">Email</label>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ocean-950/60">Country</label>
              <input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ocean-950/60">City</label>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ocean-950/60">Source</label>
              <select
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
              >
                {SOURCE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ocean-950/60">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as ClientRow["status"] })}
                className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ocean-950/60">Next follow-up</label>
              <input
                type="datetime-local"
                value={form.next_follow_up}
                onChange={(e) => setForm({ ...form, next_follow_up: e.target.value })}
                className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
              />
            </div>
            <div className="sm:col-span-2">
              <TagListField label="Tags" values={form.tags} onChange={(tags) => setForm({ ...form, tags })} placeholder="VIP, repeat, corporate..." />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-ocean-950/60">Notes</label>
              <textarea
                rows={4}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
              />
            </div>
          </div>

          {!isNew && current && (
            <div className="mt-5 border-t border-sand-100 pt-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-ocean-950/40">Linked activity {totalLinked > 0 && `(${totalLinked})`}</p>
                <button onClick={logContact} className="flex items-center gap-1 text-xs font-semibold text-ocean-600 hover:text-ocean-700">
                  <CalendarClock size={13} /> Log contact now
                </button>
              </div>
              {current.last_contact_at && <p className="mb-2 text-xs text-ocean-950/50">Last contacted {formatDate(current.last_contact_at)}</p>}
              {totalLinked === 0 && <p className="text-xs text-ocean-950/40">No matching bookings, quotes or messages found by phone/email yet.</p>}
              <div className="space-y-1.5">
                {linked.bookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between rounded-lg bg-sand-50 px-3 py-2 text-xs">
                    <span className="text-ocean-950/70">Booking · {b.package_title}</span>
                    <Badge tone="ocean">{b.status}</Badge>
                  </div>
                ))}
                {linked.quotes.map((q) => (
                  <div key={q.id} className="flex items-center justify-between rounded-lg bg-sand-50 px-3 py-2 text-xs">
                    <span className="text-ocean-950/70">Quote request · {formatDate(q.created_at)}</span>
                    <Badge tone="gold">{q.status}</Badge>
                  </div>
                ))}
                {linked.messages.map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-lg bg-sand-50 px-3 py-2 text-xs">
                    <span className="truncate pr-2 text-ocean-950/70">Message · {m.subject || m.message.slice(0, 40)}</span>
                    <Badge tone="sunset">{m.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={save} disabled={saving} className="mt-5 rounded-full bg-ocean-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
            {saving ? "Saving..." : "Save Client"}
          </button>
        </div>
      )}
    </div>
  )
}
