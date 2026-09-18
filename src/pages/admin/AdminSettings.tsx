import { useEffect, useState } from "react"
import { Settings as SettingsIcon, ShieldCheck } from "lucide-react"
import { AdminPageHeader, AdminSkeletonLines } from "../../components/admin/AdminUI"
import { adminGetSettings, adminPutSetting } from "../../lib/adminApi"
import { useToast } from "../../context/ToastContext"

interface TripProtection {
  enabled: boolean
  feePerTraveler: number
  label: string
  description: string
}

const DEFAULT_TP: TripProtection = { enabled: true, feePerTraveler: 999, label: "Trip Protection Plan", description: "Helps cover trip cancellations and unexpected disruptions" }

export default function AdminSettings() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [tp, setTp] = useState<TripProtection>(DEFAULT_TP)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    adminGetSettings()
      .then((rows) => {
        const row = rows.find((r) => r.key === "trip_protection")
        if (row) setTp({ ...DEFAULT_TP, ...(row.value as Partial<TripProtection>) })
      })
      .catch((err) => showToast(err instanceof Error ? err.message : "Failed to load settings", "info"))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      await adminPutSetting("trip_protection", tp)
      showToast("Settings saved")
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save", "info")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <AdminPageHeader icon={SettingsIcon} title="Settings" subtitle="Site-wide configuration" />

      <div className="max-w-xl rounded-2xl border border-sand-200 bg-surface p-5">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <ShieldCheck size={16} />
          </span>
          <div>
            <h2 className="font-display text-base font-bold text-ocean-950">Trip Protection add-on</h2>
            <p className="text-xs text-ocean-950/50">Shown as an optional add-on at checkout. Not a licensed insurance product — worded as a protection plan.</p>
          </div>
        </div>

        {loading ? (
          <AdminSkeletonLines count={4} />
        ) : (
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-ocean-950">
              <input type="checkbox" checked={tp.enabled} onChange={(e) => setTp({ ...tp, enabled: e.target.checked })} className="h-4 w-4 rounded border-sand-300" />
              Show this add-on at checkout
            </label>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ocean-950/60">Label</label>
              <input
                value={tp.label}
                onChange={(e) => setTp({ ...tp, label: e.target.value })}
                className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ocean-950/60">Description</label>
              <input
                value={tp.description}
                onChange={(e) => setTp({ ...tp, description: e.target.value })}
                className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ocean-950/60">Fee per traveler (₹)</label>
              <input
                type="number"
                min={0}
                value={tp.feePerTraveler}
                onChange={(e) => setTp({ ...tp, feePerTraveler: Number(e.target.value) })}
                className="w-full max-w-[160px] rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
              />
            </div>
            <button
              onClick={save}
              disabled={saving}
              className="rounded-full bg-ocean-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-ocean-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
