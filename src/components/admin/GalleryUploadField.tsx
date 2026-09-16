import { useRef, useState } from "react"
import { Image as ImageIcon, Loader2, Plus, UploadCloud, X } from "lucide-react"
import { adminUploadImage } from "../../lib/adminApi"

const MAX_BYTES = 3 * 1024 * 1024

/** Thumbnail grid with bulk file upload, plus a fallback paste-a-URL input. */
export function GalleryUploadField({
  label,
  values,
  onChange,
}: {
  label: string
  values: string[]
  onChange: (values: string[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [urlDraft, setUrlDraft] = useState("")

  const uploadOne = async (file: File): Promise<string | null> => {
    if (!file.type.startsWith("image/")) {
      setError(`${file.name} isn't an image`)
      return null
    }
    if (file.size > MAX_BYTES) {
      setError(`${file.name} is over 3MB`)
      return null
    }
    const dataBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "")
      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsDataURL(file)
    })
    const { url } = await adminUploadImage({ filename: file.name, contentType: file.type, dataBase64 })
    return url
  }

  const handleFiles = async (files: FileList) => {
    setError(null)
    setUploading(true)
    try {
      const uploaded: string[] = []
      for (const file of Array.from(files)) {
        const url = await uploadOne(file)
        if (url) uploaded.push(url)
      }
      if (uploaded.length) onChange([...values, ...uploaded])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i))

  const addUrl = () => {
    const v = urlDraft.trim()
    if (!v) return
    onChange([...values, v])
    setUrlDraft("")
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="block text-xs font-semibold text-ocean-950/60">{label}</label>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 rounded-full border border-sand-200 px-3 py-1 text-xs font-semibold text-ocean-950/70 hover:border-ocean-300 disabled:opacity-50"
        >
          {uploading ? <Loader2 size={12} className="animate-spin" /> : <UploadCloud size={12} />}
          {uploading ? "Uploading..." : "Upload images"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files)
            e.target.value = ""
          }}
        />
      </div>

      <div className="rounded-lg border border-sand-200 p-2">
        {values.length > 0 ? (
          <div className="mb-2 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {values.map((v, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-sand-200 bg-sand-100">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <img src={v} alt="" className="h-full w-full object-cover" onError={(e: any) => (e.currentTarget.style.opacity = "0.25")} />
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-2 flex h-16 items-center justify-center gap-1.5 rounded-lg border border-dashed border-sand-300 text-xs text-ocean-950/30">
            <ImageIcon size={14} /> No gallery images yet
          </div>
        )}
        <div className="flex gap-1.5">
          <input
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addUrl()
              }
            }}
            placeholder="Or paste an image URL and press Enter"
            className="w-full rounded-md border border-sand-200 px-2.5 py-1.5 text-xs outline-none focus:border-ocean-400"
          />
          <button type="button" onClick={addUrl} title="Add" className="shrink-0 rounded-md bg-ocean-600 px-2.5 text-white hover:bg-ocean-700">
            <Plus size={13} />
          </button>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-sunset-600">{error}</p>}
    </div>
  )
}
