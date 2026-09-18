import type { VercelRequest, VercelResponse } from "@vercel/node"
import { supabaseAdmin } from "./_lib/supabaseAdmin.js"
import { getRequestGeo } from "./_lib/geo.js"
import { linkClient } from "./_lib/clients.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  const body = req.body || {}
  const { name, email, subject, message } = body

  if (!name || !email || !message) {
    res.status(400).json({ error: "Missing required fields" })
    return
  }

  const geo = getRequestGeo(req)
  const clientId = await linkClient({ full_name: name, email, source: "Website", city: geo.city, country: geo.country })

  const { data, error } = await supabaseAdmin
    .from("contact_messages")
    .insert({
      name,
      email,
      subject: subject ?? "",
      message,
      status: "new",
      client_id: clientId,
      ip: geo.ip,
      geo_city: geo.city,
      geo_region: geo.region,
      geo_country: geo.country,
    })
    .select()
    .single()

  if (error) {
    console.error(error)
    res.status(500).json({ error: "Could not send message" })
    return
  }

  res.status(201).json(data)
}
