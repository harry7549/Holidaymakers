import type { VercelRequest, VercelResponse } from "@vercel/node"
import { supabaseAdmin } from "./_lib/supabaseAdmin.js"
import { getRequestGeo } from "./_lib/geo.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  const body = req.body || {}
  const { business, contact, email, phone, city, type, message } = body

  if (!business || !contact || !email || !phone) {
    res.status(400).json({ error: "Missing required fields" })
    return
  }

  const geo = getRequestGeo(req)

  const { data, error } = await supabaseAdmin
    .from("supplier_applications")
    .insert({
      business,
      contact,
      email,
      phone,
      city: city ?? "",
      type: type === "online" ? "online" : "offline",
      message: message ?? "",
      status: "new",
      ip: geo.ip,
      geo_city: geo.city,
      geo_region: geo.region,
      geo_country: geo.country,
    })
    .select()
    .single()

  if (error) {
    console.error(error)
    res.status(500).json({ error: "Could not submit application" })
    return
  }

  res.status(201).json(data)
}
