import { useMemo, useState } from "react"
import {
  AlignLeft,
  ArrowLeft,
  BarChart3,
  Columns2,
  Eye,
  EyeOff,
  ExternalLink,
  FileText,
  GripVertical,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  Mail,
  MapPin,
  Megaphone,
  MessageSquareQuote,
  Milestone,
  Package as PackageIcon,
  Pencil,
  Percent,
  Phone,
  Plus,
  Rows3,
  Search,
  Sparkles,
  Trash2,
  Type,
  Users,
  X,
  type LucideIcon,
} from "lucide-react"
import { useAdminResource } from "../../hooks/useAdminResource"
import { adminCreate, adminDelete, adminReorder, adminUpdate } from "../../lib/adminApi"
import { useToast } from "../../context/ToastContext"
import { BLOCK_TYPES, getBlockSchema } from "../../components/blocks/registry"
import { BlockContentEditor } from "../../components/admin/BlockContentEditor"
import { ImageUploadField } from "../../components/admin/ImageUploadField"
import { AdminPageHeader, AdminSkeletonLines, Badge } from "../../components/admin/AdminUI"
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

const BLOCK_TYPE_ICON: Record<string, LucideIcon> = {
  hero: ImageIcon,
  "page-banner": Rows3,
  "section-heading": Type,
  stats: BarChart3,
  steps: LayoutGrid,
  "feature-grid": LayoutGrid,
  testimonials: MessageSquareQuote,
  "cta-banner": Megaphone,
  milestones: Milestone,
  "faq-list": HelpCircle,
  "contact-info": Phone,
  "rich-text": AlignLeft,
  "image-text-split": Columns2,
  "contact-form": Mail,
  "search-widget": Search,
  "destinations-marquee": Sparkles,
  "trending-destinations": MapPin,
  "featured-packages": PackageIcon,
  "package-showcase": PackageIcon,
  "deals-strip": Percent,
  "supplier-network": Users,
}

