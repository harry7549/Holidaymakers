import { useState } from "react"
import { Link } from "react-router-dom"
import { BadgeCheck, Bell, Calendar, Mail, MessageSquare, Sparkles, type LucideIcon } from "lucide-react"
import { useAdminNotifications, type NotificationSource } from "../../context/AdminNotificationsContext"
import { formatDate } from "../../lib/utils"

const SOURCE_ICON: Record<NotificationSource, LucideIcon> = {
  bookings: Calendar,
  quotes: Sparkles,
  messages: Mail,
  "supplier-applications": BadgeCheck,
  chat: MessageSquare,
}

export function AdminNotificationBell() {
  const { items, totalCount, markSeen, dismissAll } = useAdminNotifications()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative rounded-xl p-2 text-ocean-950/60 hover:bg-sand-100 hover:text-ocean-950"
      >
        <Bell size={18} />
        {totalCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-sunset-500 px-1 text-[10px] font-bold text-white">
            {totalCount > 9 ? "9+" : totalCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 max-h-[70vh] w-80 overflow-y-auto rounded-2xl border border-sand-200 bg-surface shadow-lift">
            <div className="sticky top-0 flex items-center justify-between border-b border-sand-100 bg-surface px-4 py-3">
              <p className="text-sm font-bold text-ocean-950">Notifications {totalCount > 0 && `(${totalCount})`}</p>
              {items.length > 0 && (
                <button onClick={dismissAll} className="text-xs font-semibold text-ocean-600 hover:text-ocean-700">
                  Dismiss all
                </button>
              )}
            </div>
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-ocean-950/40">You're all caught up.</p>
            ) : (
              <div className="divide-y divide-sand-100">
                {items.map((item) => {
                  const Icon = SOURCE_ICON[item.source] ?? Bell
                  return (
                    <Link
                      key={`${item.source}-${item.id}`}
                      to={item.href}
                      onClick={() => {
                        markSeen(item)
                        setOpen(false)
                      }}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-sand-50"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ocean-50 text-ocean-600">
                        <Icon size={14} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ocean-950">{item.title}</p>
                        <p className="truncate text-xs text-ocean-950/60">{item.subtitle}</p>
                        <p className="mt-0.5 text-[10px] text-ocean-950/40">{formatDate(item.createdAt)}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
