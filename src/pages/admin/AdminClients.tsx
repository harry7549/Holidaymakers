import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { CalendarClock, Mail, Pencil, Phone, Plus, Trash2, Upload, Users, X } from "lucide-react"
import { useAdminResource } from "../../hooks/useAdminResource"
import { adminCreate, adminDelete, adminUpdate } from "../../lib/adminApi"
import { useToast } from "../../context/ToastContext"
import { cn, formatDate, normalizeEmail, normalizePhone } from "../../lib/utils"
import { AdminPageHeader, AdminEmptyState, AdminErrorNotice, AdminSearchBar, AdminSkeletonRows, Badge } from "../../components/admin/AdminUI"
import { TagListField } from "../../components/admin/TagListField"
import { ClientImportModal } from "../../components/admin/ClientImportModal"

interface ClientRow {
  id: string
  full_name: string
  phone: string
  whatsapp: string
  email: string
  country: string
  city: string
  source: string
  tags: string[]
  status: "active" | "dormant" | "lost"
  notes: string
  next_follow_up: string | null
  last_contact_at: string | null
  created_at: string
}

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

const SOURCE_OPTIONS = ["Manual", "Website", "OTA", "Referral", "Walk-in", "Social", "Ads", "Email", "Phone", "Import"]
const STATUS_OPTIONS: { value: ClientRow["status"]; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "dormant", label: "Dormant" },
  { value: "lost", label: "Lost" },
]
const STATUS_TONE: Record<ClientRow["status"], "ocean" | "gold" | "sunset"> = { active: "ocean", dormant: "gold", lost: "sunset" }

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
    status: "active" as ClientRow["status"],
    notes: "",
    next_follow_up: "",
  }
}

