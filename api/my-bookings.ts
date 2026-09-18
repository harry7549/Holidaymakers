import type { VercelRequest, VercelResponse } from "@vercel/node"
import { supabaseAdmin } from "./_lib/supabaseAdmin.js"
import { getAuthedUserId } from "./_lib/auth.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  const userId = await getAuthedUserId(req)
  if (!userId) {
    res.status(401).json({ error: "Sign in required" })
    return
  }

  const { data, error } = await supabaseAdmin.from("bookings").select("*").eq("user_id", userId).order("created_at", { ascending: false })

  if (error) {
    console.error(error)
    res.status(500).json({ error: "Could not load bookings" })
    return
  }

  res.status(200).json(data)
}
