import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { BadgeCheck, ChevronDown, Users } from "lucide-react"
import type { BlockContent, Category } from "../../data/types"
import { useCatalog } from "../../context/CatalogContext"
import { getIcon } from "../../lib/iconMap"
import { cn, formatPrice } from "../../lib/utils"
import { SmartImage } from "../SmartImage"
import { RatingStars } from "../RatingStars"
import { PackageCard } from "../PackageCard"
import { SearchWidget } from "../SearchWidget"
import { CountdownTimer } from "../CountdownTimer"
import { ParallaxHero } from "../ParallaxHero"
import { ParallaxBanner } from "../ParallaxBanner"
import { Reveal, StaggerGroup, StaggerItem } from "../Reveal"
import { ContactForm } from "../ContactForm"

type BlockProps = { content: BlockContent }

function renderHeading(heading: string, highlight?: string) {
  if (!heading || !highlight) return heading
  const idx = heading.indexOf(highlight)
  if (idx === -1) return heading
  return (
    <>
      {heading.slice(0, idx)}
      <span className="text-accent-serif text-gold-400">{highlight}</span>
      {heading.slice(idx + highlight.length)}
    </>
  )
}

export function HeroBlock({ content }: BlockProps) {
  return (
    <ParallaxHero
      image={content.image}
      imageAlt={content.heading}
      eyebrow={content.eyebrow}
      heading={renderHeading(content.heading, content.highlight)}
      subtext={content.subtext}
    />
  )
}

export function PageBannerBlock({ content }: BlockProps) {
  const inner = (
    <Reveal className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
      {content.eyebrow && (
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
          {content.eyebrow}
        </span>
      )}
      <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">{content.heading}</h1>
      {content.subtext && <p className="mx-auto mt-4 max-w-2xl text-sm text-white/70 sm:text-base">{content.subtext}</p>}
    </Reveal>
  )

  if (content.image) {
    return (
      <ParallaxBanner image={content.image} alt={content.heading} className="flex h-72 items-center sm:h-96">
        {inner}
      </ParallaxBanner>
    )
  }

  return (
    <section className="relative overflow-hidden bg-ocean-950 py-20">
      <div className="absolute inset-0 bg-gradient-to-br from-ocean-950 via-ocean-900 to-ocean-800" />
      {inner}
    </section>
  )
}

export function SectionHeadingBlock({ content }: BlockProps) {
  const centered = content.align !== "left"
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
      <Reveal className={cn("mb-6", centered && "text-center")}>
        <h1 className="font-display text-2xl font-bold text-ocean-950 sm:text-3xl">{content.heading}</h1>
        {content.subtitle && <p className={cn("mt-2 text-sm text-ocean-950/60", centered && "mx-auto max-w-lg")}>{content.subtitle}</p>}
      </Reveal>
    </div>
  )
}

export function StatsBlock({ content }: BlockProps) {
  const items = content.items ?? []
  return (
    <Reveal className="mx-auto mt-2 grid max-w-4xl grid-cols-2 gap-4 px-4 py-8 sm:grid-cols-4 sm:px-6 lg:px-8">
      {items.map((s: { label: string; value: string }) => (
        <div key={s.label} className="text-center">
          <div className="font-display text-2xl font-bold text-ocean-950 sm:text-3xl">{s.value}</div>
          <div className="mt-1 text-xs text-ocean-950/50">{s.label}</div>
        </div>
      ))}
    </Reveal>
  )
}

export function StepsBlock({ content }: BlockProps) {
  const items = content.items ?? []
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal className="mb-10 text-center">
        <h2 className="font-display text-2xl font-bold text-ocean-950 sm:text-3xl">{content.heading}</h2>
        {content.subtitle && <p className="mt-2 text-sm text-ocean-950/60">{content.subtitle}</p>}
      </Reveal>
      <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((step: { icon: string; title: string; body: string }, i: number) => {
          const Icon = getIcon(step.icon)
          return (
            <StaggerItem key={step.title} className="relative rounded-2xl border border-sand-200 bg-white p-6">
              <span className="absolute right-5 top-5 font-display text-3xl font-bold text-sand-200">0{i + 1}</span>
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-ocean-50 text-ocean-600">
                <Icon size={20} />
              </span>
              <h3 className="mb-1.5 font-display text-lg font-bold text-ocean-950">{step.title}</h3>
              <p className="text-sm text-ocean-950/60">{step.body}</p>
            </StaggerItem>
          )
        })}
      </StaggerGroup>
    </section>
  )
}

