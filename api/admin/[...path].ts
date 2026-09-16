import type { VercelRequest, VercelResponse } from "@vercel/node"
import { supabaseAdmin } from "../_lib/supabaseAdmin"
import { requireAdmin } from "../_lib/requireAdmin"

interface ResourceConfig {
  table: string
  // Catalogue resources (packages, destinations, suppliers, deals) allow full
  // CRUD from the admin UI. Inbound resources (bookings, quotes, messages,
  // supplier applications) are created by the public /api routes and can
  // only be read or have their status patched here — never created/deleted.
  writable: boolean
}

const RESOURCES: Record<string, ResourceConfig> = {
  packages: { table: "packages", writable: true },
  destinations: { table: "destinations", writable: true },
  suppliers: { table: "suppliers", writable: true },
  deals: { table: "deals", writable: true },
  "page-blocks": { table: "page_blocks", writable: true },
  "page-meta": { table: "page_meta", writable: true },
  bookings: { table: "bookings", writable: false },
  quotes: { table: "quote_requests", writable: false },
  messages: { table: "contact_messages", writable: false },
  "supplier-applications": { table: "supplier_applications", writable: false },
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const admin = await requireAdmin(req, res)
    if (!admin) return

    const pathParam = req.query.path
    const segments = Array.isArray(pathParam) ? pathParam : pathParam ? [pathParam] : []
    const [resourceName, id] = segments

    const config = resourceName ? RESOURCES[resourceName] : undefined
    if (!config) {
      res.status(404).json({ error: "Unknown resource" })
      return
    }

    const { table, writable } = config

    // Bulk reorder: POST /api/admin/page-blocks/reorder { ids: string[] } —
    // assigns position = index in the given order.
    if (resourceName === "page-blocks" && id === "reorder" && req.method === "POST") {
      const ids: string[] = req.body?.ids ?? []
      for (let i = 0; i < ids.length; i++) {
        const { error } = await supabaseAdmin.from(table).update({ position: i }).eq("id", ids[i])
        if (error) throw error
      }
      res.status(200).json({ ok: true })
      return
    }

    switch (req.method) {
      case "GET": {
        const { data, error } = await supabaseAdmin.from(table).select("*").order("created_at", { ascending: false })
        if (error) throw error
        res.status(200).json(data)
        return
      }

      case "POST": {
        if (!writable) {
          res.status(405).json({ error: "Creating this resource is not allowed here" })
          return
        }
        const { data, error } = await supabaseAdmin.from(table).insert(req.body).select().single()
        if (error) throw error
        res.status(201).json(data)
        return
      }

      case "PATCH":
      case "PUT": {
        if (!id) {
          res.status(400).json({ error: "Missing id in path" })
          return
        }

        // Approving a supplier application promotes it straight into the
        // suppliers table so it shows up in the catalogue immediately.
        if (resourceName === "supplier-applications" && req.body?.status === "approved") {
          const { data: appRow, error: fetchErr } = await supabaseAdmin.from(table).select("*").eq("id", id).single()
          if (fetchErr) throw fetchErr

          const { error: insertErr } = await supabaseAdmin.from("suppliers").insert({
            id: `sup-${Date.now()}`,
            name: appRow.business,
            type: appRow.type,
            location: appRow.city || "Not specified",
            rating: 4.5,
            packages_count: 0,
            verified: false,
            since: new Date().getFullYear(),
            specialty: (appRow.message || "").slice(0, 140),
            logo_initial: (appRow.business || "?").trim().charAt(0).toUpperCase() || "?",
            color: "ocean",
          })
          if (insertErr) throw insertErr
        }

        const { data, error } = await supabaseAdmin.from(table).update(req.body).eq("id", id).select().single()
        if (error) throw error
        res.status(200).json(data)
        return
      }

      case "DELETE": {
        if (!writable) {
          res.status(405).json({ error: "Deleting this resource is not allowed here" })
          return
        }
        if (!id) {
          res.status(400).json({ error: "Missing id in path" })
          return
        }
        const { error } = await supabaseAdmin.from(table).delete().eq("id", id)
        if (error) throw error
        res.status(204).end()
        return
      }

      default:
        res.status(405).json({ error: "Method not allowed" })
    }
  } catch (err) {
    console.error(err)
    const message = err instanceof Error ? err.message : "Internal server error"
    res.status(500).json({ error: message })
  }
}
