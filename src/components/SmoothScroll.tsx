import { useEffect } from "react"
import Lenis from "lenis"
import { setLenis } from "../lib/lenis"

/**
 * Adds inertia to scrolling site-wide — the single biggest lever for the
 * "cinematic" feel of high-end sites (Lenis + rAF-driven easing instead of
 * the browser's 1:1 wheel response). Framer Motion's scroll hooks keep
 * working unchanged since Lenis still drives the real window scroll
 * position, just smoothed.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    })
    setLenis(lenis)

    let frame: number
    function raf(time: number) {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      setLenis(null)
      lenis.destroy()
    }
  }, [])

  return null
}
