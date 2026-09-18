import { supabase } from "./supabaseClient"

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function parseErrorOr<T>(res: Response, fallback: string): Promise<T> {
  if (!res.ok) {
    const raw = await res.text().catch(() => "")
    let detail = ""
    try {
      detail = JSON.parse(raw)?.error || ""
    } catch {
      detail = raw.trim().slice(0, 200)
    }
    throw new Error(detail ? `${fallback}: ${detail}` : `${fallback} (HTTP ${res.status})`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export async function adminList<T>(resource: string): Promise<T> {
  const headers = await authHeaders()
  const res = await fetch(`/api/admin/${resource}`, { headers })
  return parseErrorOr<T>(res, `Failed to load ${resource}`)
}

export async function adminCreate<T>(resource: string, body: unknown): Promise<T> {
  const headers = await authHeaders()
  const res = await fetch(`/api/admin/${resource}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  })
  return parseErrorOr<T>(res, `Failed to create ${resource}`)
}

export async function adminUpdate<T>(resource: string, id: string, body: unknown): Promise<T> {
  const headers = await authHeaders()
  const res = await fetch(`/api/admin/${resource}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  })
  return parseErrorOr<T>(res, `Failed to update ${resource}`)
}

export async function adminDelete(resource: string, id: string): Promise<void> {
  const headers = await authHeaders()
  const res = await fetch(`/api/admin/${resource}/${id}`, { method: "DELETE", headers })
  await parseErrorOr<void>(res, `Failed to delete ${resource}`)
}

export async function adminReorder(resource: string, ids: string[]): Promise<void> {
  const headers = await authHeaders()
  const res = await fetch(`/api/admin/${resource}/reorder`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ ids }),
  })
  await parseErrorOr<void>(res, `Failed to reorder ${resource}`)
}

export async function adminBulkImport(resource: string, rows: unknown[]): Promise<{ imported: number }> {
  const headers = await authHeaders()
  const res = await fetch(`/api/admin/${resource}/bulk-import`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ rows }),
  })
  return parseErrorOr<{ imported: number }>(res, `Failed to import ${resource}`)
}

export async function adminGetSettings(): Promise<{ key: string; value: Record<string, unknown> }[]> {
  const headers = await authHeaders()
  const res = await fetch("/api/admin/settings", { headers })
  return parseErrorOr(res, "Failed to load settings")
}

export async function adminPutSetting(key: string, value: object): Promise<void> {
  const headers = await authHeaders()
  const res = await fetch("/api/admin/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ key, value }),
  })
  await parseErrorOr<void>(res, "Failed to save setting")
}

export async function adminListChatSessions<T>(): Promise<T> {
  const headers = await authHeaders()
  const res = await fetch("/api/admin/chat", { headers })
  return parseErrorOr<T>(res, "Failed to load chat sessions")
}

export async function adminListChatMessages<T>(sessionId: string): Promise<T> {
  const headers = await authHeaders()
  const res = await fetch(`/api/admin/chat?sessionId=${sessionId}`, { headers })
  return parseErrorOr<T>(res, "Failed to load chat messages")
}

export async function adminSendChatReply<T>(sessionId: string, message: string): Promise<T> {
  const headers = await authHeaders()
  const res = await fetch("/api/admin/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ sessionId, message }),
  })
  return parseErrorOr<T>(res, "Failed to send reply")
}

export async function adminMarkChatSeen(sessionId: string): Promise<void> {
  const headers = await authHeaders()
  const res = await fetch("/api/admin/chat", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ sessionId, seenByAdmin: true }),
  })
  await parseErrorOr<void>(res, "Failed to mark chat as seen")
}

export async function adminUploadImage(payload: { filename: string; contentType: string; dataBase64: string }): Promise<{ url: string }> {
  const headers = await authHeaders()
  const res = await fetch(`/api/admin/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(payload),
  })
  return parseErrorOr<{ url: string }>(res, "Failed to upload image")
}
