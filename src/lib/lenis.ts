import type Lenis from "lenis"

// A single shared Lenis instance so other components (route-change scroll
// reset, "back to top" buttons, anchor links) can drive it directly instead
// of calling the native window.scrollTo, which Lenis would otherwise fight
// on the next frame.
let instance: Lenis | null = null

export function setLenis(lenis: Lenis | null) {
  instance = lenis
}

export function getLenis() {
  return instance
}