export default function AdminPages() {
  const { items: blocks, setItems: setBlocks, loading: blocksLoading } = useAdminResource<BlockRow>("page-blocks")
  const { items: metaRows, setItems: setMetaRows, loading: metaLoading } = useAdminResource<MetaRow>("page-meta")
  const { showToast } = useToast()

  const [view, setView] = useState<"list" | "editor">("list")
  const [search, setSearch] = useState("")
  const [activePage, setActivePage] = useState(CORE_PAGES[0].slug)
  const [tab, setTab] = useState<"blocks" | "seo">("blocks")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftContent, setDraftContent] = useState<BlockContent>({})
  const [dragId, setDragId] = useState<string | null>(null)
  const [showAddBlock, setShowAddBlock] = useState(false)
  const [blockSearch, setBlockSearch] = useState("")
  const [showNewPage, setShowNewPage] = useState(false)
  const [newPageLabel, setNewPageLabel] = useState("")
  const [newPageSlug, setNewPageSlug] = useState("")
  const [newPageError, setNewPageError] = useState<string | null>(null)

  const pages = useMemo(() => {
    const customSlugs = metaRows.map((m) => m.id).filter((slug) => !CORE_SLUGS.has(slug))
    const custom = [...new Set(customSlugs)].sort().map((slug) => ({ slug, label: humanize(slug), core: false }))
    return [...CORE_PAGES.map((p) => ({ ...p, core: true })), ...custom]
  }, [metaRows])

  const filteredPages = useMemo(
    () => pages.filter((p) => p.label.toLowerCase().includes(search.trim().toLowerCase())),
    [pages, search],
  )

  const pageBlocks = blocks.filter((b) => b.page === activePage).sort((a, b) => a.position - b.position)
  const meta = metaRows.find((m) => m.id === activePage)
  const activeLabel = pages.find((p) => p.slug === activePage)?.label ?? humanize(activePage)

  const openEditor = (slug: string) => {
    setActivePage(slug)
    setTab("blocks")
    setEditingId(null)
    setView("editor")
  }

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
      setShowNewPage(false)
      setNewPageLabel("")
      setNewPageSlug("")
      setNewPageError(null)
      showToast(`Page "${humanize(slug)}" created — add blocks below`)
      openEditor(slug)
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
      if (activePage === slug) {
        setActivePage(CORE_PAGES[0].slug)
        setView("list")
      }
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

  const addBlock = async (type: string) => {
    const schema = getBlockSchema(type)
    if (!schema) return
    const id = `${activePage}-${type}-${Date.now()}`
    try {
      const created = await adminCreate<BlockRow>("page-blocks", {
        id,
        page: activePage,
        type,
        position: pageBlocks.length,
        visible: true,
        content: schema.defaultContent(),
      })
      setBlocks((prev) => [...prev, created])
      setShowAddBlock(false)
      setBlockSearch("")
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

  if (view === "list") {
    return (
      <div>
        <AdminPageHeader
          icon={Layers}
          title="Pages"
          subtitle="Edit the content blocks and SEO details for every page — like a CMS."
          action={
            !showNewPage && (
              <button
                onClick={() => setShowNewPage(true)}
                className="flex items-center gap-1.5 rounded-full bg-ocean-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ocean-700"
              >
                <Plus size={15} /> Create New
              </button>
            )
          }
        />

        {showNewPage && (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-ocean-300 bg-surface p-3">
            <input
              autoFocus
              value={newPageLabel}
              onChange={(e) => {
                setNewPageLabel(e.target.value)
                setNewPageError(null)
              }}
              placeholder="Page name"
              className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-ocean-400"
            />
            <span className="text-ocean-950/30">/</span>
            <input
              value={newPageSlug}
              onChange={(e) => setNewPageSlug(e.target.value)}
              placeholder={slugify(newPageLabel) || "url-slug"}
              className="w-40 rounded-lg border border-sand-200 px-3 py-2 text-sm text-ocean-950/70 outline-none focus:border-ocean-400"
            />
            <button onClick={createPage} className="rounded-full bg-ocean-600 px-4 py-2 text-sm font-bold text-white">
              Create
            </button>
            <button
              onClick={() => {
                setShowNewPage(false)
                setNewPageError(null)
              }}
              className="rounded-full p-2 text-ocean-950/40 hover:bg-sand-100"
            >
              <X size={16} />
            </button>
            {newPageError && <p className="w-full text-xs font-medium text-sunset-600">{newPageError}</p>}
          </div>
        )}

        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-sand-200 bg-surface px-3 py-2">
          <Search size={15} className="text-ocean-950/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-sand-200 bg-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-sand-200 text-xs font-bold uppercase tracking-wide text-ocean-950/40">
                <th className="px-4 py-3 font-bold">Title</th>
                <th className="px-4 py-3 font-bold">Slug</th>
                <th className="px-4 py-3 font-bold">Layout</th>
                <th className="px-4 py-3 font-bold">SEO title</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {(blocksLoading || metaLoading) &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-3">
                      <div className="h-6 animate-pulse rounded bg-sand-100" style={{ width: `${70 - i * 8}%` }} />
                    </td>
                  </tr>
                ))}
              {!blocksLoading &&
                !metaLoading &&
                filteredPages.map((p) => {
                  const pBlocks = blocks.filter((b) => b.page === p.slug).sort((a, b) => a.position - b.position)
                  const pMeta = metaRows.find((m) => m.id === p.slug)
                  return (
                    <tr key={p.slug} className="cursor-pointer transition-colors hover:bg-sand-50" onClick={() => openEditor(p.slug)}>
                      <td className="px-4 py-3.5">
                        <span className="font-display text-sm font-bold text-ocean-950 hover:text-ocean-600">{p.label}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <code className="rounded bg-sand-100 px-1.5 py-0.5 font-mono text-xs text-ocean-950/70">{pagePath(p.slug)}</code>
                      </td>
                      <td className="max-w-xs px-4 py-3.5">
                        {pBlocks.length === 0 ? (
                          <span className="text-xs text-ocean-950/35">No blocks yet</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {pBlocks.slice(0, 3).map((b) => (
                              <Badge key={b.id} tone="neutral">
                                {getBlockSchema(b.type)?.label ?? b.type}
                              </Badge>
                            ))}
                            {pBlocks.length > 3 && <Badge tone="neutral">+{pBlocks.length - 3} more</Badge>}
                          </div>
                        )}
                      </td>
                      <td className="max-w-[220px] truncate px-4 py-3.5 text-xs text-ocean-950/50">{pMeta?.title || "—"}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <a
                            href={pagePath(p.slug)}
                            target="_blank"
                            rel="noreferrer"
                            title="View live"
                            className="rounded-lg p-2 text-ocean-950/40 hover:bg-sand-100 hover:text-ocean-700"
                          >
                            <ExternalLink size={14} />
                          </a>
                          <button onClick={() => openEditor(p.slug)} title="Edit" className="rounded-lg p-2 text-ocean-950/40 hover:bg-sand-100 hover:text-ocean-700">
                            <Pencil size={14} />
                          </button>
                          {!p.core && (
                            <button onClick={() => deletePage(p.slug)} title="Delete page" className="rounded-lg p-2 text-ocean-950/40 hover:bg-sand-100 hover:text-sunset-600">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              {!blocksLoading && !metaLoading && filteredPages.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-ocean-950/40">
                    No pages match "{search}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => setView("list")}
        className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-ocean-950/60 hover:text-ocean-700"
      >
        <ArrowLeft size={15} /> All pages
      </button>

      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-ocean-950">{activeLabel}</h1>
        {!CORE_SLUGS.has(activePage) && (
          <button
            onClick={() => deletePage(activePage)}
            className="flex items-center gap-1.5 rounded-full border border-sand-200 px-3.5 py-2 text-xs font-semibold text-ocean-950/60 hover:border-sunset-300 hover:text-sunset-600"
          >
            <Trash2 size={13} /> Delete page
          </button>
        )}
      </div>
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

      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <div>
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
              <button
                onClick={() => setShowAddBlock(true)}
                className="mb-4 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-sand-300 bg-surface py-3 text-sm font-semibold text-ocean-950/60 hover:border-ocean-300 hover:text-ocean-700"
              >
                <Plus size={15} /> Add Block
              </button>

              {blocksLoading && (
                <div className="mb-2 space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-14 animate-pulse rounded-xl bg-sand-100" />
                  ))}
                </div>
              )}

              <div className="space-y-2">
                {pageBlocks.map((b, i) => {
                  const schema = getBlockSchema(b.type)
                  const isEditing = editingId === b.id
                  return (
                    <div
                      key={b.id}
                      draggable
                      onDragStart={() => setDragId(b.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => onDrop(b.id)}
                      className={cn("rounded-2xl border bg-surface transition-colors", isEditing ? "border-ocean-300" : "border-sand-200")}
                    >
                      <div className="flex items-center gap-2 p-3">
                        <span className="w-5 shrink-0 text-center text-xs font-bold text-ocean-950/30">{String(i + 1).padStart(2, "0")}</span>
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

        <div className="h-fit rounded-2xl border border-sand-200 bg-surface p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ocean-950/40">Page info</p>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs text-ocean-950/40">Slug</dt>
              <dd className="font-mono text-ocean-950/80">{activePage}</dd>
            </div>
            <div>
              <dt className="text-xs text-ocean-950/40">Blocks</dt>
              <dd className="text-ocean-950/80">{pageBlocks.length} total, {pageBlocks.filter((b) => b.visible).length} visible</dd>
            </div>
            <div>
              <dt className="text-xs text-ocean-950/40">Type</dt>
              <dd className="text-ocean-950/80">{CORE_SLUGS.has(activePage) ? "Core page" : "Custom page"}</dd>
            </div>
          </dl>
          <a
            href={pagePath(activePage)}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex items-center justify-center gap-1.5 rounded-full border border-sand-200 px-3 py-2 text-xs font-semibold text-ocean-950/70 hover:border-ocean-300 hover:text-ocean-700"
          >
            <ExternalLink size={12} /> View live page
          </a>
        </div>
      </div>

      {showAddBlock && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-12 backdrop-blur-sm sm:pt-20"
          onClick={() => setShowAddBlock(false)}
        >
          <div className="w-full max-w-4xl rounded-3xl bg-surface shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-sand-200 p-5">
              <h2 className="font-display text-2xl font-bold text-ocean-950">Add Block</h2>
              <button onClick={() => setShowAddBlock(false)} className="rounded-full p-2 text-ocean-950/40 hover:bg-sand-100">
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-sand-200 px-3.5 py-2.5">
                <Search size={16} className="shrink-0 text-ocean-950/40" />
                <input
                  autoFocus
                  value={blockSearch}
                  onChange={(e) => setBlockSearch(e.target.value)}
                  placeholder="Search for a block"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
              <div className="grid max-h-[55vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4">
                {BLOCK_TYPES.filter((t) => (getBlockSchema(t)?.label ?? t).toLowerCase().includes(blockSearch.trim().toLowerCase())).map((t) => {
                  const schema = getBlockSchema(t)
                  const Icon = BLOCK_TYPE_ICON[t] ?? Layers
                  return (
                    <button
                      key={t}
                      onClick={() => addBlock(t)}
                      className="group flex flex-col overflow-hidden rounded-xl border border-sand-200 text-left transition-all hover:-translate-y-0.5 hover:border-ocean-300 hover:shadow-card"
                    >
                      <div className="flex h-20 items-center justify-center bg-gradient-to-br from-sand-100 to-sand-50 text-ocean-950/25 transition-colors group-hover:text-ocean-500">
                        <Icon size={26} />
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-semibold leading-tight text-ocean-950">{schema?.label ?? t}</p>
                        {schema?.liveData && (
                          <span className="mt-1.5 inline-block rounded-full bg-ocean-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-ocean-600">
                            Live data
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
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

  if (loading) return <div className="rounded-2xl border border-sand-200 bg-surface p-5"><AdminSkeletonLines count={3} /></div>

  return (
    <div className="space-y-3 rounded-2xl border border-sand-200 bg-surface p-5">
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
