import { useState } from "react"
import { Eye, EyeOff, FileText, GripVertical, Layers, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { useAdminResource } from "../../hooks/useAdminResource"
import { adminCreate, adminDelete, adminReorder, adminUpdate } from "../../lib/adminApi"
import { useToast } from "../../context/ToastContext"
import { BLOCK_TYPES, getBlockSchema } from "../../components/blocks/registry"
import { BlockContentEditor } from "../../components/admin/BlockContentEditor"
import { defaultMetaByPage } from "../../data/pageBlocks"
import type { BlockContent } from "../../data/types"
import { cn } from "../../lib/utils"

interface BlockRow {
  id: string
  page: string
  type: string
  position: number
  visible: boolean
  content: BlockContent
}

interface MetaRow {
  id: string
  title: string
  description: string
  og_image: string
}

const MANAGED_PAGES = [
  { slug: "home", label: "Home" },
  { slug: "about", label: "About" },
  { slug: "contact", label: "Contact" },
]

export default function AdminPages() {
  const { items: blocks, setItems: setBlocks, loading: blocksLoading } = useAdminResource<BlockRow>("page-blocks")
  const { items: metaRows, setItems: setMetaRows, loading: metaLoading } = useAdminResource<MetaRow>("page-meta")
  const { showToast } = useToast()

  const [activePage, setActivePage] = useState(MANAGED_PAGES[0].slug)
  const [tab, setTab] = useState<"blocks" | "seo">("blocks")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftContent, setDraftContent] = useState<BlockContent>({})
  const [addingType, setAddingType] = useState("")
  const [dragId, setDragId] = useState<string | null>(null)

  const pageBlocks = blocks.filter((b) => b.page === activePage).sort((a, b) => a.position - b.position)
  const meta = metaRows.find((m) => m.id === activePage)

  const startEdit = (b: BlockRow) => {
    setEditingId(b.id)
    setDraftContent(b.content)
  }

  const saveEdit = async () => {
    if (!editingId) return
    try {
      const updated = await adminUpdate<BlockRow>("page-blocks", editingId, { content: draftContent })
      setBlocks((prev) => prev.map((b) => (b.id === editingId ? updated : b)))
      setEditingId(null)
      showToast("Block updated")
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save block", "info")
    }
  }

  const addBlock = async () => {
    if (!addingType) return
    const schema = getBlockSchema(addingType)
    if (!schema) return
    const id = `${activePage}-${addingType}-${Date.now()}`
    try {
      const created = await adminCreate<BlockRow>("page-blocks", {
        id,
        page: activePage,
        type: addingType,
        position: pageBlocks.length,
        visible: true,
        content: schema.defaultContent(),
      })
      setBlocks((prev) => [...prev, created])
      setAddingType("")
      showToast("Block added — edit it to fill in content")
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to add block", "info")
    }
  }

  const toggleVisible = async (b: BlockRow) => {
    try {
      const updated = await adminUpdate<BlockRow>("page-blocks", b.id, { visible: !b.visible })
      setBlocks((prev) => prev.map((x) => (x.id === b.id ? updated : x)))
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update", "info")
    }
  }

  const removeBlock = async (id: string) => {
    if (!confirm("Delete this block? This can't be undone.")) return
    try {
      await adminDelete("page-blocks", id)
      setBlocks((prev) => prev.filter((b) => b.id !== id))
      showToast("Block deleted")
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete", "info")
    }
  }

  const duplicateToPage = async (b: BlockRow, targetPage: string) => {
    const id = `${targetPage}-${b.type}-${Date.now()}`
    const targetCount = blocks.filter((x) => x.page === targetPage).length
    try {
      const created = await adminCreate<BlockRow>("page-blocks", {
        id,
        page: targetPage,
        type: b.type,
        position: targetCount,
        visible: true,
        content: b.content,
      })
      setBlocks((prev) => [...prev, created])
      showToast(`Copied to ${MANAGED_PAGES.find((p) => p.slug === targetPage)?.label ?? targetPage}`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to copy block", "info")
    }
  }

  const onDrop = async (targetId: string) => {
    if (!dragId || dragId === targetId) {
      setDragId(null)
      return
    }
    const ids = pageBlocks.map((b) => b.id)
    const from = ids.indexOf(dragId)
    const to = ids.indexOf(targetId)
    if (from === -1 || to === -1) return
    const reordered = [...ids]
    reordered.splice(from, 1)
    reordered.splice(to, 0, dragId)
    setDragId(null)

    setBlocks((prev) =>
      prev.map((b) => {
        if (b.page !== activePage) return b
        const idx = reordered.indexOf(b.id)
        return idx === -1 ? b : { ...b, position: idx }
      }),
    )
    try {
      await adminReorder("page-blocks", reordered)
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to reorder", "info")
    }
  }

  const saveMeta = async (form: { title: string; description: string; og_image: string }) => {
    try {
      if (meta) {
        const updated = await adminUpdate<MetaRow>("page-meta", activePage, form)
        setMetaRows((prev) => prev.map((m) => (m.id === activePage ? updated : m)))
      } else {
        const created = await adminCreate<MetaRow>("page-meta", { id: activePage, ...form })
        setMetaRows((prev) => [...prev, created])
      }
      showToast("SEO details saved")
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save", "info")
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ocean-950">
          <Layers size={22} /> Pages
        </h1>
        <p className="text-sm text-ocean-950/60">Edit the content blocks and SEO details for every page — like a CMS.</p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {MANAGED_PAGES.map((p) => (
          <button
            key={p.slug}
            onClick={() => setActivePage(p.slug)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              activePage === p.slug ? "border-ocean-600 bg-ocean-600 text-white" : "border-sand-200 text-ocean-950/70 hover:border-ocean-300",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mb-5 flex gap-1 border-b border-sand-200">
        <button
          onClick={() => setTab("blocks")}
          className={cn("flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-semibold", tab === "blocks" ? "border-ocean-600 text-ocean-950" : "border-transparent text-ocean-950/50")}
        >
          <Layers size={14} /> Content Blocks
        </button>
        <button
          onClick={() => setTab("seo")}
          className={cn("flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-semibold", tab === "seo" ? "border-ocean-600 text-ocean-950" : "border-transparent text-ocean-950/50")}
        >
          <Search size={14} /> SEO / Meta
        </button>
      </div>

      {tab === "blocks" ? (
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-sand-200 bg-white p-3">
            <select value={addingType} onChange={(e) => setAddingType(e.target.value)} className="flex-1 rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400 sm:flex-none">
              <option value="">Choose a block type to add...</option>
              {BLOCK_TYPES.map((t) => (
                <option key={t} value={t}>
                  {getBlockSchema(t)?.label ?? t}
                </option>
              ))}
            </select>
            <button
              onClick={addBlock}
              disabled={!addingType}
              className="flex items-center gap-1.5 rounded-full bg-ocean-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              <Plus size={15} /> Add block to {MANAGED_PAGES.find((p) => p.slug === activePage)?.label}
            </button>
          </div>

          {blocksLoading && <p className="text-sm text-ocean-950/50">Loading...</p>}

          <div className="space-y-2">
            {pageBlocks.map((b) => {
              const schema = getBlockSchema(b.type)
              const isEditing = editingId === b.id
              return (
                <div
                  key={b.id}
                  draggable
                  onDragStart={() => setDragId(b.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDrop(b.id)}
                  className={cn("rounded-2xl border bg-white transition-colors", isEditing ? "border-ocean-300" : "border-sand-200")}
                >
                  <div className="flex items-center gap-2 p-3">
                    <span className="cursor-grab text-ocean-950/30">
                      <GripVertical size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-sm font-semibold text-ocean-950">
                        <FileText size={14} className="shrink-0 text-ocean-950/40" />
                        {schema?.label ?? b.type}
                        {!b.visible && <span className="rounded-full bg-sand-200 px-2 py-0.5 text-[10px] font-bold uppercase text-ocean-950/50">Hidden</span>}
                        {schema?.liveData && <span className="rounded-full bg-ocean-50 px-2 py-0.5 text-[10px] font-bold uppercase text-ocean-600">Live data</span>}
                      </p>
                      <p className="truncate text-xs text-ocean-950/50">{schema?.description}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button onClick={() => toggleVisible(b)} title={b.visible ? "Hide" : "Show"} className="rounded-lg p-2 text-ocean-950/50 hover:bg-sand-100">
                        {b.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>
                      <button onClick={() => (isEditing ? setEditingId(null) : startEdit(b))} className="rounded-lg p-2 text-ocean-950/50 hover:bg-sand-100">
                        <Pencil size={15} />
                      </button>
                      <select
                        onChange={(e) => {
                          if (e.target.value) duplicateToPage(b, e.target.value)
                          e.target.value = ""
                        }}
                        defaultValue=""
                        title="Copy to another page"
                        className="rounded-lg border border-sand-200 p-1.5 text-xs text-ocean-950/50"
                      >
                        <option value="" disabled>
                          Copy to...
                        </option>
                        {MANAGED_PAGES.filter((p) => p.slug !== activePage).map((p) => (
                          <option key={p.slug} value={p.slug}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                      <button onClick={() => removeBlock(b.id)} className="rounded-lg p-2 text-ocean-950/50 hover:bg-sand-100 hover:text-sunset-600">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="border-t border-sand-100 p-4">
                      <BlockContentEditor type={b.type} content={draftContent} onChange={setDraftContent} />
                      <div className="mt-4 flex justify-end gap-2">
                        <button onClick={() => setEditingId(null)} className="rounded-full border border-sand-200 px-4 py-2 text-sm font-semibold text-ocean-950/70">
                          Cancel
                        </button>
                        <button onClick={saveEdit} className="rounded-full bg-ocean-600 px-4 py-2 text-sm font-bold text-white">
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            {!blocksLoading && pageBlocks.length === 0 && (
              <p className="rounded-2xl border border-dashed border-sand-300 p-8 text-center text-sm text-ocean-950/50">
                No blocks on this page yet — add one above.
              </p>
            )}
          </div>
        </div>
      ) : (
        <SeoForm loading={metaLoading} initial={meta} page={activePage} onSave={saveMeta} />
      )}
    </div>
  )
}

function SeoForm({
  page,
  initial,
  loading,
  onSave,
}: {
  page: string
  initial?: MetaRow
  loading: boolean
  onSave: (form: { title: string; description: string; og_image: string }) => void
}) {
  const fallback = defaultMetaByPage[page]
  const [form, setForm] = useState({
    title: initial?.title ?? fallback?.title ?? "",
    description: initial?.description ?? fallback?.description ?? "",
    og_image: initial?.og_image ?? fallback?.ogImage ?? "",
  })

  if (loading) return <p className="text-sm text-ocean-950/50">Loading...</p>

  return (
    <div className="max-w-2xl space-y-3 rounded-2xl border border-sand-200 bg-white p-5">
      <div>
        <label className="mb-1 block text-xs font-semibold text-ocean-950/60">Page title (browser tab / search results)</label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-ocean-950/60">Meta description</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-ocean-950/60">Social share image URL</label>
        <input
          value={form.og_image}
          onChange={(e) => setForm({ ...form, og_image: e.target.value })}
          className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
        />
      </div>
      <button onClick={() => onSave(form)} className="rounded-full bg-ocean-600 px-5 py-2.5 text-sm font-bold text-white">
        Save SEO details
      </button>
    </div>
  )
}
