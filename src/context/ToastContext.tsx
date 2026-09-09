import { createContext, useCallback, useContext, useState, type ReactNode } from "react"
import { CheckCircle2, Info, X } from "lucide-react"

interface Toast {
  id: number
  message: string
  type: "success" | "info"
}

interface ToastContextValue {
  showToast: (message: string, type?: Toast["type"]) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

let idCounter = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = ++idCounter
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3200)
  }, [])

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 sm:bottom-6 sm:right-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-fade-up flex items-center gap-2 rounded-xl border border-sand-200 bg-white px-4 py-3 shadow-lift text-sm font-medium text-ocean-950 max-w-xs"
          >
            {t.type === "success" ? (
              <CheckCircle2 size={18} className="shrink-0 text-ocean-500" />
            ) : (
              <Info size={18} className="shrink-0 text-sunset-500" />
            )}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="text-ocean-950/40 hover:text-ocean-950">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}
