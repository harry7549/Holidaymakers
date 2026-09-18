import type { VercelRequest, VercelResponse } from "@vercel/node"
import { supabaseAdmin } from "./supabaseAdmin.js"

/**
 * Verifies the caller sent a valid Supabase Auth session token AND that the
 * user is listed in admin_users. A valid session alone is NOT enough — since
 * customers can now self-register (see AuthContext.tsx), admin and customer
 * accounts share the same auth.users table, so every self-registered
 * customer would otherwise pass this check and get full service-role access
 * to every /api/admin/* route.
 *
 * Returns the authenticated admin user, or writes a 401/500 response and
 * returns null (caller should return immediately when this happens).
 */
export async function requireAdmin(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined

  if (!token) {
    res.status(401).json({ error: "Missing authorization token" })
    return null
  }

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !data.user) {
      res.status(401).json({ error: "Invalid or expired session" })
      return null
    }

    const { data: allowed } = await supabaseAdmin.from("admin_users").select("user_id").eq("user_id", data.user.id).maybeSingle()
    if (!allowed) {
      res.status(403).json({ error: "This account doesn't have admin access" })
      return null
    }

    return data.user
  } catch (err) {
    console.error(err)
    const message = err instanceof Error ? err.message : "Failed to verify session"
    res.status(500).json({ error: message })
    return null
  }
}
