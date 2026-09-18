export type ClientStatus = "new" | "contacted" | "active" | "booked" | "dormant" | "lost"

export interface ClientRow {
  id: string
  full_name: string
  phone: string
  whatsapp: string
  email: string
  country: string
  city: string
  source: string
  tags: string[]
  status: ClientStatus
  notes: string
  next_follow_up: string | null
  last_contact_at: string | null
  created_at: string
}

export const SOURCE_OPTIONS = ["Manual", "Website", "OTA", "Referral", "Walk-in", "Social", "Ads", "Email", "Phone", "Import"]

export const STATUS_OPTIONS: { value: ClientStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "active", label: "Active" },
  { value: "booked", label: "Booked" },
  { value: "dormant", label: "Dormant" },
  { value: "lost", label: "Lost" },
]

export const STATUS_TONE: Record<ClientStatus, "ocean" | "gold" | "sunset" | "neutral" | "emerald"> = {
  new: "gold",
  contacted: "ocean",
  active: "ocean",
  booked: "emerald",
  dormant: "neutral",
  lost: "sunset",
}
