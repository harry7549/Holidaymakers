import type { VercelRequest, VercelResponse } from "@vercel/node"
import { supabaseAdmin } from "./_lib/supabaseAdmin"

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

  const { data, error } = await supabaseAdmin
    .from("contact_messages")
    .insert({ name, email, subject: subject ?? "", message, status: "new" })
    .select()
    .single()

  if (error) {
    console.error(error)
    res.status(500).json({ error: "Could not send message" })
    return
  }

  res.status(201).json(data)
}
