import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react"
import { getBlockSchema, type FieldDef } from "../blocks/registry"
import type { BlockContent } from "../../data/types"

interface Props {
  type: string
  content: BlockContent
  onChange: (content: BlockContent) => void
}

const inputClass = "w-full rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"

function FieldControl({ field, value, onChange }: { field: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  if (field.type === "boolean") {
    return (
      <label className="flex items-center gap-2 text-sm text-ocean-950/80">
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="accent-ocean-600" />
        {field.label}
      </label>
    )
  }

  if (field.type === "select") {
    return (
      <div>
        <label className="mb-1 block text-xs font-semibold text-ocean-950/60">{field.label}</label>
        <select value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className={inputClass}>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    )
  }

  if (field.type === "textarea") {
    return (
      <div>
        <label className="mb-1 block text-xs font-semibold text-ocean-950/60">{field.label}</label>
        <textarea
          rows={3}
          placeholder={field.placeholder}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      </div>
    )
  }

  if (field.type === "number") {
    return (
      <div>
        <label className="mb-1 block text-xs font-semibold text-ocean-950/60">{field.label}</label>
        <input
          type="number"
          value={Number(value ?? 0)}
          onChange={(e) => onChange(Number(e.target.value))}
          className={inputClass}
        />
      </div>
    )
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-ocean-950/60">
        {field.label}
        {field.type === "image" && value ? <span className="ml-1 font-normal text-ocean-950/40">(preview below)</span> : null}
      </label>
      <input
        type="text"
        placeholder={field.placeholder}
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
      {field.type === "image" && typeof value === "string" && value && (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <img src={value} alt="" className="mt-2 h-20 w-full rounded-lg object-cover" onError={(e: any) => (e.currentTarget.style.display = "none")} />
      )}
    </div>
  )
}

export function BlockContentEditor({ type, content, onChange }: Props) {
  const schema = getBlockSchema(type)
  if (!schema) return <p className="text-sm text-sunset-600">Unknown block type "{type}"</p>

  const setField = (key: string, value: unknown) => onChange({ ...content, [key]: value })

  const list: Record<string, unknown>[] = (schema.listKey && content[schema.listKey]) || []

  const setList = (next: Record<string, unknown>[]) => {
    if (!schema.listKey) return
    onChange({ ...content, [schema.listKey]: next })
  }

  const addItem = () => {
    const blank: Record<string, unknown> = {}
    schema.itemFields?.forEach((f) => (blank[f.key] = f.type === "number" ? 0 : f.type === "boolean" ? false : ""))
    setList([...list, blank])
  }

  const updateItem = (i: number, key: string, value: unknown) => {
    setList(list.map((item, idx) => (idx === i ? { ...item, [key]: value } : item)))
  }

  const removeItem = (i: number) => setList(list.filter((_, idx) => idx !== i))

  const moveItem = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= list.length) return
    const next = [...list]
    ;[next[i], next[j]] = [next[j], next[i]]
    setList(next)
  }

  return (
    <div className="space-y-4">
      {schema.fields.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {schema.fields.map((f) => (
            <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : undefined}>
              <FieldControl field={f} value={content[f.key]} onChange={(v) => setField(f.key, v)} />
            </div>
          ))}
        </div>
      )}

      {schema.listKey && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-ocean-950/50">{schema.listLabel}</p>
            <button onClick={addItem} type="button" className="flex items-center gap-1 rounded-full bg-ocean-600 px-3 py-1 text-xs font-semibold text-white">
              <Plus size={13} /> Add
            </button>
          </div>
          <div className="space-y-3">
            {list.map((item, i) => (
              <div key={i} className="rounded-xl border border-sand-200 bg-sand-50 p-3">
                <div className="mb-2 flex items-center justify-end gap-1">
                  <button type="button" onClick={() => moveItem(i, -1)} disabled={i === 0} className="rounded p-1 text-ocean-950/50 hover:bg-white disabled:opacity-30">
                    <ChevronUp size={14} />
                  </button>
                  <button type="button" onClick={() => moveItem(i, 1)} disabled={i === list.length - 1} className="rounded p-1 text-ocean-950/50 hover:bg-white disabled:opacity-30">
                    <ChevronDown size={14} />
                  </button>
                  <button type="button" onClick={() => removeItem(i)} className="rounded p-1 text-ocean-950/50 hover:bg-white hover:text-sunset-600">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {schema.itemFields?.map((f) => (
                    <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : undefined}>
                      <FieldControl field={f} value={item[f.key]} onChange={(v) => updateItem(i, f.key, v)} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {list.length === 0 && <p className="text-xs text-ocean-950/40">No items yet — click Add.</p>}
          </div>
        </div>
      )}

      {schema.fields.length === 0 && !schema.listKey && (
        <p className="text-sm text-ocean-950/50">This block has no editable fields — it only marks where the live component renders.</p>
      )}
    </div>
  )
}
