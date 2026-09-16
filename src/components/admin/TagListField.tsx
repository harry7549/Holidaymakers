import { useState } from "react"
import { Plus, X } from "lucide-react"

/** A labeled add/remove chip list — replaces a "comma separated values" text input with a real list editor. */
export function TagListField({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
}) {
  const [draft, setDraft] = useState("")

  const add = () => {
    const v = draft.trim()
    if (!v) return
    onChange([...values, v])
    setDraft("")
  }

  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i))

  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-ocean-950/60">{label}</label>
      <div className="rounded-lg border border-sand-200 p-2">
        {values.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {values.map((v, i) => (
              <span key={i} className="flex items-center gap-1 rounded-full bg-sand-100 px-2.5 py-1 text-xs font-medium text-ocean-950/80">
                {v}
                <button type="button" onClick={() => remove(i)} className="text-ocean-950/40 hover:text-sunset-600">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-1.5">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                add()
              }
            }}
            placeholder={placeholder ?? "Type a value and press Enter"}
            className="w-full rounded-md border border-sand-200 px-2.5 py-1.5 text-sm outline-none focus:border-ocean-400"
          />
          <button type="button" onClick={add} title="Add" className="shrink-0 rounded-md bg-ocean-600 px-2.5 text-white hover:bg-ocean-700">
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
