import { useRef, type ReactNode } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { SmartImage } from "./SmartImage"

const EASE = [0.16, 1, 0.3, 1] as const

interface ParallaxHeroProps {
  image: string
  imageAlt: string
  eyebrow: string
  heading: ReactNode
  subtext: string
}

/**
 * A pinned scroll sequence: the headline holds in place while a photo grows
 * from a small centered card to a full-bleed cover, then the section
 * releases into normal scrolling. Height of the outer wrapper controls how
 * much scroll distance the effect takes.
 */
export function ParallaxHero({ image, imageAlt, eyebrow, heading, subtext }: ParallaxHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] })

  const imageWidth = useTransform(scrollYProgress, [0, 0.62], ["36%", "100%"])
  const imageHeight = useTransform(scrollYProgress, [0, 0.62], ["42%", "100%"])
  const imageRadius = useTransform(scrollYProgress, [0, 0.62], [32, 0])
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.62], [0.3, 0.55])

  const textOpacity = useTransform(scrollYProgress, [0, 0.28, 0.46], [1, 1, 0])
  const textY = useTransform(scrollYProgress, [0, 0.46], [0, -70])

  const cueOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0])

  return (
    <div ref={containerRef} className="relative h-[260vh]">
      <div className="sticky top-16 h-[calc(100vh-4rem)] w-full overflow-hidden bg-ocean-950">
        <div className="absolute inset-0 bg-gradient-to-b from-ocean-950 via-ocean-950 to-ocean-900" />

        <motion.div
          style={{ width: imageWidth, height: imageHeight, borderRadius: imageRadius }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden shadow-2xl"
        >
          <SmartImage src={image} alt={imageAlt} className="h-full w-full" />
          <motion.div style={{ opacity: overlayOpacity }} className="absolute inset-0 bg-gradient-to-t from-ocean-950 via-transparent to-ocean-950/40" />
        </motion.div>

        <motion.div style={{ opacity: textOpacity, y: textY }} className="pointer-events-none absolute inset-x-0 top-20 z-10 flex justify-center px-4 sm:top-24">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="max-w-2xl text-center"
          >
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
              {eyebrow}
            </span>
            <h1 className="text-balance font-display text-4xl font-semibold leading-[1.08] text-white sm:text-5xl lg:text-6xl">
              {heading}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-balance text-base text-white/70 sm:text-lg">{subtext}</p>
          </motion.div>
        </motion.div>

        <motion.div style={{ opacity: cueOpacity }} className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-1 text-white/40">
          <span className="text-[11px] font-medium uppercase tracking-wider">Scroll</span>
          <ChevronDown size={16} className="animate-bounce" />
        </motion.div>
      </div>
    </div>
  )
}
