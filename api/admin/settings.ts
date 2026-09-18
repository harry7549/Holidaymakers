import type { VercelRequest, VercelResponse } from "@vercel/node"
import { supabaseAdmin } from "../_lib/supabaseAdmin.js"
import { requireAdmin } from "../_lib/requireAdmin.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const admin = await requireAdmin(req, res)
  if (!admin) return

  if (req.method === "GET") {
    const { data, error } = await supabaseAdmin.from("site_settings").select("key, value")
    if (error) {
      res.status(500).json({ error: "Could not load settings" })
      return
    }
    res.status(200).json(data)
    return
  }

  if (req.method === "PUT") {
    const { key, value } = req.body ?? {}
    if (!key || typeof value !== "object") {
      res.status(400).json({ error: "Missing key or value" })
      return
    }
    const { error } = await supabaseAdmin.from("site_settings").upsert({ key, value, updated_at: new Date().toISOString() })
    if (error) {
      console.error(error)
      res.status(500).json({ error: "Could not save setting" })
      return
    }
    res.status(200).json({ ok: true })
    return
  }

  res.status(405).json({ error: "Method not allowed" })
}
