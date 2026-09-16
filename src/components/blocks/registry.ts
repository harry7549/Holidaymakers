import { ICON_NAMES } from "../../lib/iconMap"
import type { BlockContent } from "../../data/types"

export interface FieldDef {
  key: string
  label: string
  type: "text" | "textarea" | "image" | "number" | "boolean" | "select" | "package-picker" | "destination-picker"
  options?: { value: string; label: string }[]
  placeholder?: string
}

export interface BlockSchema {
  type: string
  label: string
  description: string
  /** Top-level scalar fields, e.g. a heading or subtitle. */
  fields: FieldDef[]
  /** Optional repeatable list of sub-objects, e.g. testimonial cards. */
  listKey?: string
  listLabel?: string
  itemFields?: FieldDef[]
  /** True for blocks that render live catalogue data — content only holds captions. */
  liveData?: boolean
  defaultContent: () => BlockContent
}

const iconOptions = ICON_NAMES.map((n) => ({ value: n, label: n }))
const styleOptions = [
  { value: "sunset", label: "Sunset (gradient card)" },
  { value: "dark", label: "Dark (plain navy)" },
]
const colorOptions = [
  { value: "ocean", label: "Ocean" },
  { value: "sunset", label: "Sunset" },
  { value: "gold", label: "Gold" },
]
const categoryOptions = [
  "Beach",
  "Adventure",
  "Honeymoon",
  "Family",
  "Hill Station",
  "Wildlife",
  "Pilgrimage",
  "Luxury",
  "Cruise",
  "International",
].map((c) => ({ value: c, label: c }))
const showcaseModeOptions = [
  { value: "manual", label: "Specific packages I pick" },
  { value: "category", label: "Every package in a category" },
  { value: "destination", label: "Every package at one destination" },
]

