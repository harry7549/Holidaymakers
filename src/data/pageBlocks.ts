import { REGISTRY } from "../components/blocks/registry"
import type { PageBlock, PageMeta } from "./types"

function block(page: string, type: string, position: number, overrides?: Record<string, unknown>): PageBlock {
  const schema = REGISTRY[type]
  return {
    id: `${page}-${type}-${position}`,
    page,
    type,
    position,
    visible: true,
    content: { ...schema.defaultContent(), ...overrides },
  }
}

export const defaultBlocksByPage: Record<string, PageBlock[]> = {
  home: [
    block("home", "hero", 0),
    block("home", "search-widget", 1),
    block("home", "stats", 2),
    block("home", "trending-destinations", 3),
    block("home", "featured-packages", 4),
    block("home", "cta-banner", 5, {
      eyebrow: "New — Trip Builder",
      heading: "Can't find the perfect package? Build your own.",
      body: "Pick destinations, set your pace, add the activities you love, and get a live price estimate — then let our experts turn it into a real itinerary.",
      buttonLabel: "Start Building →",
      buttonHref: "/build-trip",
      style: "sunset",
    }),
    block("home", "deals-strip", 6),
    block("home", "steps", 7),
    block("home", "feature-grid", 8),
    block("home", "supplier-network", 9),
    block("home", "testimonials", 10),
    block("home", "cta-banner", 11, {
      eyebrow: "",
      heading: "Ready to plan your next escape?",
      body: "Talk to a trip expert or start exploring — either way, your perfect holiday is a few clicks away.",
      buttonLabel: "Browse Packages",
      buttonHref: "/explore",
      buttonLabel2: "Talk to an Expert",
      buttonHref2: "/contact",
      style: "dark",
    }),
  ],
  about: [
    block("about", "page-banner", 0),
    block("about", "image-text-split", 1),
    block("about", "feature-grid", 2, {
      heading: "What We Stand For",
      items: [
        { icon: "ShieldCheck", title: "Trust First", body: "Every supplier is verified. Every price is transparent. No surprise fees, ever." },
        { icon: "Sparkles", title: "Flexibility Always", body: "From one-click packages to fully custom itineraries — travel your way." },
        { icon: "Heart", title: "Genuine Care", body: "Real people supporting your trip before, during, and after you travel." },
        { icon: "Globe2", title: "Local + Global", body: "We champion small local experts alongside established global operators." },
      ],
    }),
    block("about", "milestones", 3),
    block("about", "cta-banner", 4, {
      eyebrow: "",
      heading: "Want to plan your next trip with us?",
      body: "",
      buttonLabel: "Browse Packages",
      buttonHref: "/explore",
      buttonLabel2: "Become a Supplier",
      buttonHref2: "/suppliers",
      style: "dark",
    }),
  ],
  contact: [
    block("contact", "section-heading", 0, {
      heading: "Get in Touch",
      subtitle: "Questions about a booking, a custom trip, or becoming a supplier? We're here to help.",
      align: "center",
    }),
    block("contact", "contact-info", 1),
    block("contact", "contact-form", 2),
    block("contact", "faq-list", 3),
  ],
}

export const defaultMetaByPage: Record<string, PageMeta> = {
  home: {
    page: "home",
    title: "Roamly Holidays — Flexible Holiday Packages, Your Way",
    description: "Compare ready-made holiday packages or build a fully custom itinerary with 200+ verified online and offline suppliers.",
    ogImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
  },
  about: {
    page: "about",
    title: "About Roamly — Our Story & Mission",
    description: "Roamly connects travellers with a curated network of trusted local and global suppliers for genuinely tailored holidays.",
    ogImage: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
  },
  contact: {
    page: "contact",
    title: "Contact Roamly Holidays",
    description: "Get in touch about a booking, a custom trip, or becoming a Roamly supplier.",
    ogImage: "",
  },
}
