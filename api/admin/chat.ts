import type { VercelRequest, VercelResponse } from "@vercel/node"
import { supabaseAdmin } from "../_lib/supabaseAdmin.js"
import { requireAdmin } from "../_lib/requireAdmin.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const admin = await requireAdmin(req, res)
  if (!admin) return

  if (req.method === "GET") {
    const sessionId = req.query.sessionId ? String(req.query.sessionId) : null

    if (sessionId) {
      const { data, error } = await supabaseAdmin.from("chat_messages").select("*").eq("session_id", sessionId).order("created_at", { ascending: true })
      if (error) {
        res.status(500).json({ error: "Could not load messages" })
        return
      }
      await supabaseAdmin.from("chat_sessions").update({ seen_by_admin: true }).eq("id", sessionId)
      res.status(200).json(data)
      return
    }

    const { data, error } = await supabaseAdmin.from("chat_sessions").select("*").order("last_message_at", { ascending: false }).limit(100)
    if (error) {
      res.status(500).json({ error: "Could not load chat sessions" })
      return
    }
    res.status(200).json(data)
    return
  }

  if (req.method === "POST") {
    const { sessionId, message } = req.body ?? {}
    if (!sessionId || !message?.trim()) {
      res.status(400).json({ error: "Missing sessionId or message" })
      return
    }

    const { data: msg, error } = await supabaseAdmin
      .from("chat_messages")
      .insert({ session_id: sessionId, sender: "admin", body: message.trim() })
      .select()
      .single()

    if (error) {
      console.error(error)
      res.status(500).json({ error: "Could not send reply" })
      return
    }

    await supabaseAdmin.from("chat_sessions").update({ last_message_at: new Date().toISOString() }).eq("id", sessionId)
    await supabaseAdmin.channel(`chat:${sessionId}`).send({ type: "broadcast", event: "message", payload: msg })

    res.status(201).json(msg)
    return
  }

  if (req.method === "PATCH") {
    const { sessionId, status, seenByAdmin } = req.body ?? {}
    if (!sessionId || (!status && seenByAdmin === undefined)) {
      res.status(400).json({ error: "Missing sessionId, or status/seenByAdmin" })
      return
    }
    const patch: Record<string, unknown> = {}
    if (status) patch.status = status
    if (seenByAdmin !== undefined) patch.seen_by_admin = seenByAdmin
    const { error } = await supabaseAdmin.from("chat_sessions").update(patch).eq("id", sessionId)
    if (error) {
      res.status(500).json({ error: "Could not update session" })
      return
    }
    res.status(200).json({ ok: true })
    return
  }

  res.status(405).json({ error: "Method not allowed" })
}
