import type { ReactNode } from "react"
import { ToastProvider } from "./ToastContext"
import { TripProvider } from "./TripContext"
import { AuthProvider } from "./AuthContext"

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <TripProvider>{children}</TripProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
