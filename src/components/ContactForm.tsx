import { useState, type FormEvent } from "react"
import { useToast } from "../context/ToastContext"

export function ContactForm() {
  const { showToast } = useToast()
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })
  const [sending, setSending] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      showToast("Please fill in all required fields", "info")
      return
    }
    setSending(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      showToast("Message sent! Our team will respond within 24 hours.")
      setForm({ name: "", email: "", subject: "", message: "" })
    } catch {
      showToast("Could not send your message — please try again", "info")
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl space-y-3 rounded-2xl border border-sand-200 bg-white p-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          placeholder="Your name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-lg border border-sand-200 px-4 py-2.5 text-sm outline-none focus:border-ocean-400"
        />
        <input
          type="email"
          placeholder="Your email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-lg border border-sand-200 px-4 py-2.5 text-sm outline-none focus:border-ocean-400"
        />
      </div>
      <input
        placeholder="Subject"
        value={form.subject}
        onChange={(e) => setForm({ ...form, subject: e.target.value })}
        className="w-full rounded-lg border border-sand-200 px-4 py-2.5 text-sm outline-none focus:border-ocean-400"
      />
      <textarea
        placeholder="How can we help?"
        rows={5}
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        className="w-full rounded-lg border border-sand-200 px-4 py-2.5 text-sm outline-none focus:border-ocean-400"
      />
      <button
        type="submit"
        disabled={sending}
        className="w-full rounded-full bg-ocean-600 py-3 text-sm font-bold text-white hover:bg-ocean-700 disabled:opacity-60"
      >
        {sending ? "Sending..." : "Send Message"}
      </button>
    </form>
  )
}
