/**
 * Sends a WhatsApp message via the WhatsApp Business Cloud API. Requires a
 * real Meta Business/WhatsApp Business account — WHATSAPP_PHONE_NUMBER_ID
 * and WHATSAPP_API_TOKEN aren't set up yet, so this currently no-ops (logs
 * and returns) rather than sending anything. Once those env vars are added
 * in Vercel, booking confirmations will start sending automatically with no
 * other code changes needed.
 *
 * Never throws — a WhatsApp failure must never block a booking.
 */
export async function sendWhatsAppMessage(params: { to: string; templateParams: string[] }): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const token = process.env.WHATSAPP_API_TOKEN
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME || "booking_confirmation"

  if (!phoneNumberId || !token) {
    console.log("[whatsapp] Skipped — WHATSAPP_PHONE_NUMBER_ID/WHATSAPP_API_TOKEN not configured.")
    return
  }

  const to = params.to.replace(/[^\d+]/g, "")
  if (!to) return

  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: "en" },
          components: [{ type: "body", parameters: params.templateParams.map((text) => ({ type: "text", text })) }],
        },
      }),
    })
    if (!res.ok) {
      console.error("[whatsapp] Send failed", res.status, await res.text().catch(() => ""))
    }
  } catch (err) {
    console.error("[whatsapp] Send failed", err)
  }
}

/** Sends the booking-confirmation WhatsApp message — customer name, package title, booking id, in that order. */
export function sendBookingConfirmationWhatsApp(input: { phone: string; customerName: string; packageTitle: string; bookingId: string }): void {
  // Fire-and-forget: never awaited by the caller, so a slow or failing
  // WhatsApp API call can't delay or break the booking response.
  sendWhatsAppMessage({
    to: input.phone,
    templateParams: [input.customerName || "Traveler", input.packageTitle, input.bookingId],
  }).catch(() => {})
}
