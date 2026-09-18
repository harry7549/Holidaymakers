import { supabaseAdmin } from "./supabaseAdmin.js"

/**
 * Finds an existing CRM client by normalized phone or email, or creates one.
 * Used by every public inbound route (bookings/quotes/contact) so the CRM
 * is always the master record of every lead, regardless of which form they
 * came through. Never throws — a linking failure must not block the actual
 * booking/quote/message submission.
 */
export async function linkClient(input: {
  full_name?: string
  phone?: string
  email?: string
  source: string
  city?: string
  country?: string
}): Promise<string | null> {
  try {
    const digits = (input.phone || "").replace(/\D/g, "").slice(-10)
    const normEmail = (input.email || "").trim().toLowerCase()

    if (digits) {
      const { data } = await supabaseAdmin.from("clients").select("id").eq("phone_norm", digits).limit(1).maybeSingle()
      if (data) return data.id
    }
    if (normEmail) {
      const { data } = await supabaseAdmin.from("clients").select("id").ilike("email", normEmail).limit(1).maybeSingle()
      if (data) return data.id
    }

    const { data: created, error } = await supabaseAdmin
      .from("clients")
      .insert({
        full_name: input.full_name?.trim() || "Unknown",
        phone: input.phone || "",
        email: input.email || "",
        city: input.city || "",
        country: input.country || "",
        source: input.source,
        status: "new",
      })
      .select("id")
      .single()

    if (error) throw error
    return created.id
  } catch (err) {
    console.error("linkClient failed", err)
    return null
  }
}
