import { createClient } from "@supabase/supabase-js"

const url = process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.warn("Supabase is not configured: set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your Vercel project's Environment Variables.")
}

// Server-only client using the service-role key, which bypasses Row Level
// Security entirely. Never import this file from anything that ships to
// the browser.
export const supabaseAdmin = createClient(url || "https://placeholder.supabase.co", serviceKey || "placeholder-service-key", {
  auth: { persistSession: false },
})
