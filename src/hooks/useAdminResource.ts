import { useCallback, useEffect, useState } from "react"
import { adminList } from "../lib/adminApi"

export function useAdminResource<T>(resource: string) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminList<T[]>(resource)
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }, [resource])

  useEffect(() => {
    reload()
  }, [reload])

  return { items, setItems, loading, error, reload }
}
