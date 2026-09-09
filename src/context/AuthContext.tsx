import { createContext, useContext, type ReactNode } from "react"
import { useLocalStorage } from "../hooks/useLocalStorage"
import { useToast } from "./ToastContext"

export interface User {
  name: string
  email: string
}

interface AuthContextValue {
  user: User | null
  login: (email: string, name?: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useLocalStorage<User | null>("roamly:user", null)
  const { showToast } = useToast()

  const login = (email: string, name?: string) => {
    setUser({ name: name || email.split("@")[0], email })
    showToast(`Welcome${name ? `, ${name}` : ""}!`)
  }

  const logout = () => {
    setUser(null)
    showToast("Signed out", "info")
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
