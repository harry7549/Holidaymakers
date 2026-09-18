import type { VercelRequest } from "@vercel/node"

/**
 * Vercel's edge network sets these headers on every request, no external
 * lookup needed. City/region are URL-encoded and only present in
 * production (not on preview/local), so every field is best-effort.
 */
export function getRequestGeo(req: VercelRequest) {
  const h = req.headers
  const forwardedFor = ((h["x-forwarded-for"] as string) || "").split(",")[0]?.trim()
  const ip = (h["x-real-ip"] as string) || forwardedFor || ""

  const decode = (v: unknown) => {
    if (typeof v !== "string" || !v) return ""
    try {
      return decodeURIComponent(v)
    } catch {
      return v
    }
  }

  return {
    ip,
    city: decode(h["x-vercel-ip-city"]),
    region: decode(h["x-vercel-ip-country-region"]),
    country: decode(h["x-vercel-ip-country"]),
  }
}