export function FeatureGridBlock({ content }: BlockProps) {
  const items = content.items ?? []
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {content.heading && (
          <Reveal className="mb-10 text-center">
            <h2 className="font-display text-2xl font-bold text-ocean-950 sm:text-3xl">{content.heading}</h2>
          </Reveal>
        )}
        <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item: { icon: string; title: string; body: string }) => {
            const Icon = getIcon(item.icon)
            return (
              <StaggerItem key={item.title} className="text-center">
                <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sunset-50 text-sunset-500">
                  <Icon size={22} />
                </span>
                <h3 className="mb-1.5 font-display text-base font-bold text-ocean-950">{item.title}</h3>
                <p className="text-sm text-ocean-950/60">{item.body}</p>
              </StaggerItem>
            )
          })}
        </StaggerGroup>
      </div>
    </section>
  )
}

export function TestimonialsBlock({ content }: BlockProps) {
  const items = content.items ?? []
  return (
    <section className="bg-sand-100 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-10 text-center">
          <h2 className="font-display text-2xl font-bold text-ocean-950 sm:text-3xl">{content.heading}</h2>
        </Reveal>
        <StaggerGroup className="-mx-4 flex snap-x-mandatory gap-5 overflow-x-auto px-4 pb-4 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 sm:pb-0 lg:grid-cols-4">
          {items.map((t: { name: string; location: string; quote: string; tripName: string; image: string; rating: number }) => (
            <StaggerItem key={t.name} className="w-80 shrink-0 snap-start rounded-2xl bg-white p-5 shadow-card sm:w-auto">
              <RatingStars rating={t.rating} />
              <p className="mt-3 text-sm text-ocean-950/80">&quot;{t.quote}&quot;</p>
              <div className="mt-4 flex items-center gap-3">
                <SmartImage src={t.image} alt={t.name} className="h-10 w-10 rounded-full" />
                <div>
                  <p className="text-sm font-semibold text-ocean-950">{t.name}</p>
                  <p className="text-xs text-ocean-950/50">
                    {t.location} · {t.tripName}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  )
}

export function CtaBannerBlock({ content }: BlockProps) {
  if (content.style === "dark") {
    return (
      <Reveal as="section" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-ocean-950 px-6 py-12 text-center sm:px-12">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">{content.heading}</h2>
          {content.body && <p className="mx-auto mt-2 max-w-lg text-sm text-white/60 sm:text-base">{content.body}</p>}
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            {content.buttonLabel && (
              <Link to={content.buttonHref || "#"} className="rounded-full bg-sunset-500 px-6 py-3 text-sm font-bold text-white hover:bg-sunset-600">
                {content.buttonLabel}
              </Link>
            )}
            {content.buttonLabel2 && (
              <Link to={content.buttonHref2 || "#"} className="rounded-full border border-white/25 px-6 py-3 text-sm font-bold text-white hover:bg-white/10">
                {content.buttonLabel2}
              </Link>
            )}
          </div>
        </div>
      </Reveal>
    )
  }

  return (
    <Reveal as="section" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sunset-500 to-sunset-700 p-8 sm:p-12">
        <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 left-10 h-56 w-56 rounded-full bg-ocean-950/20 blur-2xl" />
        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            {content.eyebrow && (
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                {content.eyebrow}
              </span>
            )}
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">{content.heading}</h2>
            {content.body && <p className="mt-2 text-sm text-white/85 sm:text-base">{content.body}</p>}
          </div>
          {content.buttonLabel && (
            <Link
              to={content.buttonHref || "#"}
              className="shrink-0 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-sunset-600 shadow-lg transition-transform hover:scale-105"
            >
              {content.buttonLabel}
            </Link>
          )}
        </div>
      </div>
    </Reveal>
  )
}

export function MilestonesBlock({ content }: BlockProps) {
  const items = content.items ?? []
  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <Reveal>
        <h2 className="mb-10 text-center font-display text-2xl font-bold text-ocean-950 sm:text-3xl">{content.heading}</h2>
      </Reveal>
      <StaggerGroup className="space-y-6">
        {items.map((m: { year: string; text: string }) => (
          <StaggerItem key={m.year} className="flex gap-5">
            <span className="w-16 shrink-0 font-display text-lg font-bold text-ocean-600">{m.year}</span>
            <p className="border-l-2 border-sand-200 pl-5 text-sm text-ocean-950/70">{m.text}</p>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  )
}

export function FaqListBlock({ content }: BlockProps) {
  const items = content.items ?? []
  const [open, setOpen] = useState<number | null>(0)
  return (
    <Reveal className="mx-auto mt-16 max-w-3xl px-4 pb-16 sm:px-6">
      <h2 className="mb-6 text-center font-display text-xl font-bold text-ocean-950">{content.heading}</h2>
      <div className="space-y-2">
        {items.map((faq: { q: string; a: string }, i: number) => (
          <div key={faq.q} className="rounded-xl border border-sand-200">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-semibold text-ocean-950"
            >
              {faq.q}
              <ChevronDown size={16} className={cn("shrink-0 transition-transform", open === i && "rotate-180")} />
            </button>
            {open === i && <p className="px-4 pb-4 text-sm text-ocean-950/70">{faq.a}</p>}
          </div>
        ))}
      </div>
    </Reveal>
  )
}

export function ContactInfoBlock({ content }: BlockProps) {
  const items = content.items ?? []
  return (
    <StaggerGroup className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
      {items.map((c: { icon: string; label: string; value: string; href?: string }) => {
        const Icon = getIcon(c.icon)
        const inner = (
          <>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ocean-50 text-ocean-600">
              <Icon size={19} />
            </span>
            <div>
              <p className="text-sm font-semibold text-ocean-950">{c.label}</p>
              <p className="text-sm text-ocean-950/60">{c.value}</p>
            </div>
          </>
        )
        return (
          <StaggerItem key={c.label}>
            {c.href ? (
              <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="flex items-center gap-4 rounded-2xl border border-sand-200 bg-white p-5 hover:border-ocean-300">
                {inner}
              </a>
            ) : (
              <div className="flex items-center gap-4 rounded-2xl border border-sand-200 bg-white p-5">{inner}</div>
            )}
          </StaggerItem>
        )
      })}
    </StaggerGroup>
  )
}

export function RichTextBlock({ content }: BlockProps) {
  return (
    <Reveal className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {content.heading && <h2 className="mb-3 font-display text-2xl font-bold text-ocean-950">{content.heading}</h2>}
      <p className="text-sm leading-relaxed text-ocean-950/70 sm:text-base">{content.body}</p>
    </Reveal>
  )
}

export function ImageTextSplitBlock({ content }: BlockProps) {
  const image = (
    <Reveal>
      <SmartImage src={content.image} alt={content.heading} className="aspect-[4/3] rounded-2xl" />
    </Reveal>
  )
  const text = (
    <Reveal delay={0.1}>
      {content.eyebrow && (
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-ocean-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-ocean-700">
          {content.eyebrow}
        </span>
      )}
      <h2 className="font-display text-2xl font-bold text-ocean-950 sm:text-3xl">{content.heading}</h2>
      <p className="mt-3 text-sm text-ocean-950/70 sm:text-base">{content.body}</p>
      {content.note && (
        <div className="mt-6 flex items-center gap-3 rounded-xl bg-ocean-50 p-4">
          <Users size={22} className="text-ocean-600 shrink-0" />
          <p className="text-sm text-ocean-950/80">{content.note}</p>
        </div>
      )}
    </Reveal>
  )

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
        {content.reverse ? (
          <>
            <div className="lg:order-2">{image}</div>
            <div className="lg:order-1">{text}</div>
          </>
        ) : (
          <>
            {image}
            {text}
          </>
        )}
      </div>
    </section>
  )
}

export function ContactFormBlock() {
  return (
    <Reveal className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <ContactForm />
    </Reveal>
  )
}

export function SearchWidgetBlock({ content }: BlockProps) {
  const tags = content.popularTags ?? []
  return (
    <section className="relative -mt-1 bg-ocean-950 pb-16 pt-4 sm:pb-20">
      <Reveal className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SearchWidget />
        {tags.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-medium text-white/50">Popular:</span>
            {tags.map((t: { label: string }) => (
              <Link
                key={t.label}
                to={`/explore?q=${encodeURIComponent(t.label)}`}
                className="rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-white/80 transition-colors hover:border-sunset-400 hover:text-sunset-300"
              >
                {t.label}
              </Link>
            ))}
          </div>
        )}
      </Reveal>
      <svg viewBox="0 0 1440 60" className="relative mt-14 block w-full text-sand-50" preserveAspectRatio="none" style={{ height: 40 }}>
        <path fill="currentColor" d="M0,32 C240,60 480,0 720,16 C960,32 1200,60 1440,24 L1440,60 L0,60 Z" />
      </svg>
    </section>
  )
}

export function TrendingDestinationsBlock({ content }: BlockProps) {
  const { destinations } = useCatalog()
  const trending = useMemo(() => destinations.filter((d) => d.rating >= 4.6).slice(0, 10), [destinations])

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <Reveal className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ocean-950 sm:text-3xl">{content.heading}</h2>
          <p className="mt-1 text-sm text-ocean-950/60">{content.subtitle}</p>
        </div>
        <Link to="/destinations" className="hidden shrink-0 text-sm font-semibold text-ocean-600 hover:text-ocean-700 sm:block">
          View all →
        </Link>
      </Reveal>
      <StaggerGroup className="-mx-4 flex snap-x-mandatory gap-4 overflow-x-auto px-4 pb-4 no-scrollbar sm:mx-0 sm:px-0">
        {trending.map((d) => (
          <StaggerItem key={d.id} className="w-64 shrink-0 snap-start sm:w-72">
            <Link to={`/destinations/${d.id}`} className="group relative block overflow-hidden rounded-2xl shadow-card">
              <SmartImage src={d.image} alt={d.name} className="aspect-[3/4] w-full" imgClassName="transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-white/80">
                  <RatingStars rating={d.rating} size={11} />
                  {d.rating}
                </div>
                <h3 className="font-display text-lg font-bold">{d.name}</h3>
                <p className="text-xs text-white/70">{d.tagline}</p>
                <p className="mt-2 text-xs font-semibold text-gold-300">From {formatPrice(d.fromPrice)}</p>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </StaggerGroup>
      <Link to="/destinations" className="mt-4 block text-center text-sm font-semibold text-ocean-600 sm:hidden">
        View all destinations →
      </Link>
    </section>
  )
}

export function FeaturedPackagesBlock({ content }: BlockProps) {
  const { packages } = useCatalog()
  const categories: string[] = (content.categories ?? []).map((c: { label: string }) => c.label)
  const [activeCategory, setActiveCategory] = useState<string>(categories[0] ?? "All")

  const featured = useMemo(() => {
    const base = packages.filter((p) => p.featured)
    if (activeCategory === "All") return base.slice(0, 8)
    return packages.filter((p) => p.category.includes(activeCategory as Category)).slice(0, 8)
  }, [activeCategory, packages])

  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-ocean-950 sm:text-3xl">{content.heading}</h2>
            <p className="mt-1 text-sm text-ocean-950/60">{content.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors sm:text-sm",
                  activeCategory === c ? "border-ocean-600 bg-ocean-600 text-white" : "border-sand-200 text-ocean-950/70 hover:border-ocean-300",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </Reveal>

        <StaggerGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((pkg) => (
            <StaggerItem key={pkg.id}>
              <PackageCard pkg={pkg} />
            </StaggerItem>
          ))}
        </StaggerGroup>

        <Reveal className="mt-8 text-center">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 rounded-full border-2 border-ocean-600 px-6 py-3 text-sm font-semibold text-ocean-700 transition-colors hover:bg-ocean-600 hover:text-white"
          >
            Explore all {packages.length}+ packages
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

export function DealsStripBlock({ content }: BlockProps) {
  const { packages, deals } = useCatalog()
  return (
    <section className="bg-ocean-950 py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">{content.heading}</h2>
            <p className="mt-1 text-sm text-white/60">{content.subtitle}</p>
          </div>
          <Link to="/deals" className="hidden text-sm font-semibold text-gold-400 hover:text-gold-300 sm:block">
            All deals →
          </Link>
        </Reveal>
        <StaggerGroup className="grid gap-5 sm:grid-cols-3">
          {deals.map((deal) => {
            const pkg = packages.find((p) => p.id === deal.packageId)
            if (!pkg) return null
            return (
              <StaggerItem key={deal.id} className="overflow-hidden rounded-2xl border border-white/10 bg-ocean-900/60">
                <div className="relative">
                  <SmartImage src={deal.image} alt={deal.title} className="aspect-video w-full" />
                  <span className="absolute left-3 top-3 rounded-full bg-sunset-500 px-2.5 py-1 text-xs font-bold text-white">{deal.discountPercent}% OFF</span>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg font-bold text-white">{deal.title}</h3>
                  <p className="mt-0.5 text-xs text-white/60">{deal.subtitle}</p>
                  <CountdownTimer target={deal.expiresAt} className="my-3" />
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-white/50">
                      Code: <span className="font-mono font-bold text-gold-400">{deal.code}</span>
                    </div>
                    <Link to={`/package/${pkg.slug}`} className="text-xs font-semibold text-white underline underline-offset-2">
                      View deal →
                    </Link>
                  </div>
                </div>
              </StaggerItem>
            )
          })}
        </StaggerGroup>
      </div>
    </section>
  )
}

export function SupplierNetworkBlock({ content }: BlockProps) {
  const { suppliers } = useCatalog()
  const images: string[] = (content.images ?? []).map((i: { image: string }) => i.image)

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
        <Reveal>
          {content.eyebrow && (
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-ocean-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-ocean-700">
              {content.eyebrow}
            </span>
          )}
          <h2 className="font-display text-2xl font-bold text-ocean-950 sm:text-3xl">{content.heading}</h2>
          <p className="mt-3 text-sm text-ocean-950/60 sm:text-base">{content.body}</p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {suppliers.slice(0, 6).map((s) => (
              <div key={s.id} className="flex items-center gap-2.5 rounded-xl border border-sand-200 p-3">
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-display text-sm font-bold text-white",
                    s.color === "ocean" && "bg-ocean-600",
                    s.color === "sunset" && "bg-sunset-500",
                    s.color === "gold" && "bg-gold-500",
                  )}
                >
                  {s.logoInitial}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-ocean-950">{s.name}</p>
                  <p className="flex items-center gap-1 text-[11px] text-ocean-950/50">
                    {s.verified && <BadgeCheck size={11} className="text-ocean-500" />}
                    {s.type === "online" ? "Online partner" : "Offline agency"}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Link to="/suppliers" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ocean-700 hover:text-ocean-800">
            Meet our supplier network →
          </Link>
        </Reveal>
        <Reveal delay={0.1} className="relative">
          <div className="grid grid-cols-2 gap-4">
            {images.map((img, i) => (
              <SmartImage key={img + i} src={img} alt="Supplier network" className={cn("aspect-square rounded-2xl", i % 2 === 1 && "mt-8")} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
