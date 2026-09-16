import { useMemo, useState } from "react"
import { Eye, EyeOff, ExternalLink, FileText, GripVertical, Layers, Pencil, Plus, Search, Trash2, X } from "lucide-react"
import { useAdminResource } from "../../hooks/useAdminResource"
import { adminCreate, adminDelete, adminReorder, adminUpdate } from "../../lib/adminApi"
import { useToast } from "../../context/ToastContext"
import { BLOCK_TYPES, getBlockSchema } from "../../components/blocks/registry"
import { BlockContentEditor } from "../../components/admin/BlockContentEditor"
import { ImageUploadField } from "../../components/admin/ImageUploadField"
import { AdminPageHeader } from "../../components/admin/AdminUI"
import { defaultMetaByPage } from "../../data/pageBlocks"
import type { BlockContent } from "../../data/types"
import { cn, humanize, slugify } from "../../lib/utils"

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

const CORE_PAGES = [
  { slug: "home", label: "Home" },
  { slug: "about", label: "About" },
  { slug: "contact", label: "Contact" },
]
const CORE_SLUGS = new Set(CORE_PAGES.map((p) => p.slug))

// Top-level paths already used by real routes elsewhere in the app — a
// custom page can't reuse one of these or it would just be shadowed.
const RESERVED_SLUGS = new Set([
  "explore",
  "package",
  "build-trip",
  "checkout",
  "booking-confirmation",
  "destinations",
  "deals",
  "suppliers",
  "login",
  "signup",
  "dashboard",
  "wishlist",
  "compare",
  "admin",
  "itinerary",
  ...CORE_SLUGS,
])

function pagePath(slug: string) {
  return slug === "home" ? "/" : `/${slug}`
}

