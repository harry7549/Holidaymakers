import { usePageBlocks } from "../context/PageContentContext"
import { BlockRenderer } from "../components/blocks/BlockRenderer"
import { Seo } from "../components/Seo"

export default function Contact() {
  const blocks = usePageBlocks("contact")

  return (
    <div>
      <Seo page="contact" />
      <BlockRenderer blocks={blocks} />
    </div>
  )
}
