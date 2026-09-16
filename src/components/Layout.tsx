import { Outlet } from "react-router-dom"
import { Navbar } from "./Navbar"
import { Footer } from "./Footer"
import { MobileBottomNav } from "./MobileBottomNav"
import { WhatsAppButton } from "./WhatsAppButton"
import { CompareBar } from "./CompareBar"
import { SmoothScroll } from "./SmoothScroll"

export function Layout() {
  return (
    <div className="flex min-h-svh flex-col bg-sand-50">
      <SmoothScroll />
      <Navbar />
      <main className="flex-1 pb-16 sm:pb-0">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <CompareBar />
      <MobileBottomNav />
    </div>
  )
}
