import type { ReactNode } from "react"
import { Navbar } from "./Navbar"
import { Footer } from "./Footer"
import { MobileBottomNav } from "./MobileBottomNav"
import { WhatsAppButton } from "./WhatsAppButton"
import { CompareBar } from "./CompareBar"

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-sand-50">
      <Navbar />
      <main className="flex-1 pb-16 sm:pb-0">{children}</main>
      <Footer />
      <WhatsAppButton />
      <CompareBar />
      <MobileBottomNav />
    </div>
  )
}
