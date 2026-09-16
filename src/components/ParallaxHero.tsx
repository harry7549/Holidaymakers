import { type ReactNode } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { SmartImage } from "./SmartImage"

const EASE = [0.16, 1, 0.3, 1] as const

interface ParallaxHeroProps {
  image: string
  imageAlt: string
  eyebrow: string
  heading: ReactNode
  subtext: string
  buttonLabel?: string
  buttonHref?: string
  buttonLabel2?: string
  buttonHref2?: string
}

/**
 * A full-bleed poster hero: bold, bottom-anchored, asymmetric — not a
 * generic centered-text-on-photo template. No scroll-linked positioning
 * (only a slow, time-based ambient zoom on the photo), so there's nothing
 * for two independently-moving layers to collide over on any viewport.
 */
export function ParallaxHero({
  image,
  imageAlt,
  eyebrow,
  heading,
  subtext,
  buttonLabel,
  buttonHref,
  buttonLabel2,
  buttonHref2,
}: ParallaxHeroProps) {
  return (
    <div className="relative min-h-[100svh] w-full overflow-hidden bg-ocean-950">
      <SmartImage
        src={image}
        alt={imageAlt}
        className="absolute inset-0"
        imgClassName="animate-hero-zoom saturate-[1.1] contrast-[1.04]"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-ocean-950 via-ocean-950/25 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-ocean-950/55 via-transparent to-transparent" />

      <div className="relative z-10 flex min-h-[100svh] flex-col justify-end px-4 pb-12 sm:px-8 sm:pb-16 lg:px-14 lg:pb-20">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="max-w-2xl"
          >
            <h1 className="text-balance font-display text-4xl font-semibold leading-[1.06] text-white sm:text-6xl lg:text-7xl">
              {heading}
            </h1>
            <p className="mt-5 max-w-lg text-balance text-sm text-white/75 sm:text-base lg:text-lg">{subtext}</p>
            {(buttonLabel || buttonLabel2) && (
              <div className="mt-8 flex flex-wrap gap-3">
                {buttonLabel && (
                  <Link
                    to={buttonHref || "#"}
                    className="rounded-full bg-sunset-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-sunset-600"
                  >
                    {buttonLabel}
                  </Link>
                )}
                {buttonLabel2 && (
                  <Link
                    to={buttonHref2 || "#"}
                    className="rounded-full border border-white/30 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition-colors hover:bg-white/15"
                  >
                    {buttonLabel2}
                  </Link>
                )}
              </div>
            )}
          </motion.div>

          {eyebrow && (
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
              className="order-first inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/90 backdrop-blur lg:order-last lg:mb-2"
            >
              {eyebrow}
            </motion.span>
          )}
        </div>
      </div>
    </div>
  )
}
