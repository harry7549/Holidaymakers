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
 * Full-bleed cinematic hero: the photo fills the frame from the first
 * frame (no growing-card mechanic to fight the text for space), drifts
 * slowly on scroll, and carries a slow continuous zoom for ambience. Text
 * reveals once on load with a short stagger, then eases up and fades as
 * the section scrolls past.
 */
export function ParallaxHero({ image, imageAlt, eyebrow, heading, subtext }: ParallaxHeroProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })

  const imageY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const contentY = useTransform(scrollYProgress, [0, 0.6], [0, -70])
  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0])

  return (
    <div ref={ref} className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-ocean-950">
      <motion.div style={{ y: imageY }} className="absolute inset-x-0 -top-[8%] -bottom-[8%]">
        <SmartImage src={image} alt={imageAlt} className="h-full w-full" imgClassName="animate-hero-zoom" />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-b from-ocean-950/75 via-ocean-950/15 to-ocean-950/80" />
      <div className="absolute inset-0 bg-gradient-to-t from-ocean-950/40 via-transparent to-transparent" />

      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center"
      >
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/90 backdrop-blur"
        >
          {eyebrow}
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.1, ease: EASE }}
          className="max-w-3xl text-balance font-display text-4xl font-semibold leading-[1.08] text-white sm:text-6xl lg:text-7xl"
        >
          {heading}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.24, ease: EASE }}
          className="mx-auto mt-5 max-w-xl text-balance text-sm text-white/75 sm:text-lg"
        >
          {subtext}
        </motion.p>
      </motion.div>

      <motion.div style={{ opacity: cueOpacity }} className="absolute inset-x-0 bottom-6 z-10 flex flex-col items-center gap-1 text-white/50">
        <span className="text-[11px] font-medium uppercase tracking-wider">Scroll</span>
        <ChevronDown size={16} className="animate-bounce" />
      </motion.div>
    </div>
  )
}
