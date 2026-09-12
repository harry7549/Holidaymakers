import { usePageBlocks } from "../context/PageContentContext"
import { BlockRenderer } from "../components/blocks/BlockRenderer"
import { Seo } from "../components/Seo"

export default function Home() {
  const blocks = usePageBlocks("home")

  return (
    <div>
      <Seo page="home" />
      <BlockRenderer blocks={blocks} />
    </div>
  )
}
