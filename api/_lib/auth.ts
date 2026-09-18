import type { VercelRequest } from "@vercel/node"
import { supabaseAdmin } from "./supabaseAdmin.js"

/**
 * Verifies the caller's Supabase Auth bearer token server-side and returns
 * their user id, or null if there isn't one / it's invalid. Never throws —
 * callers use this to optionally attribute a row to a signed-in customer,
 * it must never block an anonymous submission.
 */
export async function getAuthedUserId(req: VercelRequest): Promise<string | null> {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith("Bearer ")) return null
    const token = header.slice(7)
    const { data, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !data.user) return null
    return data.user.id
  } catch (err) {
    console.error("getAuthedUserId failed", err)
    return null
  }
}
