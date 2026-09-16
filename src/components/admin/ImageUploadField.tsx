import { useRef, useState } from "react"
import { Image as ImageIcon, Loader2, UploadCloud } from "lucide-react"
import { adminUploadImage } from "../../lib/adminApi"

const MAX_BYTES = 3 * 1024 * 1024

export function ImageUploadField({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (url: string) => void
  placeholder?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setError(null)
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file")
      return
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be under 3MB")
      return
    }
    setUploading(true)
    try {
      const dataBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "")
        reader.onerror = () => reject(new Error("Failed to read file"))
        reader.readAsDataURL(file)
      })
      const { url } = await adminUploadImage({ filename: file.name, contentType: file.type, dataBase64 })
      onChange(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={placeholder ?? "Paste an image URL, or upload one →"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-sand-200 px-3 py-2 text-xs font-semibold text-ocean-950/70 hover:border-ocean-300 disabled:opacity-50"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
          {uploading ? "Uploading..." : "Upload"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ""
          }}
        />
      </div>
      {error && <p className="text-xs text-sunset-600">{error}</p>}
      {value ? (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <img src={value} alt="" className="h-20 w-full rounded-lg object-cover" onError={(e: any) => (e.currentTarget.style.display = "none")} />
      ) : (
        <div className="flex h-16 items-center justify-center gap-1.5 rounded-lg border border-dashed border-sand-300 text-xs text-ocean-950/30">
          <ImageIcon size={14} /> No image yet
        </div>
      )}
    </div>
  )
}
