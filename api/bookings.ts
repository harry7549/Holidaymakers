import type { VercelRequest, VercelResponse } from "@vercel/node"
import { supabaseAdmin } from "./_lib/supabaseAdmin.js"
import { getRequestGeo } from "./_lib/geo.js"
import { linkClient } from "./_lib/clients.js"
import { getAuthedUserId } from "./_lib/auth.js"
import { sendBookingConfirmationWhatsApp } from "./_lib/whatsapp.js"

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
  const geo = getRequestGeo(req)
  const userId = await getAuthedUserId(req)

  let supplierCost = 0
  if (packageId) {
    const { data: pkg } = await supabaseAdmin.from("packages").select("cost_price").eq("id", packageId).maybeSingle()
    supplierCost = (pkg?.cost_price ?? 0) * travelers
  }
  const margin = (totalPrice ?? 0) - supplierCost

  const clientId = await linkClient({
    full_name: travelerDetails?.[0]?.name,
    phone: contactPhone,
    email: contactEmail,
    source: "Website",
    city: geo.city,
    country: geo.country,
  })

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
      supplier_cost: supplierCost,
      margin,
      status: "upcoming",
      traveler_details: travelerDetails ?? [],
      contact_email: contactEmail,
      contact_phone: contactPhone,
      client_id: clientId,
      user_id: userId,
      ip: geo.ip,
      geo_city: geo.city,
      geo_region: geo.region,
      geo_country: geo.country,
    })
    .select()
    .single()

  if (error) {
    console.error(error)
    res.status(500).json({ error: "Could not save booking" })
    return
  }

  sendBookingConfirmationWhatsApp({
    phone: contactPhone,
    customerName: travelerDetails?.[0]?.name,
    packageTitle,
    bookingId: id,
  })

  res.status(201).json(data)
}
