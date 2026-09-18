import type { VercelRequest, VercelResponse } from "@vercel/node"
import { supabaseAdmin } from "./_lib/supabaseAdmin.js"

const DEFAULTS: Record<string, unknown> = {
  trip_protection: { enabled: true, feePerTraveler: 999, label: "Trip Protection Plan", description: "Helps cover trip cancellations and unexpected disruptions" },
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  const { data, error } = await supabaseAdmin.from("site_settings").select("key, value")
  if (error) {
    console.error(error)
    res.status(200).json(DEFAULTS)
    return
  }

  const merged = { ...DEFAULTS }
  for (const row of data ?? []) merged[row.key] = row.value
  res.status(200).json(merged)
}
