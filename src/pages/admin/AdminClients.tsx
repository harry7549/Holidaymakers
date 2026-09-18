import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Mail, Pencil, Phone, Plus, Trash2, Upload, Users } from "lucide-react"
import { useAdminResource } from "../../hooks/useAdminResource"
import { adminDelete } from "../../lib/adminApi"
import { useToast } from "../../context/ToastContext"
import { cn, formatDate } from "../../lib/utils"
import { AdminPageHeader, AdminEmptyState, AdminErrorNotice, AdminSearchBar, AdminSkeletonRows, Badge } from "../../components/admin/AdminUI"
import { ClientImportModal } from "../../components/admin/ClientImportModal"
import { STATUS_OPTIONS, STATUS_TONE, type ClientRow } from "../../components/admin/clientShared"

export default function AdminClients() {
  const { items, setItems, loading, error, reload } = useAdminResource<ClientRow>("clients")
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | ClientRow["status"]>("all")
  const [overdueOnly, setOverdueOnly] = useState(false)
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
            <button
              onClick={() => navigate("/admin/clients/new")}
              className="flex items-center gap-1.5 rounded-full bg-ocean-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ocean-700"
            >
              <Plus size={15} /> Add Client
            </button>
          </div>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-sand-200 bg-surface p-4 text-center">
          <p className="font-display text-2xl font-bold text-ocean-950">{items.length}</p>
          <p className="text-xs text-ocean-950/50">Total clients</p>
        </div>
        <div className="rounded-2xl border border-sand-200 bg-surface p-4 text-center">
          <p className="font-display text-2xl font-bold text-ocean-950">{items.filter((c) => c.status === "active" || c.status === "booked").length}</p>
          <p className="text-xs text-ocean-950/50">Active / booked</p>
        </div>
        <button
          onClick={() => setOverdueOnly((v) => !v)}
          className={cn(
            "rounded-2xl border p-4 text-center transition-colors",
            overdueOnly ? "border-sunset-400 bg-sunset-50" : "border-sand-200 bg-surface hover:border-sunset-200",
          )}
        >
          <p className="font-display text-2xl font-bold text-sunset-600">{overdueCount}</p>
          <p className="text-xs text-ocean-950/50">Overdue follow-ups</p>
        </button>
        <div className="rounded-2xl border border-sand-200 bg-surface p-4 text-center">
          <p className="font-display text-2xl font-bold text-ocean-950">{items.filter((c) => c.status === "lost").length}</p>
          <p className="text-xs text-ocean-950/50">Lost</p>
        </div>
      </div>

      {!loading && !error && items.length > 0 && (
        <AdminSearchBar value={search} onChange={setSearch} placeholder="Search by name, phone, email, tag..." resultCount={filtered.length} />
      )}
      {!loading && !error && items.length > 0 && (
        <div className="mb-4 mt-3 flex flex-wrap gap-1.5">
          {(["all", ...STATUS_OPTIONS.map((s) => s.value)] as const).map((s) => (
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
        <div className="overflow-x-auto rounded-2xl border border-sand-200 bg-surface">
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
                  <tr key={c.id} className="cursor-pointer border-t border-sand-100 hover:bg-sand-50" onClick={() => navigate(`/admin/clients/${c.id}`)}>
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
                        <button onClick={() => navigate(`/admin/clients/${c.id}`)} className="rounded-lg p-1.5 text-ocean-950/50 hover:bg-sand-100 hover:text-ocean-700">
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
