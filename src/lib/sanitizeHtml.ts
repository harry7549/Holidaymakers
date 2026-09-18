import DOMPurify from "dompurify"

const ALLOWED_TAGS = ["b", "strong", "i", "em", "u", "ul", "ol", "li", "br", "p", "a"]
const ALLOWED_ATTR = ["href", "target", "rel"]

/** Sanitizes admin-authored rich text (itinerary descriptions) before it's ever rendered as HTML on the public site. */
export function sanitizeRichText(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR })
}
