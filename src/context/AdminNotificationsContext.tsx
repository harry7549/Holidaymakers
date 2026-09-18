import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react"
import { useAdminResource } from "../hooks/useAdminResource"
import { adminUpdate, adminMarkChatSeen } from "../lib/adminApi"

export type NotificationSource = "bookings" | "quotes" | "messages" | "supplier-applications" | "chat"

export interface NotificationItem {
  id: string
  source: NotificationSource
  title: string
  subtitle: string
  createdAt: string
  href: string
}

interface BookingRow {
  id: string
  package_title: string
  contact_email: string
  seen_by_admin: boolean
  created_at: string
}
interface QuoteRow {
  id: string
  name: string
  destinations: string[]
  seen_by_admin: boolean
  created_at: string
}
interface MessageRow {
  id: string
  name: string
  subject: string
  status: string
  created_at: string
}
interface ApplicationRow {
  id: string
  business: string
  contact: string
  seen_by_admin: boolean
  created_at: string
}
interface ChatSessionRow {
  id: string
  visitor_name: string
  seen_by_admin: boolean
  last_message_at: string
}

interface NotificationsContextValue {
  items: NotificationItem[]
  countBySource: Record<NotificationSource, number>
  totalCount: number
  markSeen: (item: NotificationItem) => void
  dismissAll: () => void
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined)

export function AdminNotificationsProvider({ children }: { children: ReactNode }) {
  const { items: bookings, setItems: setBookings } = useAdminResource<BookingRow>("bookings")
  const { items: quotes, setItems: setQuotes } = useAdminResource<QuoteRow>("quotes")
  const { items: messages, setItems: setMessages } = useAdminResource<MessageRow>("messages")
  const { items: applications, setItems: setApplications } = useAdminResource<ApplicationRow>("supplier-applications")
  const { items: chatSessions, setItems: setChatSessions } = useAdminResource<ChatSessionRow>("chat")

  const items = useMemo<NotificationItem[]>(() => {
    const list: NotificationItem[] = []
    for (const b of bookings) {
      if (b.seen_by_admin) continue
      list.push({ id: b.id, source: "bookings", title: b.contact_email, subtitle: `New booking · ${b.package_title}`, createdAt: b.created_at, href: "/admin/bookings" })
    }
    for (const q of quotes) {
      if (q.seen_by_admin) continue
      list.push({
        id: q.id,
        source: "quotes",
        title: q.name,
        subtitle: `New quote request · ${(q.destinations ?? []).join(", ") || "Custom trip"}`,
        createdAt: q.created_at,
        href: "/admin/quotes",
      })
    }
    for (const m of messages) {
      if (m.status !== "new") continue
      list.push({ id: m.id, source: "messages", title: m.name, subtitle: `New message · ${m.subject || "(No subject)"}`, createdAt: m.created_at, href: "/admin/messages" })
    }
    for (const a of applications) {
      if (a.seen_by_admin) continue
      list.push({
        id: a.id,
        source: "supplier-applications",
        title: a.contact,
        subtitle: `New partner application · ${a.business}`,
        createdAt: a.created_at,
        href: "/admin/supplier-applications",
      })
    }
    for (const c of chatSessions) {
      if (c.seen_by_admin) continue
      list.push({
        id: c.id,
        source: "chat",
        title: c.visitor_name || "Anonymous visitor",
        subtitle: "New live chat message",
        createdAt: c.last_message_at,
        href: `/admin/chat?session=${c.id}`,
      })
    }
    return list.sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime())
  }, [bookings, quotes, messages, applications, chatSessions])

  const countBySource = useMemo(() => {
    const map: Record<NotificationSource, number> = { bookings: 0, quotes: 0, messages: 0, "supplier-applications": 0, chat: 0 }
    for (const i of items) map[i.source] += 1
    return map
  }, [items])

  const markSeen = useCallback(
    async (item: NotificationItem) => {
      try {
        if (item.source === "messages") {
          await adminUpdate("messages", item.id, { status: "read" })
          setMessages((prev) => prev.map((m) => (m.id === item.id ? { ...m, status: "read" } : m)))
        } else if (item.source === "chat") {
          await adminMarkChatSeen(item.id)
          setChatSessions((prev) => prev.map((c) => (c.id === item.id ? { ...c, seen_by_admin: true } : c)))
        } else {
          await adminUpdate(item.source, item.id, { seen_by_admin: true })
          if (item.source === "bookings") setBookings((prev) => prev.map((b) => (b.id === item.id ? { ...b, seen_by_admin: true } : b)))
          if (item.source === "quotes") setQuotes((prev) => prev.map((q) => (q.id === item.id ? { ...q, seen_by_admin: true } : q)))
          if (item.source === "supplier-applications") setApplications((prev) => prev.map((a) => (a.id === item.id ? { ...a, seen_by_admin: true } : a)))
        }
      } catch {
        // Best-effort — if this fails the item just stays in the list, no need to surface an error for a read-receipt.
      }
    },
    [setBookings, setQuotes, setMessages, setApplications, setChatSessions],
  )

  const dismissAll = useCallback(() => {
    for (const item of items) markSeen(item)
  }, [items, markSeen])

  const value: NotificationsContextValue = { items, countBySource, totalCount: items.length, markSeen, dismissAll }

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export function useAdminNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error("useAdminNotifications must be used within AdminNotificationsProvider")
  return ctx
}
