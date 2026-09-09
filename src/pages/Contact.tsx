import { useState, type FormEvent } from "react"
import { ChevronDown, Mail, MapPin, MessageCircle, Phone } from "lucide-react"
import { useToast } from "../context/ToastContext"
import { cn } from "../lib/utils"

const faqs = [
  { q: "How do I modify or cancel a booking?", a: "Go to My Trips in your dashboard and select the booking — you can request changes or cancellation there, or reach us on WhatsApp for faster help." },
  { q: "Do you offer EMI or installment payments?", a: "Yes, select 'Pay 20% Now, Rest Later' at checkout for eligible packages, or ask your trip expert about EMI options." },
  { q: "Is my payment information secure?", a: "Yes. All payments are processed through PCI-compliant, encrypted payment gateways. We never store your card details." },
  { q: "Can I talk to a real person before booking?", a: "Absolutely — use the contact form here, call us, or message us on WhatsApp any time." },
]

export default function Contact() {
  const { showToast } = useToast()
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      showToast("Please fill in all required fields", "info")
      return
    }
    showToast("Message sent! Our team will respond within 24 hours.")
    setForm({ name: "", email: "", subject: "", message: "" })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="font-display text-2xl font-bold text-ocean-950 sm:text-3xl">Get in Touch</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-ocean-950/60">
          Questions about a booking, a custom trip, or becoming a supplier? We're here to help.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <a href="tel:+919876543210" className="flex items-center gap-4 rounded-2xl border border-sand-200 bg-white p-5 hover:border-ocean-300">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ocean-50 text-ocean-600">
              <Phone size={19} />
            </span>
            <div>
              <p className="text-sm font-semibold text-ocean-950">Call Us</p>
              <p className="text-sm text-ocean-950/60">+91 98765 43210</p>
            </div>
          </a>
          <a href="mailto:hello@roamly.travel" className="flex items-center gap-4 rounded-2xl border border-sand-200 bg-white p-5 hover:border-ocean-300">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ocean-50 text-ocean-600">
              <Mail size={19} />
            </span>
            <div>
              <p className="text-sm font-semibold text-ocean-950">Email Us</p>
              <p className="text-sm text-ocean-950/60">hello@roamly.travel</p>
            </div>
          </a>
          <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="flex items-center gap-4 rounded-2xl border border-sand-200 bg-white p-5 hover:border-ocean-300">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ocean-50 text-ocean-600">
              <MessageCircle size={19} />
            </span>
            <div>
              <p className="text-sm font-semibold text-ocean-950">WhatsApp</p>
              <p className="text-sm text-ocean-950/60">Chat with us instantly</p>
            </div>
          </a>
          <div className="flex items-center gap-4 rounded-2xl border border-sand-200 bg-white p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ocean-50 text-ocean-600">
              <MapPin size={19} />
            </span>
            <div>
              <p className="text-sm font-semibold text-ocean-950">Head Office</p>
              <p className="text-sm text-ocean-950/60">Bandra Kurla Complex, Mumbai, India</p>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3 rounded-2xl border border-sand-200 bg-white p-6">
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
          <button type="submit" className="w-full rounded-full bg-ocean-600 py-3 text-sm font-bold text-white hover:bg-ocean-700">
            Send Message
          </button>
        </form>
      </div>

      <div className="mx-auto mt-16 max-w-3xl">
        <h2 className="mb-6 text-center font-display text-xl font-bold text-ocean-950">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={faq.q} className="rounded-xl border border-sand-200">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-semibold text-ocean-950"
              >
                {faq.q}
                <ChevronDown size={16} className={cn("shrink-0 transition-transform", openFaq === i && "rotate-180")} />
              </button>
              {openFaq === i && <p className="px-4 pb-4 text-sm text-ocean-950/70">{faq.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
