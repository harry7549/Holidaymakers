import { supabase } from "./supabaseClient"

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function parseErrorOr<T>(res: Response, fallback: string): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || fallback)
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
