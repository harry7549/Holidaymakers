import { useEffect, useRef, useState } from "react"
import { MessageSquare, Send, X } from "lucide-react"
import { supabaseCustomer } from "../lib/supabaseClient"
import { useLocalStorage } from "../hooks/useLocalStorage"
import { useAuth } from "../context/AuthContext"
import { cn } from "../lib/utils"

interface ChatMessage {
  id: string
  session_id: string
  sender: "visitor" | "admin"
  body: string
  created_at: string
}

/** Floating live-chat widget. A random session id (persisted per browser) stands in for
 * visitor identity — no login required — and Supabase Realtime Broadcast delivers admin
 * replies instantly to whichever tab has the widget open. */
export function ChatWidget() {
  const { user } = useAuth()
  const [sessionId, setSessionId] = useLocalStorage<string | null>("roamly:chat-session", null)
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [unread, setUnread] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sessionId) return
    fetch(`/api/chat?sessionId=${sessionId}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => Array.isArray(rows) && setMessages(rows))
      .catch(() => {})
  }, [sessionId])

  useEffect(() => {
    if (!sessionId) return
    const channel = supabaseCustomer
      .channel(`chat:${sessionId}`)
      .on("broadcast", { event: "message" }, ({ payload }) => {
        const msg = payload as ChatMessage
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
        if (msg.sender === "admin" && !open) setUnread(true)
      })
      .subscribe()
    return () => {
      supabaseCustomer.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages, open])

  useEffect(() => {
    if (open) setUnread(false)
  }, [open])

  const send = async () => {
    const text = draft.trim()
    if (!text || sending) return
    setSending(true)
    setDraft("")
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, name: user?.name, email: user?.email, message: text }),
      })
      const data = await res.json()
      if (!sessionId && data.sessionId) setSessionId(data.sessionId)
      if (data.message) setMessages((prev) => (prev.some((m) => m.id === data.message.id) ? prev : [...prev, data.message]))
    } catch {
      setDraft(text)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed bottom-20 left-4 z-40 sm:bottom-6 sm:left-6">
      {open && (
        <div className="mb-3 flex h-[420px] w-[min(90vw,340px)] flex-col overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-lift">
          <div className="flex items-center justify-between bg-ocean-600 px-4 py-3">
            <p className="text-sm font-bold text-white">Chat with Roamly</p>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
              <X size={16} />
            </button>
          </div>
          <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto p-3">
            {messages.length === 0 && (
              <p className="mt-6 text-center text-xs text-ocean-950/40">Send us a message — a real trip expert usually replies within minutes during business hours.</p>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                  m.sender === "visitor" ? "ml-auto bg-ocean-600 text-white" : "bg-sand-100 text-ocean-950",
                )}
              >
                {m.body}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 border-t border-sand-200 p-2.5">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message..."
              className="flex-1 rounded-full border border-sand-200 px-3.5 py-2 text-sm outline-none focus:border-ocean-400"
            />
            <button
              onClick={send}
              disabled={!draft.trim() || sending}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ocean-600 text-white disabled:opacity-40"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open chat"
        className="relative flex h-[52px] w-[52px] items-center justify-center rounded-full bg-ocean-600 text-white shadow-lift transition-all hover:scale-110"
      >
        {open ? <X size={22} /> : <MessageSquare size={22} />}
        {unread && !open && <span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-sunset-500 ring-2 ring-white" />}
      </button>
    </div>
  )
}
