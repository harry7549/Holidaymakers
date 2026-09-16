import type { VercelRequest, VercelResponse } from "@vercel/node"
import { supabaseAdmin } from "../_lib/supabaseAdmin"
import { requireAdmin } from "../_lib/requireAdmin"

const BUCKET = "page-images"
const MAX_BYTES = 3 * 1024 * 1024 // 3MB raw — keeps the base64 body under Vercel's 4.5MB request cap

let bucketReady = false

async function ensureBucket() {
  if (bucketReady) return
  const { data } = await supabaseAdmin.storage.getBucket(BUCKET)
  if (!data) {
    const { error } = await supabaseAdmin.storage.createBucket(BUCKET, { public: true, fileSizeLimit: MAX_BYTES })
    // Ignore a race where another request created it first.
    if (error && !/already exists/i.test(error.message)) throw error
  }
  bucketReady = true
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const admin = await requireAdmin(req, res)
  if (!admin) return

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  try {
    const { filename, contentType, dataBase64 } = req.body ?? {}
    if (!filename || !contentType || !dataBase64) {
      res.status(400).json({ error: "Missing filename, contentType or dataBase64" })
      return
    }
    if (typeof contentType !== "string" || !contentType.startsWith("image/")) {
      res.status(400).json({ error: "Only image uploads are allowed" })
      return
    }

    const buffer = Buffer.from(dataBase64, "base64")
    if (buffer.byteLength > MAX_BYTES) {
      res.status(400).json({ error: "Image is larger than 3MB" })
      return
    }

    await ensureBucket()

    const ext = (String(filename).split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg"
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    const { error: uploadErr } = await supabaseAdmin.storage.from(BUCKET).upload(path, buffer, {
      contentType,
      upsert: false,
    })
    if (uploadErr) throw uploadErr

    const { data: publicUrlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path)
    res.status(201).json({ url: publicUrlData.publicUrl })
  } catch (err) {
    console.error(err)
    const message = err instanceof Error ? err.message : "Upload failed"
    res.status(500).json({ error: message })
  }
}
