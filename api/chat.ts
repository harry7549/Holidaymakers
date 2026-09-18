import type { VercelRequest, VercelResponse } from "@vercel/node"
import { supabaseAdmin } from "./_lib/supabaseAdmin.js"
import { getRequestGeo } from "./_lib/geo.js"
import { linkClient } from "./_lib/clients.js"
import { getAuthedUserId } from "./_lib/auth.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    const sessionId = String(req.query.sessionId ?? "")
    if (!sessionId) {
      res.status(400).json({ error: "Missing sessionId" })
      return
    }
    const { data, error } = await supabaseAdmin.from("chat_messages").select("*").eq("session_id", sessionId).order("created_at", { ascending: true })
    if (error) {
      console.error(error)
      res.status(500).json({ error: "Could not load messages" })
      return
    }
    res.status(200).json(data)
    return
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  const body = req.body || {}
  const { sessionId, name, email, message } = body as { sessionId?: string; name?: string; email?: string; message?: string }
  if (!message || !message.trim()) {
    res.status(400).json({ error: "Message is required" })
    return
  }

  const geo = getRequestGeo(req)
  const userId = await getAuthedUserId(req)

  let session = sessionId
  if (!session) {
    const clientId = email ? await linkClient({ full_name: name, email, source: "Website chat", city: geo.city, country: geo.country }) : null
    const { data: created, error: createErr } = await supabaseAdmin
      .from("chat_sessions")
      .insert({
        visitor_name: name || "",
        visitor_email: email || "",
        client_id: clientId,
        user_id: userId,
        ip: geo.ip,
        geo_city: geo.city,
        geo_region: geo.region,
        geo_country: geo.country,
      })
      .select("id")
      .single()
    if (createErr || !created) {
      console.error(createErr)
      res.status(500).json({ error: "Could not start chat" })
      return
    }
    session = created.id
  }

  const { data: msg, error: msgErr } = await supabaseAdmin
    .from("chat_messages")
    .insert({ session_id: session, sender: "visitor", body: message.trim() })
    .select()
    .single()

  if (msgErr) {
    console.error(msgErr)
    res.status(500).json({ error: "Could not send message" })
    return
  }

  await supabaseAdmin.from("chat_sessions").update({ last_message_at: new Date().toISOString(), seen_by_admin: false, status: "open" }).eq("id", session)

  await supabaseAdmin.channel(`chat:${session}`).send({ type: "broadcast", event: "message", payload: msg })

  res.status(201).json({ sessionId: session, message: msg })
}
