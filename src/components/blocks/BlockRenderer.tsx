import type { ComponentType } from "react"
import type { BlockContent, PageBlock } from "../../data/types"
import {
  CtaBannerBlock,
  ContactFormBlock,
  ContactInfoBlock,
  DealsStripBlock,
  FaqListBlock,
  FeatureGridBlock,
  FeaturedPackagesBlock,
  HeroBlock,
  ImageTextSplitBlock,
  MilestonesBlock,
  PackageShowcaseBlock,
  PageBannerBlock,
  RichTextBlock,
  SearchWidgetBlock,
  SectionHeadingBlock,
  StatsBlock,
  StepsBlock,
  SupplierNetworkBlock,
  TestimonialsBlock,
  TrendingDestinationsBlock,
} from "./BlockComponents"

const BLOCK_COMPONENTS: Record<string, ComponentType<{ content: BlockContent }>> = {
  hero: HeroBlock,
  "page-banner": PageBannerBlock,
  "section-heading": SectionHeadingBlock,
  stats: StatsBlock,
  steps: StepsBlock,
  "feature-grid": FeatureGridBlock,
  testimonials: TestimonialsBlock,
  "cta-banner": CtaBannerBlock,
  milestones: MilestonesBlock,
  "faq-list": FaqListBlock,
  "contact-info": ContactInfoBlock,
  "rich-text": RichTextBlock,
  "image-text-split": ImageTextSplitBlock,
  "contact-form": ContactFormBlock,
  "search-widget": SearchWidgetBlock,
  "trending-destinations": TrendingDestinationsBlock,
  "featured-packages": FeaturedPackagesBlock,
  "package-showcase": PackageShowcaseBlock,
  "deals-strip": DealsStripBlock,
  "supplier-network": SupplierNetworkBlock,
}

export function BlockRenderer({ blocks }: { blocks: PageBlock[] }) {
  return (
    <>
      {blocks.map((b) => {
        const Comp = BLOCK_COMPONENTS[b.type]
        if (!Comp) return null
        return <Comp key={b.id} content={b.content} />
      })}
    </>
  )
}
