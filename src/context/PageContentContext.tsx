import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { supabase, supabaseConfigured } from "../lib/supabaseClient"
import { mapPageBlockRow, mapPageMetaRow } from "../lib/mappers"
import type { PageBlock, PageMeta } from "../data/types"
import { defaultBlocksByPage, defaultMetaByPage } from "../data/pageBlocks"

interface PageContentValue {
  getBlocks: (page: string) => PageBlock[]
  getMeta: (page: string) => PageMeta | undefined
  refresh: () => void
}

const PageContentContext = createContext<PageContentValue | undefined>(undefined)

const fallbackBlocks = Object.values(defaultBlocksByPage).flat()
const fallbackMeta = Object.values(defaultMetaByPage)

export function PageContentProvider({ children }: { children: ReactNode }) {
  const [blocks, setBlocks] = useState<PageBlock[]>(fallbackBlocks)
  const [meta, setMeta] = useState<PageMeta[]>(fallbackMeta)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!supabaseConfigured) return

      try {
        const [blockRes, metaRes] = await Promise.all([
          supabase.from("page_blocks").select("*").order("position", { ascending: true }),
          supabase.from("page_meta").select("*"),
        ])

        if (blockRes.error) throw blockRes.error
        if (metaRes.error) throw metaRes.error

        if (!cancelled) {
          if (blockRes.data.length) setBlocks(blockRes.data.map(mapPageBlockRow))
          if (metaRes.data.length) setMeta(metaRes.data.map(mapPageMetaRow))
        }
      } catch (err) {
        console.error("Failed to load page content from Supabase — falling back to defaults.", err)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [nonce])

  const getBlocks = (page: string) =>
    blocks.filter((b) => b.page === page && b.visible).sort((a, b) => a.position - b.position)

  const getMeta = (page: string) => meta.find((m) => m.page === page)

  return (
    <PageContentContext.Provider value={{ getBlocks, getMeta, refresh: () => setNonce((n) => n + 1) }}>
      {children}
    </PageContentContext.Provider>
  )
}

export function usePageBlocks(page: string) {
  const ctx = useContext(PageContentContext)
  if (!ctx) throw new Error("usePageBlocks must be used within PageContentProvider")
  return ctx.getBlocks(page)
}

export function usePageMeta(page: string) {
  const ctx = useContext(PageContentContext)
  if (!ctx) throw new Error("usePageMeta must be used within PageContentProvider")
  return ctx.getMeta(page) ?? defaultMetaByPage[page]
}

export function usePageContentRefresh() {
  const ctx = useContext(PageContentContext)
  if (!ctx) throw new Error("usePageContentRefresh must be used within PageContentProvider")
  return ctx.refresh
}
