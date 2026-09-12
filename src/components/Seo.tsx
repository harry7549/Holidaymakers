import { useEffect } from "react"
import { usePageMeta } from "../context/PageContentContext"

function setMetaTag(attr: "name" | "property", key: string, content: string) {
  if (!content) return
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!tag) {
    tag = document.createElement("meta")
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute("content", content)
}

export function Seo({ page }: { page: string }) {
  const meta = usePageMeta(page)

  useEffect(() => {
    if (!meta) return
    const prevTitle = document.title
    if (meta.title) document.title = meta.title
    setMetaTag("name", "description", meta.description)
    setMetaTag("property", "og:title", meta.title)
    setMetaTag("property", "og:description", meta.description)
    setMetaTag("property", "og:image", meta.ogImage)
    return () => {
      document.title = prevTitle
    }
  }, [meta])

  return null
}
