import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { Destination } from "../data/types"
import { formatPrice } from "../lib/utils"

const pinIcon = L.divIcon({
  className: "",
  html: `<div style="width:30px;height:30px;border-radius:50% 50% 50% 0;background:#0284c7;transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -28],
})

/** A lightweight Leaflet + OpenStreetMap view of destinations — no API key needed. Managed
 * imperatively (not react-leaflet) to avoid any React 19 compatibility questions. */
export function DestinationsMap({ destinations }: { destinations: Destination[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.LayerGroup | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView([15, 80], 3)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map)
    markersRef.current = L.layerGroup().addTo(map)
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const layer = markersRef.current
    if (!map || !layer) return
    layer.clearLayers()

    const withCoords = destinations.filter((d) => d.lat != null && d.lng != null)
    for (const d of withCoords) {
      const marker = L.marker([d.lat!, d.lng!], { icon: pinIcon }).addTo(layer)
      const popupEl = document.createElement("div")
      popupEl.className = "text-sm"
      popupEl.innerHTML = `
        <p class="font-bold text-ocean-950 mb-0.5">${d.name}</p>
        <p class="text-xs text-ocean-950/60 mb-1.5">${d.tagline}</p>
        <p class="text-xs font-semibold text-ocean-950">From ${formatPrice(d.fromPrice)}</p>
      `
      const button = document.createElement("button")
      button.textContent = "View destination →"
      button.className = "mt-2 text-xs font-bold text-ocean-700"
      button.onclick = () => navigate(`/destinations/${d.id}`)
      popupEl.appendChild(button)
      marker.bindPopup(popupEl)
    }

    if (withCoords.length > 0) {
      const bounds = L.latLngBounds(withCoords.map((d) => [d.lat!, d.lng!] as [number, number]))
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 6 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinations])

  return <div ref={containerRef} className="h-[520px] w-full overflow-hidden rounded-2xl border border-sand-200" />
}