export default function AdminClients() {
  const { items, setItems, loading, error, reload } = useAdminResource<ClientRow>("clients")
  const { items: bookings } = useAdminResource<BookingRow>("bookings")
  const { items: quotes } = useAdminResource<QuoteRow>("quotes")
  const { items: messages } = useAdminResource<MessageRow>("messages")
  const { showToast } = useToast()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | ClientRow["status"]>("all")
  const [overdueOnly, setOverdueOnly] = useState(false)
  const [form, setForm] = useState<ReturnType<typeof emptyForm> | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showImport, setShowImport] = useState(false)

  const now = Date.now()
  const isOverdue = (c: ClientRow) => Boolean(c.next_follow_up && new Date(c.next_follow_up).getTime() < now)
  const overdueCount = items.filter(isOverdue).length

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false
      if (overdueOnly && !isOverdue(c)) return false
      if (!q) return true
      return (
        c.full_name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.whatsapp.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        (c.tags ?? []).some((t) => t.toLowerCase().includes(q))
      )
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, search, statusFilter, overdueOnly])

  const startCreate = () => {
    setEditingId(null)
    setForm(emptyForm())
  }

  const startEdit = (c: ClientRow) => {
    setEditingId(c.id)
    setForm({
      full_name: c.full_name,
      phone: c.phone,
      whatsapp: c.whatsapp,
      email: c.email,
      country: c.country,
      city: c.city,
      source: c.source,
      tags: c.tags ?? [],
      status: c.status,
      notes: c.notes,
      next_follow_up: c.next_follow_up ? c.next_follow_up.slice(0, 16) : "",
    })
  }

  const [searchParams, setSearchParams] = useSearchParams()
  useEffect(() => {
    const openId = searchParams.get("open")
    if (!openId || items.length === 0) return
    const target = items.find((c) => c.id === openId)
    if (target) startEdit(target)
    setSearchParams((prev) => {
      prev.delete("open")
      return prev
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, searchParams])

  const save = async () => {
    if (!form) return
    if (!form.full_name.trim()) {
      showToast("Name is required", "info")
      return
    }
    setSaving(true)
    const payload = { ...form, next_follow_up: form.next_follow_up ? new Date(form.next_follow_up).toISOString() : null }
    try {
      if (editingId) {
        const updated = await adminUpdate<ClientRow>("clients", editingId, payload)
        setItems((prev) => prev.map((c) => (c.id === editingId ? updated : c)))
        showToast("Client updated")
      } else {
        const created = await adminCreate<ClientRow>("clients", payload)
        setItems((prev) => [created, ...prev])
        showToast("Client added")
      }
      setForm(null)
      setEditingId(null)
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save", "info")
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!confirm("Delete this client? This cannot be undone.")) return
    try {
      await adminDelete("clients", id)
      setItems((prev) => prev.filter((c) => c.id !== id))
      showToast("Client deleted")
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete", "info")
    }
  }

  const logContact = async (c: ClientRow) => {
    try {
      const updated = await adminUpdate<ClientRow>("clients", c.id, { last_contact_at: new Date().toISOString() })
      setItems((prev) => prev.map((x) => (x.id === c.id ? updated : x)))
      showToast("Logged contact")
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update", "info")
    }
  }

  const linkedFor = (c: ClientRow) => {
    const phone = c.phone ? normalizePhone(c.phone) : ""
    const wa = c.whatsapp ? normalizePhone(c.whatsapp) : ""
    const email = c.email ? normalizeEmail(c.email) : ""
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
  }

  return (
    <div>
      <AdminPageHeader
        icon={Users}
        title="Clients"
        subtitle="Every traveller and lead in one place — online or offline."
        action={
          <div className="flex gap-2">
            <button
              onClick={() => setShowImport(true)}
              className="flex items-center gap-1.5 rounded-full border border-sand-200 px-4 py-2.5 text-sm font-semibold text-ocean-950/70 hover:border-ocean-300"
            >
              <Upload size={15} /> Import CSV
            </button>
            <button onClick={startCreate} className="flex items-center gap-1.5 rounded-full bg-ocean-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ocean-700">
              <Plus size={15} /> Add Client
            </button>
          </div>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-sand-200 bg-white p-4 text-center">
          <p className="font-display text-2xl font-bold text-ocean-950">{items.length}</p>
          <p className="text-xs text-ocean-950/50">Total clients</p>
        </div>
        <div className="rounded-2xl border border-sand-200 bg-white p-4 text-center">
          <p className="font-display text-2xl font-bold text-ocean-950">{items.filter((c) => c.status === "active").length}</p>
          <p className="text-xs text-ocean-950/50">Active</p>
        </div>
        <button
          onClick={() => setOverdueOnly((v) => !v)}
          className={cn(
            "rounded-2xl border p-4 text-center transition-colors",
            overdueOnly ? "border-sunset-400 bg-sunset-50" : "border-sand-200 bg-white hover:border-sunset-200",
          )}
        >
          <p className="font-display text-2xl font-bold text-sunset-600">{overdueCount}</p>
          <p className="text-xs text-ocean-950/50">Overdue follow-ups</p>
        </button>
        <div className="rounded-2xl border border-sand-200 bg-white p-4 text-center">
          <p className="font-display text-2xl font-bold text-ocean-950">{items.filter((c) => c.status === "lost").length}</p>
          <p className="text-xs text-ocean-950/50">Lost</p>
        </div>
      </div>

      {form && (
        <div className="mb-6 rounded-2xl border border-ocean-300 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-ocean-950">{editingId ? "Edit Client" : "New Client"}</h2>
            <button
              onClick={() => {
                setForm(null)
                setEditingId(null)
              }}
            >
              <X size={18} />
            </button>
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
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
              />
            </div>
          </div>

          {editingId &&
            (() => {
              const current = items.find((c) => c.id === editingId)
              if (!current) return null
              const linked = linkedFor(current)
              const totalLinked = linked.bookings.length + linked.quotes.length + linked.messages.length
              return (
                <div className="mt-5 border-t border-sand-100 pt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ocean-950/40">Linked activity {totalLinked > 0 && `(${totalLinked})`}</p>
                    <button onClick={() => logContact(current)} className="flex items-center gap-1 text-xs font-semibold text-ocean-600 hover:text-ocean-700">
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
              )
            })()}

          <button onClick={save} disabled={saving} className="mt-5 rounded-full bg-ocean-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
            {saving ? "Saving..." : "Save Client"}
          </button>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <AdminSearchBar value={search} onChange={setSearch} placeholder="Search by name, phone, email, tag..." resultCount={filtered.length} />
      )}
      {!loading && !error && items.length > 0 && (
        <div className="mb-4 mt-3 flex flex-wrap gap-1.5">
          {(["all", "active", "dormant", "lost"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition-colors",
                statusFilter === s ? "border-ocean-600 bg-ocean-600 text-white" : "border-sand-200 text-ocean-950/60 hover:border-ocean-300",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {loading && <AdminSkeletonRows />}
      {error && <AdminErrorNotice resource="clients" message={error} />}

      {!loading && !error && items.length === 0 && <AdminEmptyState label="No clients yet — add one above or import a CSV of your existing contacts." />}

      {!loading && !error && items.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-sand-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-sand-50 text-xs text-ocean-950/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Source</th>
                <th className="px-4 py-3 font-semibold">Tags</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Next follow-up</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const overdue = isOverdue(c)
                return (
                  <tr key={c.id} className="cursor-pointer border-t border-sand-100 hover:bg-sand-50" onClick={() => startEdit(c)}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ocean-950">{c.full_name}</p>
                      <p className="text-xs text-ocean-950/40">{[c.city, c.country].filter(Boolean).join(", ")}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-ocean-950/70">
                      {c.phone && (
                        <p className="flex items-center gap-1">
                          <Phone size={11} /> {c.phone}
                        </p>
                      )}
                      {c.email && (
                        <p className="mt-0.5 flex items-center gap-1">
                          <Mail size={11} /> {c.email}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-ocean-950/60">{c.source}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(c.tags ?? []).slice(0, 2).map((t) => (
                          <Badge key={t} tone="neutral">
                            {t}
                          </Badge>
                        ))}
                        {(c.tags ?? []).length > 2 && <span className="text-xs text-ocean-950/40">+{c.tags.length - 2}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={STATUS_TONE[c.status]}>{c.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {c.next_follow_up ? (
                        <span className={overdue ? "font-semibold text-sunset-600" : "text-ocean-950/60"}>{formatDate(c.next_follow_up)}</span>
                      ) : (
                        <span className="text-ocean-950/30">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => startEdit(c)} className="rounded-lg p-1.5 text-ocean-950/50 hover:bg-sand-100 hover:text-ocean-700">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => remove(c.id)} className="rounded-lg p-1.5 text-ocean-950/50 hover:bg-sand-100 hover:text-sunset-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-ocean-950/40">
                    No clients match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showImport && (
        <ClientImportModal
          onClose={() => setShowImport(false)}
          onImported={() => {
            reload()
            showToast("Clients imported")
          }}
        />
      )}
    </div>
  )
}