export default function AdminPages() {
  const { items: blocks, setItems: setBlocks, loading: blocksLoading } = useAdminResource<BlockRow>("page-blocks")
  const { items: metaRows, setItems: setMetaRows, loading: metaLoading } = useAdminResource<MetaRow>("page-meta")
  const { showToast } = useToast()

  const [activePage, setActivePage] = useState(CORE_PAGES[0].slug)
  const [tab, setTab] = useState<"blocks" | "seo">("blocks")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftContent, setDraftContent] = useState<BlockContent>({})
  const [addingType, setAddingType] = useState("")
  const [dragId, setDragId] = useState<string | null>(null)
  const [showNewPage, setShowNewPage] = useState(false)
  const [newPageLabel, setNewPageLabel] = useState("")
  const [newPageSlug, setNewPageSlug] = useState("")
  const [newPageError, setNewPageError] = useState<string | null>(null)

  const pages = useMemo(() => {
    const customSlugs = metaRows.map((m) => m.id).filter((slug) => !CORE_SLUGS.has(slug))
    const custom = [...new Set(customSlugs)].sort().map((slug) => ({ slug, label: humanize(slug), core: false }))
    return [...CORE_PAGES.map((p) => ({ ...p, core: true })), ...custom]
  }, [metaRows])

  const pageBlocks = blocks.filter((b) => b.page === activePage).sort((a, b) => a.position - b.position)
  const meta = metaRows.find((m) => m.id === activePage)

  const createPage = async () => {
    const slug = slugify(newPageSlug || newPageLabel)
    if (!newPageLabel.trim()) {
      setNewPageError("Give the page a name")
      return
    }
    if (!slug) {
      setNewPageError("Enter a valid URL slug")
      return
    }
    if (RESERVED_SLUGS.has(slug) || pages.some((p) => p.slug === slug)) {
      setNewPageError(`"/${slug}" is already in use — pick a different URL`)
      return
    }
    try {
      const created = await adminCreate<MetaRow>("page-meta", { id: slug, title: newPageLabel.trim(), description: "", og_image: "" })
      setMetaRows((prev) => [...prev, created])
      setActivePage(slug)
      setShowNewPage(false)
      setNewPageLabel("")
      setNewPageSlug("")
      setNewPageError(null)
      showToast(`Page "${humanize(slug)}" created — add blocks below`)
    } catch (err) {
      setNewPageError(err instanceof Error ? err.message : "Failed to create page")
    }
  }

  const deletePage = async (slug: string) => {
    if (!confirm(`Delete the page "${humanize(slug)}" and all its blocks? This can't be undone.`)) return
    try {
      const ids = blocks.filter((b) => b.page === slug).map((b) => b.id)
      await Promise.all(ids.map((id) => adminDelete("page-blocks", id)))
      await adminDelete("page-meta", slug)
      setBlocks((prev) => prev.filter((b) => b.page !== slug))
      setMetaRows((prev) => prev.filter((m) => m.id !== slug))
      if (activePage === slug) setActivePage(CORE_PAGES[0].slug)
      showToast("Page deleted")
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete page", "info")
    }
  }

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
      showToast(`Copied to ${pages.find((p) => p.slug === targetPage)?.label ?? targetPage}`)
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
      <AdminPageHeader icon={Layers} title="Pages" subtitle="Edit the content blocks and SEO details for every page — like a CMS." />

      <div className="mb-2 flex flex-wrap items-center gap-2">
        {pages.map((p) => (
          <span key={p.slug} className="group relative inline-flex">
            <button
              onClick={() => setActivePage(p.slug)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                activePage === p.slug ? "border-ocean-600 bg-ocean-600 text-white" : "border-sand-200 text-ocean-950/70 hover:border-ocean-300",
                !p.core && "pr-7",
              )}
            >
              {p.label}
            </button>
            {!p.core && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deletePage(p.slug)
                }}
                title="Delete page"
                className={cn(
                  "absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-0.5",
                  activePage === p.slug ? "text-white/70 hover:text-white" : "text-ocean-950/40 hover:text-sunset-600",
                )}
              >
                <X size={13} />
              </button>
            )}
          </span>
        ))}

        {showNewPage ? (
          <div className="flex flex-wrap items-center gap-1.5 rounded-full border border-ocean-300 bg-white py-1 pl-3 pr-1.5">
            <input
              autoFocus
              value={newPageLabel}
              onChange={(e) => {
                setNewPageLabel(e.target.value)
                if (!newPageSlug) setNewPageError(null)
              }}
              placeholder="Page name"
              className="w-28 border-0 bg-transparent text-sm outline-none"
            />
            <span className="text-ocean-950/30">/</span>
            <input
              value={newPageSlug}
              onChange={(e) => setNewPageSlug(e.target.value)}
              placeholder={slugify(newPageLabel) || "url-slug"}
              className="w-28 border-0 bg-transparent text-sm text-ocean-950/60 outline-none"
            />
            <button onClick={createPage} className="rounded-full bg-ocean-600 px-3 py-1.5 text-xs font-bold text-white">
              Create
            </button>
            <button
              onClick={() => {
                setShowNewPage(false)
                setNewPageError(null)
              }}
              className="rounded-full p-1.5 text-ocean-950/40 hover:bg-sand-100"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowNewPage(true)}
            className="flex items-center gap-1 rounded-full border border-dashed border-sand-300 px-4 py-2 text-sm font-semibold text-ocean-950/60 hover:border-ocean-300 hover:text-ocean-700"
          >
            <Plus size={15} /> New page
          </button>
        )}
      </div>
      {newPageError && <p className="mb-3 text-xs font-medium text-sunset-600">{newPageError}</p>}

      <div className="mb-5 flex items-center gap-1.5 text-xs text-ocean-950/50">
        <span>Reference:</span>
        <code className="rounded bg-sand-100 px-1.5 py-0.5 font-mono text-ocean-950/70">{pagePath(activePage)}</code>
        <a
          href={pagePath(activePage)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-0.5 font-semibold text-ocean-600 hover:text-ocean-700"
        >
          View live <ExternalLink size={11} />
        </a>
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
              <Plus size={15} /> Add block to {pages.find((p) => p.slug === activePage)?.label}
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
                        {pages.filter((p) => p.slug !== activePage).map((p) => (
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
        <SeoForm key={activePage} loading={metaLoading} initial={meta} page={activePage} onSave={saveMeta} />
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
        <label className="mb-1 block text-xs font-semibold text-ocean-950/60">Social share image</label>
        <ImageUploadField value={form.og_image} onChange={(v) => setForm({ ...form, og_image: v })} />
      </div>
      <button onClick={() => onSave(form)} className="rounded-full bg-ocean-600 px-5 py-2.5 text-sm font-bold text-white">
        Save SEO details
      </button>
    </div>
  )
}
