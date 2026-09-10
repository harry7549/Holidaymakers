import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { Compass } from "lucide-react"
import { supabase, supabaseConfigured } from "../lib/supabaseClient"
import { mapDealRow, mapDestinationRow, mapPackageRow, mapSupplierRow } from "../lib/mappers"
import type { Deal, Destination, Package, Supplier } from "../data/types"
import { packages as staticPackages } from "../data/packages"
import { destinations as staticDestinations } from "../data/destinations"
import { suppliers as staticSuppliers } from "../data/suppliers"
import { deals as staticDeals } from "../data/testimonials"

interface CatalogData {
  packages: Package[]
  destinations: Destination[]
  suppliers: Supplier[]
  deals: Deal[]
}

interface CatalogContextValue extends CatalogData {
  usingLiveData: boolean
  refresh: () => void
}

const CatalogContext = createContext<CatalogContextValue | undefined>(undefined)

const staticFallback: CatalogData = {
  packages: staticPackages,
  destinations: staticDestinations,
  suppliers: staticSuppliers,
  deals: staticDeals,
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CatalogData | null>(null)
  const [usingLiveData, setUsingLiveData] = useState(false)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!supabaseConfigured) {
        if (!cancelled) {
          setData(staticFallback)
          setUsingLiveData(false)
        }
        return
      }

      try {
        const [destRes, supRes, pkgRes, dealRes] = await Promise.all([
          supabase.from("destinations").select("*"),
          supabase.from("suppliers").select("*"),
          supabase.from("packages").select("*"),
          supabase.from("deals").select("*"),
        ])

        if (destRes.error) throw destRes.error
        if (supRes.error) throw supRes.error
        if (pkgRes.error) throw pkgRes.error
        if (dealRes.error) throw dealRes.error

        if (!cancelled) {
          setData({
            destinations: destRes.data.map(mapDestinationRow),
            suppliers: supRes.data.map(mapSupplierRow),
            packages: pkgRes.data.map(mapPackageRow),
            deals: dealRes.data.map(mapDealRow),
          })
          setUsingLiveData(true)
        }
      } catch (err) {
        console.error("Failed to load catalogue from Supabase — falling back to demo data.", err)
        if (!cancelled) {
          setData(staticFallback)
          setUsingLiveData(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [nonce])

  if (!data) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-sand-50">
        <Compass size={32} className="animate-spin text-ocean-600" style={{ animationDuration: "1.6s" }} />
      </div>
    )
  }

  return (
    <CatalogContext.Provider value={{ ...data, usingLiveData, refresh: () => setNonce((n) => n + 1) }}>
      {children}
    </CatalogContext.Provider>
  )
}

export function useCatalog() {
  const ctx = useContext(CatalogContext)
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider")
  return ctx
}
