import type { VercelRequest, VercelResponse } from "@vercel/node"
import { createClient } from "@supabase/supabase-js"

/**
 * Verifies the caller sent a valid Supabase Auth session token. Any account
 * that can sign in counts as admin — this app is built for a single business
 * owner, so admin accounts are created manually in the Supabase dashboard
 * (Authentication → Users) rather than through public sign-up. Make sure
 * "Allow new user signups" is OFF in your Supabase Auth settings.
 *
 * Returns the authenticated user, or writes a 401/500 response and returns
 * null (caller should return immediately when this happens).
 */
export async function requireAdmin(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined

  if (!token) {
    res.status(401).json({ error: "Missing authorization token" })
    return null
  }

  const url = process.env.VITE_SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    res.status(500).json({ error: "Supabase is not configured on the server" })
    return null
  }

  const client = createClient(url, anonKey)
  const { data, error } = await client.auth.getUser(token)

  if (error || !data.user) {
    res.status(401).json({ error: "Invalid or expired session" })
    return null
  }

  return data.user
}
