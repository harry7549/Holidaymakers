import type { ReactNode } from "react"
import { ToastProvider } from "./ToastContext"
import { TripProvider } from "./TripContext"
import { AuthProvider } from "./AuthContext"
import { CatalogProvider } from "./CatalogContext"
import { AdminAuthProvider } from "./AdminAuthContext"

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <TripProvider>
            <CatalogProvider>{children}</CatalogProvider>
          </TripProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
