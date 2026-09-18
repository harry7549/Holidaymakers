import { createClient } from "@supabase/supabase-js"

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabaseConfigured = Boolean(url && anonKey)

// Falls back to a harmless placeholder so the app doesn't crash on load when
// env vars aren't set yet (e.g. first deploy, before Supabase is wired up).
// Callers should check `supabaseConfigured` before relying on real data.
export const supabase = createClient(url || "https://placeholder.supabase.co", anonKey || "placeholder-anon-key")

// A second client, with its own auth storage key, for customer-facing sign-in.
// Admin and customer accounts share the same Supabase Auth users table, so
// this keeps the two sessions from clobbering each other in the same browser
// (e.g. staff testing the public site in one tab and /admin in another).
// Access to /admin is still enforced by the admin_users allowlist table, not
// by which client a session came from — this is purely to avoid session
// collisions, not a security boundary on its own.
export const supabaseCustomer = createClient(url || "https://placeholder.supabase.co", anonKey || "placeholder-anon-key", {
  auth: { storageKey: "roamly-customer-auth" },
})
