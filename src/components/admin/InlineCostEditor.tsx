import { useState } from "react"
import { Check, Pencil, X } from "lucide-react"
import { formatPrice } from "../../lib/utils"

/**
 * A single-field click-to-edit price, for values that change often (like a
 * supplier's cost) and don't deserve opening a whole edit form every time.
 */
export function InlineCostEditor({ value, onSave, label = "Cost" }: { value: number; onSave: (v: number) => Promise<void>; label?: string }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value))
  const [saving, setSaving] = useState(false)

  const start = () => {
    setDraft(String(value))
    setEditing(true)
  }

  const save = async () => {
    const n = Number(draft)
    if (Number.isNaN(n) || n < 0) return
    setSaving(true)
    try {
      await onSave(n)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={start}
        title="Click to edit"
        className="flex items-center gap-1.5 rounded-full border border-sand-200 bg-white px-2.5 py-1 text-xs font-medium text-ocean-950/70 hover:border-ocean-300 hover:text-ocean-700"
      >
        {label} {formatPrice(value)}
        <Pencil size={11} className="text-ocean-950/40" />
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <input
        type="number"
        autoFocus
        disabled={saving}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") save()
          if (e.key === "Escape") setEditing(false)
        }}
        className="w-20 rounded border border-ocean-300 px-1.5 py-0.5 text-xs outline-none"
      />
      <button type="button" onClick={save} disabled={saving} className="text-ocean-600 hover:text-ocean-700">
        <Check size={13} />
      </button>
      <button type="button" onClick={() => setEditing(false)} className="text-ocean-950/40 hover:text-sunset-600">
        <X size={13} />
      </button>
    </div>
  )
}
