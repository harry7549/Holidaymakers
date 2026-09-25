import { useRef, type ReactNode } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { SmartImage } from "./SmartImage"
import { cn } from "../lib/utils"

interface ParallaxBannerProps {
  image: string
  alt: string
  className?: string
  children?: ReactNode
  /** Marks this element as the page's hero, so the navbar knows to stay
   * glass-transparent for exactly as long as it's still behind it. */
  heroBoundary?: boolean
}

/** A banner image that drifts slightly slower than the page scrolls. */
export function ParallaxBanner({ image, alt, className, children, heroBoundary }: ParallaxBannerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"])

  return (
    <div ref={ref} data-hero-boundary={heroBoundary ? "" : undefined} className={cn("relative overflow-hidden", className)}>
      <motion.div style={{ y }} className="absolute inset-x-0 -top-[12%] -bottom-[12%]">
        <SmartImage src={image} alt={alt} className="h-full w-full" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      {children}
    </div>
  )
}
