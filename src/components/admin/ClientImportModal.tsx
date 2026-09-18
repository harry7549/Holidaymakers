import { useMemo, useState } from "react"
import { CheckCircle2, Loader2, Upload, X } from "lucide-react"
import { parseCsv } from "../../lib/csv"
import { adminBulkImport } from "../../lib/adminApi"
import { useToast } from "../../context/ToastContext"

interface TargetField {
  key: string
  label: string
  required?: boolean
  synonyms: string[]
}

const TARGET_FIELDS: TargetField[] = [
  { key: "full_name", label: "Full name", required: true, synonyms: ["name", "full name", "full_name", "client name", "contact name", "contact"] },
  { key: "phone", label: "Phone", synonyms: ["phone", "mobile", "phone number", "contact number", "mobile number", "cell", "cell phone"] },
  { key: "whatsapp", label: "WhatsApp", synonyms: ["whatsapp", "whatsapp number"] },
  { key: "email", label: "Email", synonyms: ["email", "e-mail", "email address"] },
  { key: "country", label: "Country", synonyms: ["country"] },
  { key: "city", label: "City", synonyms: ["city", "location", "town"] },
  { key: "source", label: "Source", synonyms: ["source", "lead source"] },
  { key: "tags", label: "Tags", synonyms: ["tags", "tag", "labels", "segment"] },
  { key: "notes", label: "Notes", synonyms: ["notes", "note", "remarks", "comment", "comments"] },
]

const NONE = "__none__"
const BATCH_SIZE = 300

function autoMap(headers: string[]): Record<string, string> {
  const norm = (s: string) => s.trim().toLowerCase()
  const map: Record<string, string> = {}
  for (const field of TARGET_FIELDS) {
    const hit = headers.find((h) => field.synonyms.includes(norm(h)))
    map[field.key] = hit ?? NONE
  }
  return map
}

export function ClientImportModal({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const { showToast } = useToast()
  const [step, setStep] = useState<"pick" | "map" | "importing" | "done">("pick")
  const [fileName, setFileName] = useState("")
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<string[][]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [importedCount, setImportedCount] = useState(0)

  const handleFile = async (file: File) => {
    const text = await file.text()
    const { headers: h, rows: r } = parseCsv(text)
    if (h.length === 0 || r.length === 0) {
      showToast("Couldn't find any rows in that file", "info")
      return
    }
    setFileName(file.name)
    setHeaders(h)
    setRows(r)
    setMapping(autoMap(h))
    setStep("map")
  }

  const preview = useMemo(() => rows.slice(0, 5), [rows])

  const hasNameMapped = mapping.full_name && mapping.full_name !== NONE
  const hasContactMapped = [mapping.phone, mapping.whatsapp, mapping.email].some((v) => v && v !== NONE)

  const buildRow = (row: string[]) => {
    const get = (key: string) => {
      const col = mapping[key]
      if (!col || col === NONE) return ""
      const idx = headers.indexOf(col)
      return idx === -1 ? "" : (row[idx] ?? "").trim()
    }
    const tagsRaw = get("tags")
    return {
      full_name: get("full_name"),
      phone: get("phone"),
      whatsapp: get("whatsapp"),
      email: get("email"),
      country: get("country"),
      city: get("city"),
      source: get("source") || "Import",
      tags: tagsRaw ? tagsRaw.split(/[,;|]/).map((t) => t.trim()).filter(Boolean) : [],
      status: "active",
      notes: get("notes"),
    }
  }

  const runImport = async () => {
    const built = rows.map(buildRow).filter((r) => r.full_name)
    if (built.length === 0) {
      showToast("No rows have a name in the mapped column", "info")
      return
    }
    setStep("importing")
    setProgress({ done: 0, total: built.length })
    let total = 0
    try {
      for (let i = 0; i < built.length; i += BATCH_SIZE) {
        const batch = built.slice(i, i + BATCH_SIZE)
        const res = await adminBulkImport("clients", batch)
        total += res.imported
        setProgress({ done: Math.min(i + BATCH_SIZE, built.length), total: built.length })
      }
      setImportedCount(total)
      setStep("done")
      onImported()
    } catch (err) {
      showToast(err instanceof Error ? `${err.message} (${total} imported before this)` : "Import failed", "info")
      setStep("map")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ocean-950/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-lift">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ocean-950">Import clients from CSV</h2>
          <button onClick={onClose} className="text-ocean-950/40 hover:text-ocean-950">
            <X size={18} />
          </button>
        </div>

        {step === "pick" && (
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-sand-300 p-10 text-center hover:border-ocean-300">
            <Upload size={24} className="text-ocean-950/30" />
            <p className="text-sm font-semibold text-ocean-950">Click to choose a .csv file</p>
            <p className="text-xs text-ocean-950/50">Exported from Excel, Google Sheets, or your phone's contacts. Any column headers are fine — you'll map them next.</p>
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
              }}
            />
          </label>
        )}

        {step === "map" && (
          <div>
            <p className="mb-3 text-xs text-ocean-950/50">
              {fileName} · {rows.length} rows found. Match each field to a column from your file.
            </p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {TARGET_FIELDS.map((f) => (
                <div key={f.key}>
                  <label className="mb-1 block text-xs font-semibold text-ocean-950/60">
                    {f.label} {f.required && <span className="text-sunset-500">*</span>}
                  </label>
                  <select
                    value={mapping[f.key] ?? NONE}
                    onChange={(e) => setMapping({ ...mapping, [f.key]: e.target.value })}
                    className="w-full rounded-lg border border-sand-200 px-2.5 py-2 text-sm outline-none focus:border-ocean-400"
                  >
                    <option value={NONE}>— not in file —</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {!hasContactMapped && (
              <p className="mt-3 rounded-lg bg-gold-400/15 px-3 py-2 text-xs text-ocean-950/70">
                No phone, WhatsApp or email mapped — these clients won't auto-link to any bookings or quotes later.
              </p>
            )}

            <div className="mt-4 overflow-x-auto rounded-xl border border-sand-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-sand-50 text-ocean-950/50">
                  <tr>
                    {headers.map((h) => (
                      <th key={h} className="whitespace-nowrap px-2.5 py-2 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-t border-sand-100">
                      {row.map((cell, j) => (
                        <td key={j} className="max-w-[160px] truncate whitespace-nowrap px-2.5 py-2 text-ocean-950/70">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setStep("pick")} className="rounded-full px-4 py-2.5 text-sm font-semibold text-ocean-950/60 hover:bg-sand-100">
                Back
              </button>
              <button
                onClick={runImport}
                disabled={!hasNameMapped}
                className="rounded-full bg-ocean-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-ocean-700 disabled:opacity-50"
              >
                Import {rows.length} clients
              </button>
            </div>
          </div>
        )}

        {step === "importing" && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <Loader2 size={26} className="animate-spin text-ocean-600" />
            <p className="text-sm font-semibold text-ocean-950">
              Importing {progress.done} / {progress.total}...
            </p>
            <p className="text-xs text-ocean-950/50">Don't close this window.</p>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <CheckCircle2 size={30} className="text-ocean-600" />
            <p className="text-sm font-semibold text-ocean-950">Imported {importedCount} clients</p>
            <button onClick={onClose} className="mt-2 rounded-full bg-ocean-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-ocean-700">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
