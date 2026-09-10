import type { VercelRequest, VercelResponse } from "@vercel/node"
import { supabaseAdmin } from "./_lib/supabaseAdmin"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  const body = req.body || {}
  const { destinations, days, travelers, budget, style, addOns, name, email, phone, notes } = body

  if (!name || !email || !phone) {
    res.status(400).json({ error: "Missing required contact fields" })
    return
  }

  const { data, error } = await supabaseAdmin
    .from("quote_requests")
    .insert({
      destinations: destinations ?? [],
      days: days ?? 0,
      travelers: travelers ?? 1,
      budget: budget ?? 0,
      style: style ?? "balanced",
      add_ons: addOns ?? [],
      name,
      email,
      phone,
      notes: notes ?? "",
      status: "new",
    })
    .select()
    .single()

  if (error) {
    console.error(error)
    res.status(500).json({ error: "Could not save quote request" })
    return
  }

  res.status(201).json(data)
}
