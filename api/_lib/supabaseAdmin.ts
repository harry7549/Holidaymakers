import { createClient } from "@supabase/supabase-js"

const url = process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.warn("Supabase is not configured: set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your Vercel project's Environment Variables.")
}

// Server-only client using the service-role key, which bypasses Row Level
// Security entirely. Never import this file from anything that ships to
// the browser.
//
// createClient() runs at module load time (import), before any request
// handler's own try/catch exists to protect it — if either env var holds a
// malformed value (e.g. a bad URL), createClient() throws synchronously and
// crashes the whole serverless function's cold start with no useful error,
// which every route importing this file would then hit. Wrap it so a bad
// value degrades to a client that fails normally inside request handling
// instead of taking the function down before it can even run.
function createSupabaseAdmin() {
  try {
    return createClient(url || "https://placeholder.supabase.co", serviceKey || "placeholder-service-key", {
      auth: { persistSession: false },
    })
  } catch (err) {
    console.error("Failed to create the Supabase admin client — check VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for malformed values:", err)
    return createClient("https://placeholder.supabase.co", "placeholder-service-key", { auth: { persistSession: false } })
  }
}

export const supabaseAdmin = createSupabaseAdmin()
