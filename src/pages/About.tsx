import { usePageBlocks } from "../context/PageContentContext"
import { BlockRenderer } from "../components/blocks/BlockRenderer"
import { Seo } from "../components/Seo"

export default function About() {
  const blocks = usePageBlocks("about")

  return (
    <div>
      <Seo page="about" />
      <BlockRenderer blocks={blocks} />
    </div>
  )
}
