import { useEffect, useRef } from "react"
import { Bold, Italic, Link2, List, ListOrdered, Underline } from "lucide-react"
import { sanitizeRichText } from "../../lib/sanitizeHtml"

const TOOLBAR: { icon: typeof Bold; command: string; label: string; arg?: () => string | undefined }[] = [
  { icon: Bold, command: "bold", label: "Bold" },
  { icon: Italic, command: "italic", label: "Italic" },
  { icon: Underline, command: "underline", label: "Underline" },
  { icon: List, command: "insertUnorderedList", label: "Bulleted list" },
  { icon: ListOrdered, command: "insertOrderedList", label: "Numbered list" },
  { icon: Link2, command: "createLink", label: "Link", arg: () => window.prompt("Link URL") || undefined },
]

/** Minimal WYSIWYG toolbar over a contentEditable div. Output is sanitized on every change (and again at render time on the public site) before it's ever trusted as HTML. */
export function RichTextEditor({ value, onChange, placeholder }: { value: string; onChange: (html: string) => void; placeholder?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  // Only sync external value changes in (e.g. switching which day is being edited) —
  // never on every keystroke, or the cursor would jump to the start on each render.
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || ""
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const exec = (command: string, arg?: string) => {
    ref.current?.focus()
    document.execCommand(command, false, arg)
    if (ref.current) onChange(sanitizeRichText(ref.current.innerHTML))
  }

  return (
    <div className="overflow-hidden rounded-lg border border-sand-200 focus-within:border-ocean-400">
      <div className="flex items-center gap-0.5 border-b border-sand-200 bg-sand-50 px-1.5 py-1">
        {TOOLBAR.map((t) => (
          <button
            key={t.command}
            type="button"
            title={t.label}
            onMouseDown={(e) => {
              e.preventDefault()
              exec(t.command, t.arg?.())
            }}
            className="rounded p-1.5 text-ocean-950/60 hover:bg-sand-100 hover:text-ocean-950"
          >
            <t.icon size={13} />
          </button>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => ref.current && onChange(sanitizeRichText(ref.current.innerHTML))}
        onBlur={() => ref.current && onChange(sanitizeRichText(ref.current.innerHTML))}
        data-placeholder={placeholder}
        className="min-h-24 px-3 py-2 text-sm text-ocean-950 outline-none empty:before:text-ocean-950/30 empty:before:content-[attr(data-placeholder)]"
      />
    </div>
  )
}
