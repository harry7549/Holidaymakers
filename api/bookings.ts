import type { VercelRequest, VercelResponse } from "@vercel/node"
import { supabaseAdmin } from "./_lib/supabaseAdmin.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  const body = req.body || {}
  const { packageId, packageTitle, image, startDate, travelers, addOns, totalPrice, travelerDetails, contactEmail, contactPhone } = body

  if (!packageTitle || !contactEmail || !contactPhone || !travelers) {
    res.status(400).json({ error: "Missing required booking fields" })
    return
  }

  const id = `RM${Date.now().toString().slice(-8)}`

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .insert({
      id,
      package_id: packageId ?? null,
      package_title: packageTitle,
      image: image ?? null,
      start_date: startDate ?? null,
      travelers,
      add_ons: addOns ?? [],
      total_price: totalPrice ?? 0,
      status: "upcoming",
      traveler_details: travelerDetails ?? [],
      contact_email: contactEmail,
      contact_phone: contactPhone,
    })
    .select()
    .single()

  if (error) {
    console.error(error)
    res.status(500).json({ error: "Could not save booking" })
    return
  }

  res.status(201).json(data)
}
