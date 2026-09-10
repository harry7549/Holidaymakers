import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { Compass } from "lucide-react"
import { useAdminAuth } from "../context/AdminAuthContext"

export function AdminGuard({ children }: { children: ReactNode }) {
  const { session, loading } = useAdminAuth()

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-sand-50">
        <Compass size={28} className="animate-spin text-ocean-600" style={{ animationDuration: "1.6s" }} />
      </div>
    )
  }

  if (!session) return <Navigate to="/admin/login" replace />

  return <>{children}</>
}