export const REGISTRY: Record<string, BlockSchema> = {
  hero: {
    type: "hero",
    label: "Hero (parallax)",
    description: "Full-height scroll-driven hero, used once at the top of the homepage.",
    fields: [
      { key: "eyebrow", label: "Eyebrow badge text", type: "text" },
      { key: "heading", label: "Heading", type: "text" },
      { key: "highlight", label: "Word inside heading to highlight in gold (optional)", type: "text" },
      { key: "subtext", label: "Subtext", type: "textarea" },
      { key: "image", label: "Background image URL", type: "image" },
    ],
    defaultContent: () => ({
      eyebrow: "200+ verified suppliers · Book with confidence",
      heading: "Your next holiday, exactly the way you imagine it",
      highlight: "exactly",
      subtext:
        "Compare ready-made packages or build a fully custom itinerary — from beach escapes to mountain adventures, all in one flexible, transparent platform.",
      image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=2000&q=80",
    }),
  },

  "page-banner": {
    type: "page-banner",
    label: "Page banner",
    description: "Static dark intro banner used at the top of secondary pages.",
    fields: [
      { key: "eyebrow", label: "Eyebrow badge text", type: "text" },
      { key: "heading", label: "Heading", type: "text" },
      { key: "subtext", label: "Subtext", type: "textarea" },
      { key: "image", label: "Background image URL (optional — leave blank for flat gradient)", type: "image" },
    ],
    defaultContent: () => ({
      eyebrow: "About Roamly",
      heading: "We believe planning a holiday should feel as good as taking one",
      subtext:
        "Roamly started with a simple frustration: booking a great holiday meant either settling for rigid packages or spending weeks coordinating with disconnected agents.",
      image: "",
    }),
  },

  "section-heading": {
    type: "section-heading",
    label: "Section heading",
    description: "A standalone heading + subtitle, e.g. a page's opening blurb.",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      {
        key: "align",
        label: "Alignment",
        type: "select",
        options: [
          { value: "center", label: "Center" },
          { value: "left", label: "Left" },
        ],
      },
    ],
    defaultContent: () => ({ heading: "Get in Touch", subtitle: "", align: "center" }),
  },

  stats: {
    type: "stats",
    label: "Stats row",
    description: "A row of big numbers, e.g. traveller/supplier counts.",
    fields: [],
    listKey: "items",
    listLabel: "Stats",
    itemFields: [
      { key: "value", label: "Value", type: "text" },
      { key: "label", label: "Label", type: "text" },
    ],
    defaultContent: () => ({
      items: [
        { value: "42,000+", label: "Happy Travellers" },
        { value: "200+", label: "Verified Suppliers" },
        { value: "60+", label: "Destinations" },
        { value: "4.8 / 5", label: "Avg. Rating" },
      ],
    }),
  },

  steps: {
    type: "steps",
    label: "Numbered steps",
    description: "A 'how it works' style grid of numbered steps.",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
    ],
    listKey: "items",
    listLabel: "Steps",
    itemFields: [
      { key: "icon", label: "Icon", type: "select", options: iconOptions },
      { key: "title", label: "Title", type: "text" },
      { key: "body", label: "Body", type: "textarea" },
    ],
    defaultContent: () => ({
      heading: "How Roamly Works",
      subtitle: "Four simple steps from inspiration to landing at your destination",
      items: [
        { icon: "Compass", title: "Explore & Compare", body: "Browse curated packages or build your own from 200+ verified suppliers, filtered exactly your way." },
        { icon: "Sparkles", title: "Customize Freely", body: "Tweak hotels, add activities, change duration — every trip flexes to fit your style and budget." },
        { icon: "Wallet", title: "Book Securely", body: "Transparent pricing, flexible payment options, and instant confirmation — no hidden surprises." },
        { icon: "MapPinned", title: "Travel & Enjoy", body: "24/7 support during your trip, with your full itinerary, tickets and contacts in one place." },
      ],
    }),
  },

  "feature-grid": {
    type: "feature-grid",
    label: "Feature grid",
    description: "An icon + title + body grid — used for 'why us' or 'our values'.",
    fields: [{ key: "heading", label: "Heading", type: "text" }],
    listKey: "items",
    listLabel: "Features",
    itemFields: [
      { key: "icon", label: "Icon", type: "select", options: iconOptions },
      { key: "title", label: "Title", type: "text" },
      { key: "body", label: "Body", type: "textarea" },
    ],
    defaultContent: () => ({
      heading: "Why Travellers Choose Roamly",
      items: [
        { icon: "ShieldCheck", title: "Verified Suppliers Only", body: "Every partner — online or offline — is vetted for quality, licensing and real traveller reviews." },
        { icon: "Percent", title: "Best Price Guarantee", body: "Find it cheaper elsewhere within 24 hours of booking and we'll match it, plus 5% off." },
        { icon: "Headset", title: "24/7 Trip Support", body: "A real human is one tap away on WhatsApp or call, throughout your journey — not just before booking." },
        { icon: "Clock4", title: "Free Flexible Dates", body: "Reschedule most bookings up to 15 days before departure at no extra cost." },
      ],
    }),
  },

  testimonials: {
    type: "testimonials",
    label: "Testimonials",
    description: "Traveller review cards.",
    fields: [{ key: "heading", label: "Heading", type: "text" }],
    listKey: "items",
    listLabel: "Testimonials",
    itemFields: [
      { key: "name", label: "Name", type: "text" },
      { key: "location", label: "Location", type: "text" },
      { key: "avatarColor", label: "Accent color", type: "select", options: colorOptions },
      { key: "rating", label: "Rating (1-5)", type: "number" },
      { key: "quote", label: "Quote", type: "textarea" },
      { key: "tripName", label: "Trip name", type: "text" },
      { key: "image", label: "Photo URL", type: "image" },
    ],
    defaultContent: () => ({
      heading: "Loved by Thousands of Travellers",
      items: [
        {
          name: "Ananya & Rohit",
          location: "Bengaluru",
          avatarColor: "ocean",
          rating: 5,
          quote:
            "From the first call with our trip expert to the moment we landed back home, everything about our Bali honeymoon felt effortless.",
          tripName: "Bali Honeymoon Bliss",
          image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "The Kapoor Family",
          location: "Delhi",
          avatarColor: "sunset",
          rating: 5,
          quote: "We've booked three family trips through Roamly now. The custom trip builder let us mix a houseboat night with a wildlife safari.",
          tripName: "Kashmir Paradise Trail",
          image: "https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "Rohan D.",
          location: "Pune",
          avatarColor: "gold",
          rating: 5,
          quote: "The Ladakh trip was flawlessly organised for such a remote, high-altitude route.",
          tripName: "Manali to Ladakh Adventure",
          image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "Ishaan & Kavya",
          location: "Hyderabad",
          avatarColor: "ocean",
          rating: 5,
          quote: "Booking our Maldives villa felt like using a premium concierge, not just a website.",
          tripName: "Maldives Overwater Dream",
          image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=800&q=80",
        },
      ],
    }),
  },

  "cta-banner": {
    type: "cta-banner",
    label: "Call-to-action banner",
    description: "A heading + body + one or two buttons.",
    fields: [
      { key: "eyebrow", label: "Eyebrow badge (optional)", type: "text" },
      { key: "heading", label: "Heading", type: "text" },
      { key: "body", label: "Body", type: "textarea" },
      { key: "buttonLabel", label: "Button 1 label", type: "text" },
      { key: "buttonHref", label: "Button 1 link", type: "text" },
      { key: "buttonLabel2", label: "Button 2 label (optional)", type: "text" },
      { key: "buttonHref2", label: "Button 2 link (optional)", type: "text" },
      { key: "style", label: "Style", type: "select", options: styleOptions },
    ],
    defaultContent: () => ({
      eyebrow: "New — Trip Builder",
      heading: "Can't find the perfect package? Build your own.",
      body: "Pick destinations, set your pace, add the activities you love, and get a live price estimate — then let our experts turn it into a real itinerary.",
      buttonLabel: "Start Building →",
      buttonHref: "/build-trip",
      buttonLabel2: "",
      buttonHref2: "",
      style: "sunset",
    }),
  },

  milestones: {
    type: "milestones",
    label: "Milestones timeline",
    description: "A vertical year-by-year journey/timeline.",
    fields: [{ key: "heading", label: "Heading", type: "text" }],
    listKey: "items",
    listLabel: "Milestones",
    itemFields: [
      { key: "year", label: "Year", type: "text" },
      { key: "text", label: "Text", type: "textarea" },
    ],
    defaultContent: () => ({
      heading: "Our Journey",
      items: [
        { year: "2021", text: "Roamly founded with 12 local travel agency partners" },
        { year: "2022", text: "Crossed 5,000 happy travellers and 50 destinations" },
        { year: "2024", text: "Launched the custom Trip Builder — over 8,000 quotes generated" },
        { year: "2026", text: "200+ verified suppliers, 42,000+ travellers served" },
      ],
    }),
  },

  "faq-list": {
    type: "faq-list",
    label: "FAQ list",
    description: "An expandable list of questions and answers.",
    fields: [{ key: "heading", label: "Heading", type: "text" }],
    listKey: "items",
    listLabel: "Questions",
    itemFields: [
      { key: "q", label: "Question", type: "text" },
      { key: "a", label: "Answer", type: "textarea" },
    ],
    defaultContent: () => ({
      heading: "Frequently Asked Questions",
      items: [
        { q: "How do I modify or cancel a booking?", a: "Go to My Trips in your dashboard and select the booking — you can request changes or cancellation there, or reach us on WhatsApp for faster help." },
        { q: "Do you offer EMI or installment payments?", a: "Yes, select 'Pay 20% Now, Rest Later' at checkout for eligible packages, or ask your trip expert about EMI options." },
        { q: "Is my payment information secure?", a: "Yes. All payments are processed through PCI-compliant, encrypted payment gateways. We never store your card details." },
        { q: "Can I talk to a real person before booking?", a: "Absolutely — use the contact form here, call us, or message us on WhatsApp any time." },
      ],
    }),
  },

  "contact-info": {
    type: "contact-info",
    label: "Contact info cards",
    description: "A list of ways to reach you — phone, email, WhatsApp, address.",
    fields: [],
    listKey: "items",
    listLabel: "Contact methods",
    itemFields: [
      { key: "icon", label: "Icon", type: "select", options: iconOptions },
      { key: "label", label: "Label", type: "text" },
      { key: "value", label: "Value", type: "text" },
      { key: "href", label: "Link (optional — tel:, mailto:, https://...)", type: "text" },
    ],
    defaultContent: () => ({
      items: [
        { icon: "Phone", label: "Call Us", value: "+91 98765 43210", href: "tel:+919876543210" },
        { icon: "Mail", label: "Email Us", value: "hello@roamly.travel", href: "mailto:hello@roamly.travel" },
        { icon: "MessageCircle", label: "WhatsApp", value: "Chat with us instantly", href: "https://wa.me/919876543210" },
        { icon: "MapPin", label: "Head Office", value: "Bandra Kurla Complex, Mumbai, India", href: "" },
      ],
    }),
  },

  "rich-text": {
    type: "rich-text",
    label: "Rich text",
    description: "A free-form heading + paragraph block.",
    fields: [
      { key: "heading", label: "Heading (optional)", type: "text" },
      { key: "body", label: "Body", type: "textarea" },
    ],
    defaultContent: () => ({ heading: "", body: "" }),
  },

  "image-text-split": {
    type: "image-text-split",
    label: "Image + text split",
    description: "An image next to a heading, body and optional highlight note.",
    fields: [
      { key: "eyebrow", label: "Eyebrow (optional)", type: "text" },
      { key: "heading", label: "Heading", type: "text" },
      { key: "body", label: "Body", type: "textarea" },
      { key: "note", label: "Highlight note (optional)", type: "textarea" },
      { key: "image", label: "Image URL", type: "image" },
      { key: "reverse", label: "Image on the right", type: "boolean" },
    ],
    defaultContent: () => ({
      eyebrow: "",
      heading: "Our Mission",
      body:
        "To make every kind of holiday — beach, mountain, heritage, adventure, or once-in-a-lifetime honeymoon — accessible, transparent, and genuinely tailored, by connecting travellers directly with a curated network of trusted suppliers.",
      note: "42,000+ travellers have booked through Roamly's network of 200+ verified suppliers.",
      image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=900&q=80",
      reverse: false,
    }),
  },

  "contact-form": {
    type: "contact-form",
    label: "Contact form",
    description: "The live contact form — position it, but its fields aren't editable here.",
    fields: [],
    defaultContent: () => ({}),
  },

  "search-widget": {
    type: "search-widget",
    label: "Search + popular tags",
    description: "The homepage search box plus quick destination links.",
    fields: [],
    listKey: "popularTags",
    listLabel: "Popular destination tags",
    itemFields: [{ key: "label", label: "Label", type: "text" }],
    defaultContent: () => ({
      popularTags: [
        { label: "Bali" },
        { label: "Maldives" },
        { label: "Kerala" },
        { label: "Kashmir" },
        { label: "Dubai" },
        { label: "Swiss Alps" },
      ],
    }),
  },

  "trending-destinations": {
    type: "trending-destinations",
    label: "Trending destinations (live)",
    description: "Pulls top-rated destinations from your catalogue automatically.",
    liveData: true,
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
    ],
    defaultContent: () => ({ heading: "Trending Destinations", subtitle: "Handpicked spots travellers are loving right now" }),
  },

  "featured-packages": {
    type: "featured-packages",
    label: "Featured packages (live)",
    description: "Pulls featured packages from your catalogue automatically, with category filter chips.",
    liveData: true,
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
    ],
    listKey: "categories",
    listLabel: "Filter chips",
    itemFields: [{ key: "label", label: "Label", type: "text" }],
    defaultContent: () => ({
      heading: "Featured Packages",
      subtitle: "Curated favourites across styles and budgets",
      categories: ["All", "Beach", "Honeymoon", "Family", "Adventure", "Luxury", "Hill Station"].map((label) => ({ label })),
    }),
  },

  "package-showcase": {
    type: "package-showcase",
    label: "Package showcase (live)",
    description: "Show hand-picked packages, or every package in one category or destination — anywhere on any page.",
    liveData: true,
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subtitle", label: "Subtitle (optional)", type: "text" },
      { key: "mode", label: "Show", type: "select", options: showcaseModeOptions },
      { key: "categoryValue", label: "Category (used when \"Show\" = category)", type: "select", options: categoryOptions },
      { key: "destinationValue", label: "Destination (used when \"Show\" = destination)", type: "destination-picker" },
      { key: "packageIds", label: "Packages (used when \"Show\" = specific packages)", type: "package-picker" },
      { key: "limit", label: "Max packages to show", type: "number" },
    ],
    defaultContent: () => ({
      heading: "Handpicked For You",
      subtitle: "",
      mode: "manual",
      categoryValue: "Beach",
      destinationValue: "",
      packageIds: [],
      limit: 8,
    }),
  },

  "deals-strip": {
    type: "deals-strip",
    label: "Deals strip (live)",
    description: "Pulls active deals from your catalogue automatically.",
    liveData: true,
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
    ],
    defaultContent: () => ({ heading: "Limited-Time Deals", subtitle: "Grab these before the clock runs out" }),
  },

  "supplier-network": {
    type: "supplier-network",
    label: "Supplier network (live)",
    description: "Pulls a handful of suppliers from your catalogue automatically.",
    liveData: true,
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "heading", label: "Heading", type: "text" },
      { key: "body", label: "Body", type: "textarea" },
    ],
    listKey: "images",
    listLabel: "Gallery images",
    itemFields: [{ key: "image", label: "Image URL", type: "image" }],
    defaultContent: () => ({
      eyebrow: "Our Network",
      heading: "Powered by 200+ verified online & offline suppliers",
      body:
        "From boutique local travel agencies who know every hidden trail, to established online operators covering the globe — every supplier on Roamly is vetted, rated, and held to the same quality bar.",
      images: [
        { image: "https://images.unsplash.com/photo-1600298881974-6be191ceeda1?auto=format&fit=crop&w=600&q=80" },
        { image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80" },
        { image: "https://images.unsplash.com/photo-1521401830884-6c03c1c87ebb?auto=format&fit=crop&w=600&q=80" },
        { image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80" },
      ],
    }),
  },
}

export const BLOCK_TYPES = Object.keys(REGISTRY)

export function getBlockSchema(type: string): BlockSchema | undefined {
  return REGISTRY[type]
}
