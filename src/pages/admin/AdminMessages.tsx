import { Mail } from "lucide-react"
import { useAdminResource } from "../../hooks/useAdminResource"
import { adminUpdate } from "../../lib/adminApi"
import { cn, formatDate } from "../../lib/utils"
import { useToast } from "../../context/ToastContext"
import { AdminPageHeader, AdminEmptyState, AdminErrorNotice } from "../../components/admin/AdminUI"

interface MessageRow {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: string
  created_at: string
}

export default function AdminMessages() {
  const { items, setItems, loading, error } = useAdminResource<MessageRow>("messages")
  const { showToast } = useToast()

  const updateStatus = async (id: string, status: string) => {
    try {
      const updated = await adminUpdate<MessageRow>("messages", id, { status })
      setItems((prev) => prev.map((m) => (m.id === id ? updated : m)))
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update", "info")
    }
  }

  return (
    <div>
      <AdminPageHeader icon={Mail} title="Contact Messages" subtitle="Messages submitted through the Contact page." />

      {loading && <p className="text-sm text-ocean-950/50">Loading...</p>}
      {error && <AdminErrorNotice resource="messages" message={error} />}
      {!loading && items.length === 0 && !error && <AdminEmptyState label="No messages yet." />}

      <div className="space-y-3">
        {items.map((m) => (
          <div key={m.id} className={cn("rounded-2xl border bg-white p-4", m.status === "new" ? "border-ocean-300" : "border-sand-200")}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-base font-bold text-ocean-950">{m.subject || "(No subject)"}</p>
                <p className="text-xs text-ocean-950/50">
                  {m.name} · {m.email} · {formatDate(m.created_at)}
                </p>
              </div>
              <div className="flex gap-2">
                {m.status !== "read" && (
                  <button onClick={() => updateStatus(m.id, "read")} className="rounded-full border border-sand-200 px-3 py-1.5 text-xs font-semibold text-ocean-950">
                    Mark read
                  </button>
                )}
                {m.status !== "replied" && (
                  <button onClick={() => updateStatus(m.id, "replied")} className="rounded-full bg-ocean-600 px-3 py-1.5 text-xs font-semibold text-white">
                    Mark replied
                  </button>
                )}
              </div>
            </div>
            <p className="mt-2 text-sm text-ocean-950/70">{m.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
