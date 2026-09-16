import { useParams } from "react-router-dom"
import { usePageBlocks, usePageMeta } from "../context/PageContentContext"
import { BlockRenderer } from "../components/blocks/BlockRenderer"
import { Seo } from "../components/Seo"
import NotFound from "./NotFound"

/**
 * Renders any page created in the admin Pages CMS that isn't one of the
 * built-in routes (home/about/contact) — the slug maps straight to a
 * page_meta.id / page_blocks.page value.
 */
export default function DynamicPage() {
  const { slug = "" } = useParams()
  const meta = usePageMeta(slug)
  const blocks = usePageBlocks(slug)

  if (!meta && blocks.length === 0) return <NotFound />

  return (
    <div>
      <Seo page={slug} />
      <BlockRenderer blocks={blocks} />
    </div>
  )
}
