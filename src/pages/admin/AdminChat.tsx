import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { MessageSquare, Send } from "lucide-react"
import { AdminPageHeader, AdminEmptyState, AdminSkeletonLines } from "../../components/admin/AdminUI"
import { adminListChatMessages, adminListChatSessions, adminSendChatReply } from "../../lib/adminApi"
import { supabase } from "../../lib/supabaseClient"
import { formatDate } from "../../lib/utils"
import { cn } from "../../lib/utils"

interface ChatSession {
  id: string
  visitor_name: string
  visitor_email: string
  status: "open" | "closed"
  geo_city: string
  geo_country: string
  last_message_at: string
  seen_by_admin: boolean
}

interface ChatMessage {
  id: string
  session_id: string
  sender: "visitor" | "admin"
  body: string
  created_at: string
}

export default function AdminChat() {
  const [searchParams] = useSearchParams()
  const [sessions, setSessions] = useState<ChatSession[] | null>(null)
  const [activeId, setActiveId] = useState<string | null>(searchParams.get("session"))
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const loadSessions = () => adminListChatSessions<ChatSession[]>().then(setSessions).catch(() => setSessions([]))

  useEffect(() => {
    loadSessions()
    const interval = setInterval(loadSessions, 15000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!activeId) return
    adminListChatMessages<ChatMessage[]>(activeId).then(setMessages).catch(() => setMessages([]))

    const channel = supabase
      .channel(`chat:${activeId}`)
      .on("broadcast", { event: "message" }, ({ payload }) => {
        const msg = payload as ChatMessage
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeId])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages])

  const send = async () => {
    const text = draft.trim()
    if (!text || !activeId || sending) return
    setSending(true)
    setDraft("")
    try {
      const msg = await adminSendChatReply<ChatMessage>(activeId, text)
      setMessages((prev) => [...prev, msg])
    } finally {
      setSending(false)
    }
  }

  const active = sessions?.find((s) => s.id === activeId)

  return (
    <div>
      <AdminPageHeader icon={MessageSquare} title="Live Chat" subtitle="Reply to visitors chatting from the site right now" />

      {sessions === null ? (
        <AdminSkeletonLines count={4} />
      ) : sessions.length === 0 ? (
        <AdminEmptyState label="No chat conversations yet." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="space-y-1.5 rounded-2xl border border-sand-200 bg-surface p-2">
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={cn(
                  "flex w-full flex-col items-start gap-0.5 rounded-xl px-3 py-2.5 text-left",
                  activeId === s.id ? "bg-ocean-50" : "hover:bg-sand-50",
                )}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-ocean-950">{s.visitor_name || "Anonymous visitor"}</p>
                  {!s.seen_by_admin && <span className="h-2 w-2 shrink-0 rounded-full bg-sunset-500" />}
                </div>
                <p className="truncate text-xs text-ocean-950/50">
                  {[s.geo_city, s.geo_country].filter(Boolean).join(", ") || "Unknown location"} · {formatDate(s.last_message_at)}
                </p>
              </button>
            ))}
          </div>

          <div className="flex h-[520px] flex-col rounded-2xl border border-sand-200 bg-surface">
            {!active ? (
              <div className="flex flex-1 items-center justify-center text-sm text-ocean-950/40">Select a conversation</div>
            ) : (
              <>
                <div className="border-b border-sand-200 px-4 py-3">
                  <p className="text-sm font-bold text-ocean-950">{active.visitor_name || "Anonymous visitor"}</p>
                  <p className="text-xs text-ocean-950/50">{active.visitor_email || "No email captured"}</p>
                </div>
                <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto p-4">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "max-w-[70%] rounded-2xl px-3.5 py-2 text-sm",
                        m.sender === "admin" ? "ml-auto bg-ocean-600 text-white" : "bg-sand-100 text-ocean-950",
                      )}
                    >
                      {m.body}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 border-t border-sand-200 p-3">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Type a reply..."
                    className="flex-1 rounded-full border border-sand-200 px-4 py-2.5 text-sm outline-none focus:border-ocean-400"
                  />
                  <button
                    onClick={send}
                    disabled={!draft.trim() || sending}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ocean-600 text-white disabled:opacity-40"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
